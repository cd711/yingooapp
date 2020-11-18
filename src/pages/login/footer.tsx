
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input } from '@tarojs/components'
import './index.less'
import IconFont from '../../components/iconfont';
import { is_weixin } from '../../utils/common';

const LoginFooter: React.FC<any> = () => {
    
    const wxLogin = () => {
        // @ts-ignore
        // eslint-disable-next-line no-undef
        const appid = common_config.wxappid;
        // @ts-ignore
        // eslint-disable-next-line no-undef
        const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${common_config.wxappid}&redirect_uri=${encodeURIComponent("http://m.playbox.yingoo.com/me")}&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect`;
        window.location.href = url;   
    }
    return <View className='footer'>
        <View className='otherlogin'>
            <View className='line'></View>
            <Text className='othertext'>其他方式</Text>
            <View className='line'></View>
        </View>
        <View className='qw'>
            {
                is_weixin()?<View className='wechat' onClick={wxLogin}>
                    <IconFont name='24_weixin' size={48} color='#FFF'/>
                </View>:null
            }
            {
                is_weixin()?null:<View className='qq'>
                    <IconFont name='24_QQ' size={48} color='#FFF'/>
                </View>
            }
        </View>
        <View className='xieyi'>
            <Text className='enter'>进入即同意</Text>
            <View className='xy'><Text>《映果用户协议》</Text></View>
            <View className='xy'><Text>《隐私协议》</Text></View>
        </View>
    </View>
}
export default LoginFooter;