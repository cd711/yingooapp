import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input, Button } from '@tarojs/components'
import './index.less'
import './acount.less'
import HeaderTop from './header'
import LoginFooter from './footer'

export default class Login extends Component {
    config: Config = {
        navigationBarTitleText: '账号登录'
    }

    render() {
        return (
            <View className='login'>
                <HeaderTop rightText='验证码登录' url='/pages/login/index' />
                <View className='container'>
                    <View className='title'>
                        <Text className='ttext'>Hi,</Text>
                        <Text className='ttext'>欢迎来到映果定制</Text>
                    </View>
                    <View className='acount-logins'>
                        <View className='acounts'>
                            <Input type='text' placeholder='请输入手机号/账号' className='acounts-input' />
                        </View>
                        <View className='pwd'>
                            <Input type='text' password placeholder='密码' className='pwd-input' />
                        </View>
                        <View className='forget-pwd'>
                            <Text className='ftexts'>忘记密码</Text>
                        </View>
                        <Button className='loginbtn'>登录</Button>
                        {/* <View className='zhuce'>
                            <Text>注册</Text>
                        </View> */}
                    </View>
                </View>
                <LoginFooter />
            </View>
        )
    }
}
