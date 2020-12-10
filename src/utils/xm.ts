import Taro from '@tarojs/taro';
import { userStore } from '../store/user';
import { deviceInfo,is_weixin,notNull } from './common';
import { api } from './net';

interface LoginParams{
    code?:string,
    redirectUrl?:string,
    userInfo?:string,
    signature?:string,
    iv?:string,
    encryptedData?:string
}
export default class Xm {
    public static login(params:LoginParams){
        return new Promise<any>( (resolve, reject) => {
            switch (deviceInfo.env) {
                case "h5":
                    this.h5WXLogin(params,resolve,reject);
                    break;
                case "weapp":
                    this.weappLogin(params,resolve,reject);
                    break;
                default:
                    break;
            }
        })
    }
    private static h5WXLogin(params:LoginParams,resolve,reject){
        if (is_weixin()) {
            if (notNull(params.code)) {
                // @ts-ignore
                const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${common_config.wxappid}&redirect_uri=${encodeURIComponent(params.redirectUrl)}&response_type=code&scope=snsapi_userinfo&state=login#wechat_redirect`;
                window.location.href = url;
            }else{
                this.thirdLoginApi({
                    platform: "wechat",
                    code: params.code,
                },resolve,reject);
            }
        }
    }
    private static weappLogin(params:LoginParams,resolve,reject){
        if (!notNull(params.userInfo)) {
            Taro.login().then((res)=>{
                this.thirdLoginApi({
                    platform: "wxapp",
                    code: res.code,
                    data: params.userInfo
                },resolve,reject);
            }).catch((e)=>{
                reject(e);
            });
        }
    }
    private static thirdLoginApi(params,resolve,reject){
        api("user/third", params).then((res) => {
            userStore.setInfo(res);
            resolve(res);
        }).catch((e) => {
            reject(e);
        })
    }
}