import Taro from "@tarojs/taro";
import Rgbaster from "rgbaster";
import {wxColors} from "./wxColor";
import ENV_TYPE = Taro.ENV_TYPE;
import {userStore} from "../store/user";
import moment from "moment";
import { api } from "./net";

export function ossUrl(url: string, type: number) {
    if (!url) {
        return ""
    }
    let u = '';
    switch (type) {
        case 0:
            u = `${url}?x-oss-process=style/s`
            break;
        case 1:
            u = `${url}?x-oss-process=style/m`
            break;
        default:
            u = `${url}?x-oss-process=style/b`
            break;
    }
    return u;
}

export function notNull(val) {
    return val === null || val === "" || val === undefined
}

/**
 * 根据图片宽高获取容器的大小，并非等比缩放
 * @param containerW {number} 容器宽度
 * @param imgW
 * @param imgH
 */
export function getImageSize(containerW: number, imgW: number, imgH: number) {
    if (imgW > containerW) {
        return {width: containerW, height: imgH * containerW / imgW}
    }
    return {width: imgW, height: imgH}
}

export function is_weixin() { //判断是否是微信
    if (process.env.TARO_ENV === 'h5') {
        const ua = navigator.userAgent.toLowerCase();
        return ua.indexOf('micromessenger') != -1;
    }
    return false;
}
export function convertClassName(name:string){
    return process.env.TARO_ENV === 'h5'?name:'~'+name;
}

export interface ListModel {
    list: Array<any>,
    size: number,
    start: number,
    total: number
}

export function debounce(fn, delay) {
    let timeout = null;
    return function () {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            // eslint-disable-next-line prefer-rest-params
            fn.apply(this, arguments);
        }, delay);
    }
}

export function pageTotal(rowCount: number, pageSize: number) {
    if (notNull(rowCount) || notNull(pageSize)) {
        return 0;
    } else {
        if (pageSize != 0 && rowCount % pageSize == 0) {
            return parseInt((rowCount / pageSize).toString())
        }
        if (pageSize != 0 && rowCount % pageSize != 0) {
            return parseInt((rowCount / pageSize).toString()) + 1;
        }
    }
}

/**
 * 是否允许继续分页，返回下一页页码和是否允许分页
 * @param currentPage
 * @param pageTotal
 * @return {page: number, more: boolean}
 */
export function getNextPage(currentPage: number, pageTotal: number) {
    if (notNull(currentPage) || notNull(pageTotal) || (!notNull(pageTotal) && pageTotal === 0)) {
        return {
            page: 0,
            more: false
        }
    } else {
        if (currentPage === pageTotal) {
            return {
                page: pageTotal,
                more: false
            }
        } else {
            return {
                page: currentPage + 1,
                more: true
            }
        }
    }
}

export const jsApiList = [
    'onMenuShareTimeline',
    'onMenuShareAppMessage',
    'onMenuShareQQ',
    'onMenuShareWeibo',
    'chooseWXPay',
];

export const deviceInfo = {
    ...Taro.getSystemInfoSync(),
    env: process.env.TARO_ENV,
    menu: process.env.TARO_ENV !== "h5" ? Taro.getMenuButtonBoundingClientRect() : {} as any
};


/**
 * param {object} 将要转为URL参数字符串的对象
 * key {string} URL参数字符串的前缀
 * encode {boolean} 是否进行URL编码,默认为true
 *
 * @return URL参数字符串
 */
export function urlEncode(param, key?: string, encode = true) {
    if (param == null) return '';
    let paramStr = '';
    const t = typeof (param);
    if (t == 'string' || t == 'number' || t == 'boolean') {
        paramStr += '&' + key + '=' + ((encode == null || encode) ? encodeURIComponent(param) : param);
    } else {
        for (const i in param) {
            const k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : i);
            paramStr += urlEncode(param[i], k, encode);
        }
    }
    return paramStr;
}

export function getURLParamsStr(paramsStr: string) {
    if (!paramsStr) {
        return ""
    }

    return paramsStr.substring(1)
}

/**
 * 序列化地址栏参数, 需从Taro.useRouter() / this.$router取值
 *
 * @return {object}  JSON对象
 */
export function urlDeCode(params) {
    if (Object.keys(params).length === 0) {
        return {}
    }
    try {
        let obj = {};
        for (const key in params) {
            let paramsVal = params[key];
            paramsVal = decodeURIComponent(paramsVal);
            // 可能是数组
            const reg = /\[\S+\]/g;
            if (reg.test(key)) {
                const keyArr = key.split(reg);
                const idxStr = key.match(reg)[0];

                const idx = JSON.parse(idxStr)[0];
                const name = keyArr[0];
                const filed = keyArr[1];

                if (obj[name]) {
                    if (obj[name][idx]) {
                        obj[name][idx][filed] = paramsVal
                    } else {
                        obj[name].push({
                            [filed]: paramsVal
                        })
                    }
                } else {
                    obj = {
                        [name]: []
                    }
                    obj[name].push({
                        [filed]: paramsVal
                    })
                }
            } else {
                obj[key] = paramsVal
            }
        }
        console.log("解析URL为Object：", obj)
        return obj
    } catch (e) {
        console.log("解析URL为Object出错：", e)
        return {}
    }
}

/**
 * 二分法，求区间
 * @param arr {array}  原数组
 * @param findVal  {any}  要找的值
 * @param key  {string}  要对比的字段
 * @param leftIndex {number} 当前下标
 * @param rightIndex  {number}  下一个
 */
export function binarySearch(arr, key, findVal, leftIndex, rightIndex) {
    if (leftIndex > rightIndex) {
        const find = leftIndex - 1

        return find;

    }

    const midIndex = Math.floor((leftIndex + rightIndex) / 2);

    const midVal = arr[midIndex][key];

    if (midVal > findVal) {
        return binarySearch(arr, key, findVal, leftIndex, midIndex - 1);

    } else if (midVal < findVal) {
        return binarySearch(arr, key, findVal, midIndex + 1, rightIndex);

    } else {
        const find = midIndex + 1;

        return find;

    }

}

export function clearStorge(key: string) {
    if (!key) {
        return
    }
    try {
        Taro.removeStorage({key})
    }catch (e) {

    }
}

export function backHandlePress() {
    if (Taro.getEnv() === ENV_TYPE.WEB) {
        window.addEventListener("popstate", () => {
            console.log("监听到返回")
        })
    }
}


/**
 * @param src {string} 图片地址
 * @param options {Object} 配置参数
 * @param canvasId {string} DOM id、仅微信小程序使用此参数
 */
interface RGBAsterParams {
    // 图片地址
    src: string,
    // 配置参数
    options?: {[key: string]: any},
    // 仅微信小程序使用此参数
    canvasId?: string,
    parentThis?:any
}
/**
 * 获取图片主色调，已兼容小程序、web
 * @param params {RGBAsterParams} 参数
 * @constructor
 * @return Promise<any[]>
 */
export function RGBAster (params:RGBAsterParams = {src: ""}) {
    const opt: any = {
        src: params.src,
        options: params.options || {},
        canvasId: params.canvasId || null,
    }
    return new Promise<any[]>((resolve, reject) => {
        if (!opt.src) {
            reject("未找到图片地址");
            return
        }
        if (Taro.getEnv() === ENV_TYPE.WEB) {
            Rgbaster(opt.src, {...opt.options}).then(res => {
                resolve(res)
            }).catch(e => {
                reject(e)
            })
        }
        if (Taro.getEnv() === ENV_TYPE.WEAPP) {
            if (!opt.canvasId) {
                reject("未设置canvasId")
            } else {
                wxColors.colors(opt.src, opt.canvasId, {
                    width: deviceInfo.windowWidth,
                    height: 280,
                    success: res => {
                        resolve(res)
                    }
                },params.parentThis)
            }
        }
    })
}

export function fixStatusBarHeight() {
    const env = process.env.TARO_ENV;
    // if (env !== "h5") {
    //     return {
    //         "padding-top": deviceInfo.statusBarHeight + "px"
    //     }
    // }

    return `padding-top: ${env !== "h5" ? deviceInfo.statusBarHeight + "px" : ""}`
}


export function jumpToEditor(params: {[key: string] : any} = {}) {
    const paramsStr = getURLParamsStr(urlEncode(params));
    Taro.navigateTo({
        url: deviceInfo.env === "h5" ? `/pages/editor/pages/shell?${paramsStr}` : `/pages/editor/pages/wxshell?${paramsStr}`
    })
}
export function jumpToPrintEditor(params: {[key: string] : any} = {}) {
    const paramsStr = getURLParamsStr(urlEncode(params));
    Taro.navigateTo({
        url: deviceInfo.env === "h5" ? `/pages/editor/pages/printedit?${paramsStr}` : `/pages/editor/pages/wxprintedit?${paramsStr}`
    })
}

export async function sleep(timestamp) {
    await new Promise((resolve) => setTimeout(resolve, timestamp));
}

// 从0开始截断字符串
export function cutString(str: string = "", len: number = 1, suffix: string = "...") {
    if (notNull(str)) {
        return ""
    }
    return `${str.substr(0, len)}${suffix}`;
}


export function getUserKey() {
    return `${userStore.id}_key_${moment().date()}`
}

// 数组取双，3取2, 5取4...
export function getEvenArr(arr = []) {
    if (arr.length < 2) {
        return []
    }
    if (arr.length % 3 === 0) {
        return arr.slice(0, arr.length - 1)
    }
    return arr
}

export function setTempDataContainer(key:string,data:any,callback:(ok:boolean)=>void){
    api("app.order_temp/container",{
        field_key:key,
        content:JSON.stringify(data)
    }).then(()=>{
        callback(true)
    }).catch(()=>{
        callback(false)
    });
}
export function getTempDataContainer(key:string,callback:(value:any)=>void){
    api("app.order_temp/pullContainer",{
        field_key:key
    }).then((res)=>{
        callback(JSON.parse(res))
    }).catch((e)=>{
        console.log(e);
        callback(null)
    });
}