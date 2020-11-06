import Taro from '@tarojs/taro';
import { Base64 } from 'js-base64';

export const options: {
    apiUrl: string;
    sourceUrl:string
} = {
    apiUrl: '',
    sourceUrl:''
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
export function api(name: string, params?: any): Promise<any> {
    return new Promise<any>( (resolve, reject) => {

        params = {
            ...params
        };
        params = params || {};
        // console.log(params);
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
                'content-type': 'application/x-www-form-urlencoded'
            }
        }).then(function (res: any) {
            console.log(res);
            if(res.data.code == 401){
                // userStore.auth().then(res=>{
                //     // setToken(res.access_token,res.expired_at);
                //     api(name,params).then(()=>{
                //         Taro.showLoading({title:"加载中"});
                //         resolve(res.data.data);
                //     }).catch((e)=>{
                //         Taro.hideLoading();
                //         reject(e.errMsg || e.message || e);
                //     })
                // }).catch(()=>{
                //     Taro.showToast({
                //         title:"登录失败!",
                //         icon:'none',
                //         duration:2000
                //     })
                // })
                Taro.redirectTo({
                    url:"/pages/login/index"
                });
                return;
            } else {

                if (res.data.code == 1) {
                    resolve(res.data.data);
                } else {
                    reject(res.data.msg);
                }
            }
        }).catch(function (e) {
            console.log("接口报错:",name,e);
            reject(e.errMsg || e.message || e);
        });
    });
}
