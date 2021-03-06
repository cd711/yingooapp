import Taro from '@tarojs/taro'
import {Button, Text, View} from '@tarojs/components'
// import './index.less'
import "./footer.less"
import IconFont from '../../components/iconfont';
import {convertClassName, deviceInfo, is_weixin, jumpToPrivacy, updateChannelCode} from '../../utils/common';
import Xm from '../../utils/xm';

const LoginFooter: Taro.FC<any> = () => {

    const wxLogin = () => {
        if (deviceInfo.env == "h5") {
            // @ts-ignore
            // eslint-disable-next-line no-undef
            const appid = common_config.wxappid;
            const uri = location.origin + "/me"
            // @ts-ignore
            // eslint-disable-next-line no-undef
            const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${common_config.wxappid}&redirect_uri=${encodeURIComponent(uri)}&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect`;
            window.location.href = url;
        }
    }

    return <View className={'login-footer'}>
        <View className={'otherlogin'}>
            <View className={'line'}/>
            <Text className={'othertext'}>其他方式</Text>
            <View className={'line'}/>
        </View>
        <View className={'qw'}>
            {
                deviceInfo.env == "weapp" ? <Button className={'wechat'} openType="getUserInfo"
                                                    onGetUserInfo={({detail: {userInfo}}) => {
                                                        Taro.showLoading({title: "正在登录..."})
                                                        Xm.login({
                                                            userInfo: JSON.stringify(userInfo)
                                                        }).then(() => {
                                                            Taro.hideLoading();
                                                            Taro.showToast({
                                                                title: "登录成功",
                                                                icon: 'none',
                                                                duration: 2000
                                                            });
                                                            setTimeout(() => {
                                                                if (process.env.TARO_ENV == "h5") {
                                                                    window.location.href = updateChannelCode("/pages/tabbar/me/me");
                                                                } else {
                                                                    Taro.switchTab({url: updateChannelCode("/pages/tabbar/me/me")});
                                                                }
                                                            }, 2001);
                                                        }).catch((e) => {
                                                            Taro.hideLoading();
                                                            Taro.showToast({
                                                                title: e,
                                                                icon: 'none',
                                                                duration: 1500
                                                            });
                                                        })
                                                    }}>
                    <IconFont name='24_weixin' size={48} color='#FFF'/>
                </Button> : null
            }
            {
                is_weixin() ? <View className={'wechat'} onClick={wxLogin}>
                    <IconFont name='24_weixin' size={48} color='#FFF'/>
                </View> : null
            }
            {
                !is_weixin() && deviceInfo.env == "h5" ? <View className={'qq'}>
                    <IconFont name='24_QQ' size={48} color='#FFF'/>
                </View> : null
            }
        </View>
        <View className={'xieyi'}>
            <Text className={'enter'}>进入即同意</Text>
            <View className={'xy'}><Text onClick={() => jumpToPrivacy(1)}>《映果用户协议》</Text></View>
            <View className={'xy'}><Text onClick={() => jumpToPrivacy(2)}>《隐私协议》</Text></View>
        </View>
    </View>
}
export default LoginFooter;
