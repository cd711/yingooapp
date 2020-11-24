import Taro from "@tarojs/taro";
import { View } from '@tarojs/components';
import { userStore } from "../store/user";
import UITopProvider, {UITop} from "../components/UITopProvider";
import Modal from "../components/UITopProvider/modal";
import Login from "../components/login/login";
import { is_weixin } from "./common";
import { api } from "./net";

const page =(option?: {
    wechatAutoLogin: boolean,
    redirectUrl?:string
})=>{
    return function (obj: { prototype: any; }) {
        const clazz = obj.prototype
        const mount = clazz.componentWillMount;
        const render = clazz.render;
        clazz.checkLogin = function () {
            const {code} = this.$router.params;
            option.redirectUrl = option.redirectUrl ? option.redirectUrl : window.location.href
            if (is_weixin() && userStore.id == null) {
                if (code && code.length>5) {
                    const params = this.$router.params;
                    let exportUrl = window.location.href.split("?")[0]+(Object.keys(params).length>0?"?":"");
                    Object.keys(params).map((key)=>{
                        if (key != "code" && key != "state") {
                            exportUrl += key + '=' + params[key] +'&';
                        }
                    })
                    exportUrl = exportUrl[exportUrl.length-1]==='&' ? exportUrl.substring(0,exportUrl.length-2):exportUrl;
                    window.history.replaceState(null,null,exportUrl)
                    Taro.showLoading({title:"登录中..."});
                    api("user/third",{
                        platform:"wechat",
                        code:code,
                    }).then((res)=>{
                        userStore.setInfo(res)
                        Taro.hideLoading();
                        Taro.showToast({
                            title:"登录成功",
                            icon:'none',
                            duration:2000
                        })
                        location.replace(exportUrl)
                        this.wechatLoginSuccess && this.wechatLoginSuccess(res);
                    }).catch((e)=>{
                        Taro.hideLoading();
                        Taro.reLaunch({
                            url:'/pages/index/index'
                        });
                    })
                }
                if (option.wechatAutoLogin) {
                    if(code == undefined || code == null || !code) {
                        // @ts-ignore
                        const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${common_config.wxappid}&redirect_uri=${encodeURIComponent(option.redirectUrl)}&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect`;
                        window.location.href = url;
                    }
                }
            }
        }
        clazz.componentWillMount = function () {
            this.__option = {};
            if (option) {
                this.__option = Object.assign({}, option);
                this.checkLogin();
            }

            mount && mount.apply(this, arguments);
        };


        clazz.showLoginModal = function () {

            if (userStore.id == null) {
                const key = Modal.show(
                    <Login onClose={() => UITop.remove(key)}
                           onOk={() => {
                               UITop.remove(key);
                               window.location.replace(`/pages/login/index`);
                           }} />)
                return false
            }
            return true
        }

        clazz.render = function () {
            return <View className='ext-page' style={{display:"flex",flexDirection:"column",position:"fixed",width:"100%",height:"100%"}}>
                <UITopProvider />
                {
                    render && render.apply(this,arguments)
                }
            </View>
        }
    }
}
export default page;
