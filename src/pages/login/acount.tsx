import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input, Button } from '@tarojs/components'
import './index.less'
import './acount.less'
import HeaderTop from './header'
import LoginFooter from './footer'
import { api } from '../../utils/net'
import {userStore} from "../../store/user";
import { observer, inject } from '@tarojs/mobx'
import IconFont from '../../components/iconfont'
import { deviceInfo } from '../../utils/common';

@inject("userStore")
@observer
export default class Login extends Component<{},{
    account:string,
    pwd:string,
    loginBtnAtive:boolean,
    pwdShow:boolean
}> {
    config: Config = {
        navigationBarTitleText: '账号登录'
    }
    constructor(props){
        super(props);
        this.state ={
            account:"",
            pwd:"",
            loginBtnAtive:false,
            pwdShow:false
        }
    }
    componentDidMount(){
        
    }

    onLogin = () => {
        const {account,pwd} = this.state;
        if (account.length==0 || pwd.length==0) {
            Taro.showToast({
                title:"账号/密码不能为空",
                duration:1500,
                icon:"none"
            });
            return;
        }
        if (account.length>=4 && pwd.length>=6) {
            Taro.showLoading({title:"正在登录"});
            api("user/login",{
                account,
                password:pwd
            }).then((res)=>{
                userStore.setInfo(res);
                Taro.hideLoading();
                Taro.reLaunch({
                    url:"/pages/me/me"
                })
            }).catch((e)=>{
                Taro.hideLoading();
                Taro.showToast({
                    title:e,
                    icon:"none",
                    duration:1500
                })
            })
        }
    }
    onInputAccount = ({detail:{value}}) => {
        this.setState({account:value});
        const {pwd} = this.state;
        if (value.length>=4 && pwd.length>=6) {
            this.setState({
                loginBtnAtive:true
            })
        } else {
            this.setState({
                loginBtnAtive:false
            })
        }
    }

    onInputPwd = ({detail:{value}}) => {
        this.setState({pwd:value});
        const {account} = this.state;
        if (account.length>=4 && value.length>=6) {
            this.setState({
                loginBtnAtive:true
            })
        } else {
            this.setState({
                loginBtnAtive:false
            })
        }
    }

    render() {
        const {loginBtnAtive,pwdShow} = this.state;
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
                            <Input type='text' placeholder='请输入手机号/账号' className='acounts-input' onInput={this.onInputAccount}/>
                        </View>
                        <View className='pwd'>
                            <Input type='text' password={!pwdShow} placeholder='密码' className='pwd-input' onInput={this.onInputPwd}/>
                            <View className='show' onClick={()=>{
                                this.setState({
                                    pwdShow:!pwdShow
                                })
                            }}>
                                <IconFont name={pwdShow?'24_mimaxianshi':'24_mimayincang'} color='' size={48} />
                            </View>
                        </View>
                        <View className='forget-pwd' onClick={()=>{
                            Taro.navigateTo({
                                url:'/pages/login/find'
                            })
                        }}>
                            <Text className='ftexts'>忘记密码</Text>
                        </View>
                        <Button className={loginBtnAtive?'loginbtn loginbtnActive':'loginbtn'} onClick={this.onLogin}>登录</Button>
                        {
                            deviceInfo.env!="h5"?<View className='pwlogin' onClick={()=>{
                                Taro.redirectTo({
                                    url:'/pages/login/index'
                                })
                            }}>
                                <Text className='txt'>验证码登录</Text>
                            </View>:null
                        }
                    </View>
                </View>
                <LoginFooter />
            </View>
        )
    }
}
