
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input } from '@tarojs/components'
import './index.less'
import IconFont from '../../components/iconfont';

export const LoginFooter: React.FC<any> = () => {
    return <View className='footer'>
        <View className='otherlogin'>
            <View className='line'></View>
            <Text className='othertext'>其他方式</Text>
            <View className='line'></View>
        </View>
        <View className='qw'>
            <View className='wechat'>
                <IconFont name='24_weixin' size={24} color='#FFF'/>
            </View>
            <View className='qq'>
                <IconFont name='24_QQ' size={24} color='#FFF'/>
            </View>
        </View>
        <View className='xieyi'>
            <Text className='enter'>进入即同意</Text>
            <View className='xy'><Text>《映果用户协议》</Text></View>
            <View className='xy'><Text>《隐私协议》</Text></View>
        </View>
    </View>
}