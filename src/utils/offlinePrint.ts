import Taro from '@tarojs/taro';
import { userStore } from '../store/user';
import {debuglog, deviceInfo, isEmptyX, is_weixin, notNull, parseQueryString} from './common';
import { api } from './net';

interface ScanResult{
    path:string;
    params:any
}

interface Product{
    attrItems:Array<any>;
    skuItem:Array<any>;
    current:number;
    info:any;
}

interface PrintNum{
    pages: number;
    queue_num: number;
}

class TerminalStatus{

    id:number;
    terminal_code:string;
    status:number;
    status_text:string;
    peripheral_feature:Array<number>;
    currentPrintDoc:PrintNum;
    currentPrintPhoto:PrintNum

    constructor(result:any){
        this.id = result.id;
        this.terminal_code = result.terminal_code;
        this.status = parseInt(result.status+"");
        this.status_text = result.status_text;
        this.currentPrintPhoto = result.photo;
        this.currentPrintDoc = result.doc;
        this.peripheral_feature = result.peripheral_feature;
    }

}
export default class OfflinePrint{
    /**
     * 扫描二维码
     */
    public static scan(type?:string) {
        return new Promise<ScanResult>( (resolve, reject) => {
            Taro.scanCode({
                onlyFromCamera: true,
                scanType:["qrCode"],
                success (res) {
                    if (res.path && res.path.includes("code=yingoo")) {
                        const tmp = res.path.split("?");
                        if (tmp.length==2) {
                            if (tmp[0].includes("pages/")&&tmp[1].includes("id")) {
                                let url = `${res.path}`;
                                if(!isEmptyX(type) && !tmp[1].includes("printtype")){
                                    url = `${res.path}&printtype=${type}`
                                }
                                resolve({
                                    path:url,
                                    params:parseQueryString(url)
                                });
                            } else {
                                reject();
                            }
                        }else {
                            reject();
                        }
                    }else {
                        reject();
                    }
                },
                fail(){
                    reject();
                }
            })
        })
    }

    /**
     * 获取打印机状态
     * @param {string} id
     * @return {*}
     */
    public static terminalStatus(id:string) {
        return new Promise<TerminalStatus>( (resolve, reject) => {
            api("device.terminal/status", {
                terminal_id: id
            }).then((res) => { 
                resolve(new TerminalStatus(res));
            }).catch((e)=>{
                reject(e);
            })
        })
    }
  
    /**
     * 获取产品信息
     * @param {number} id
     * @param {TerminalStatus} terminal
     * @param {string} printtype
     * @return {*}
     */
    public static product(id:number,terminal:TerminalStatus,printtype?:string) {
        return new Promise<Product>( (resolve, reject) => {
            api("app.product/info", {
                id
            }).then((result) => {
                const attrItems = result.attrItems.length > 0 ? result.attrItems[0] : [];
                const skuItem = [];
                let current = 0;
                for (let index = 0; index < attrItems.length; index++) {
                    const element = attrItems[index];
                    const v = element.value.split(",");
                    const sku = v.length > 0 ? v[0].split("#") : [];
                    const tt = sku.filter((s) => terminal.peripheral_feature.indexOf(parseInt(s + "")) > -1);
                    let is = false;
                    element["type"] = v.length > 1 ? v[1] : "";
                    element["disable"] = true;
                    if (tt.length == sku.length) {
                        if (isEmptyX(printtype)){
                            if (skuItem.length == 0) {
                                is = true;
                            }
                        } else{
                            if (element["type"] == printtype) {
                                is = true;
                            }
                        }
                        element["disable"] = false
                        skuItem.push(element)
                    }
                    if (is) {
                        current = index;
                    }
                    if(terminal.status>=109) {
                        is = false;
                        element["disable"] = true;
                    }
                    element["checked"] = is;
                }
                resolve({
                    attrItems,
                    skuItem,
                    current,
                    info:result
                });
            }).catch((err)=>{
                reject(err);
            })
        })
    }
}