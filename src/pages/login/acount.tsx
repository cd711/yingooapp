import { ComponentType } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input } from '@tarojs/components'
import './index.less'
import IconFont from '../../components/iconfont';
import {HeaderTop} from './header'
export default class Login extends Component {

    componentWillMount() { }

    componentDidMount() { }

    componentWillUnmount() { }

    componentDidShow() { }

    componentDidHide() { }

    render() {
        return (
            <View className='login'>
                <HeaderTop rightText="验证码登录" />
                <View className="container">
                    <View className='title'>
                        <Text className='ttext'>Hi,</Text>
                        <Text className='ttext'>欢迎来到映果定制</Text>
                    </View>
                    <View className='acount'>
                        <Input type='number' placeholder='请输入手机号' className='acount-input'/>
                        <Text className='forget'>忘记密码</Text>
                    </View>
                    <View className='getcode'>
                        <Text className='gtext'>获取验证码</Text>
                    </View>
                </View>
                <View className='footer'>
                    <View className='otherlogin'>
                        <View className='line'></View>
                        <Text className='othertext'>其他方式</Text>
                        <View className='line'></View>
                    </View>
                    <View className='qw'>
                        <View className='qq'></View>
                        <View className='wechat'></View>
                    </View>
                    <View className='xieyi'>
                        <Text className='enter'>进入即同意</Text>
                        <View className='xy'><Text>《映果用户协议》</Text></View>
                        <View className='xy'><Text>《隐私协议》</Text></View>
                    </View>
                </View>
            </View>
        )
    }
}
