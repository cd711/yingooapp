import Taro from '@tarojs/taro'
import {Button, Text, View} from '@tarojs/components'
import './index.less'
import IconFont from '../../components/iconfont';
import {convertClassName, deviceInfo, is_weixin} from '../../utils/common';
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
    return <View className={convertClassName('footer')}>
        <View className={convertClassName('otherlogin')}>
            <View className={convertClassName('line')}/>
            <Text className={convertClassName('othertext')}>其他方式</Text>
            <View className={convertClassName('line')}/>
        </View>
        <View className={convertClassName('qw')}>
            {
                deviceInfo.env == "weapp" ? <Button className={convertClassName('wechat')} openType="getUserInfo"
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
                                                                Taro.switchTab({
                                                                    url: '/pages/tabbar/me/me'
                                                                })
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
                is_weixin() ? <View className={convertClassName('wechat')} onClick={wxLogin}>
                    <IconFont name='24_weixin' size={48} color='#FFF'/>
                </View> : null
            }
            {
                !is_weixin() && deviceInfo.env == "h5" ? <View className={convertClassName('qq')}>
                    <IconFont name='24_QQ' size={48} color='#FFF'/>
                </View> : null
            }
        </View>
        <View className={convertClassName('xieyi')}>
            <Text className={convertClassName('enter')}>进入即同意</Text>
            <View className={convertClassName('xy')}><Text>《映果用户协议》</Text></View>
            <View className={convertClassName('xy')}><Text>《隐私协议》</Text></View>
        </View>
    </View>
}
export default LoginFooter;
