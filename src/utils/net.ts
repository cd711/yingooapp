import Taro from '@tarojs/taro';
import {Base64} from 'js-base64';
import {userStore} from "../store/user";
import { is_weixin } from './common';


export const options: {
    apiUrl: string;
    sourceUrl:string;
    editorUrl: string;
    h5Url: string;
    weappUrl:string;
    channel:string
} = {
    apiUrl: '',
    sourceUrl:'',
    editorUrl: "",
    h5Url: "",
    weappUrl:"",
    channel:""
}
let accessToken;

export function setUserInfo(info) {
    accessToken = {
        token: info.token,
        expires: parseInt(info.expiretime)
    };
    Taro.setStorage({
        key: "token",
        data: accessToken
    });
    Taro.setStorage({
        key: "TaroInfoKey",
        data: Base64.encode(JSON.stringify(info))
    });
}
export function updateLocalUserInfo(feild,context) {
    const info = Base64.decode(Taro.getStorageSync("TaroInfoKey"));
    if (info) {
        const user = JSON.parse(info);
        user[feild] = context;
        Taro.setStorage({
            key: "TaroInfoKey",
            data: Base64.encode(JSON.stringify(user))
        });
    }

}
export function getUserInfo() {
   const info = Base64.decode(Taro.getStorageSync("TaroInfoKey"));
   if (info) {
       return JSON.parse(info);
   }
   return null;
}

export function getToken(): string {
    const now = new Date().getTime() / 1000;

    if (!accessToken) {
        accessToken = Taro.getStorageSync("token") as any;
    }
    if (accessToken && accessToken.expires > now) {
        return accessToken.token
    }
    Taro.removeStorage({key:'token'});
    Taro.removeStorage({key:'TaroInfoKey'});
    return "";
}

function serverPlatform() {
    let p = "";
    if (process.env.TARO_ENV === 'h5') {
        p = "h5"
        if (is_weixin()) {
            p = "wechat_h5"
        }
    }
    if (process.env.TARO_ENV === 'weapp') {
        p = "wechat_miniapp"
    }
    return p;
}

export function api(name: string, params?: any, allowJson = false): Promise<any> {
    return new Promise<any>( (resolve, reject) => {
        params = {
            ...params,
            channel_code:options.channel,
            platform: serverPlatform()
        };
        params = params || {};
        let url = options.apiUrl + name;
        if (getToken()) {
            url += (url.indexOf("?") > -1 ? "&" : "?") + "token=" + getToken();
        }
        // console.log(url);
        // const pl: string[] = [];
        // for (let key in params) {
        //   pl.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        // }
        Taro.request({
            url,
            data: params,
            method: "POST",
            header: {
                'content-type': allowJson ? "application/json" : 'application/x-www-form-urlencoded'
            }
        }).then((res: any) => {
            if(res.data.code == 401){
                Taro.hideLoading();
                Taro.removeStorage({key:'token'});
                Taro.removeStorage({key:'TaroInfoKey'});
                userStore.clear();
                Taro.hideLoading();
                Taro.hideToast();
                userStore.showLoginModal = true;
                // Modal.showLogin(false,()=>{

                // },()=>{
                //     Taro.redirectTo({
                //         url:"/pages/login/index"
                //     });
                // });
                // console.log(modals);


                // return;
            } else {

                if (res.data.code == 1) {
                    resolve(res.data.data);
                } else {

                    reject(res.data.msg || res.msg);
                }
            }
        }).catch(function (e) {
            console.log("接口报错:",name,e);
            if (e && e.status && (e.status == 500||e.status == 501)) {
                e = "服务器走丢了，请稍后再试。"
            }
            reject(e.errMsg || e.message || e);
        });
    });
}
