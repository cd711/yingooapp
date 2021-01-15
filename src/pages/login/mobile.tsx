import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input,Button } from '@tarojs/components'
import './set.less';
import './mobile.less';
import IconFont from '../../components/iconfont';
import { api } from '../../utils/net';
import {userStore} from "../../store/user";
import { observer, inject } from '@tarojs/mobx'
import {debuglog, deviceInfo, fixStatusBarHeight, updateChannelCode} from '../../utils/common';

@inject("userStore")
@observer
export default class Mobile extends Component<{},{
    btnAtive:boolean;
    phoneActive:boolean;
    codeActive:boolean;
    phone:string;
    code:string;
    time:number;
    check:boolean
}> {
    config: Config = {
        navigationBarTitleText: '更换手机号'
    }

    constructor(props) {
        super(props);

        this.state = {
            btnAtive:false,
            phone:"",
            code:"",
            phoneActive:false,
            codeActive:false,
            time:0,
            check:false
        }
    }
    componentDidMount(){
        if (userStore.isLogin) {
            if (userStore.mobile.length!=11) {
                this.setState({
                    check:true
                })
            }
        } else {
            if (deviceInfo.env == 'h5') {
                window.location.href = updateChannelCode('/pages/tabbar/index/index')
            } else {
                Taro.switchTab({
                    url: updateChannelCode('/pages/tabbar/index/index')
                });
            }
        }
    }

    onInputPhone = ({detail:{value}}) => {
        if (value.length>0) {
            this.setState({
                phoneActive:true
            })
        } else {
            this.setState({
                phoneActive:false
            })
        }
        this.setState({
            phone:value
        });
        this.checkInput(this.state.code,value);
    }

    onInputCode = ({detail:{value}}) => {
        if (value.length>0) {
            this.setState({
                codeActive:true
            })
        } else {
            this.setState({
                codeActive:false
            })
        }
        this.setState({
            code:value
        });
        this.checkInput(value,this.state.phone);
    }
    checkInput(code,phone){
        const {check} = this.state;
        let checkInput = false;
        if (code.length==6 && phone.length==11) {
            checkInput = true;
        }
        if (check) {
            this.setState({
                btnAtive:checkInput
            })
        } else {

            this.setState({
                btnAtive:userStore.mobile==phone && checkInput
            })
        }
    }
    onCaptcha = () => {
        if (this.state.time>0) {
            return;
        }
        const {phone,check} = this.state;
        let checkInput = userStore.mobile == phone
        if (check) {
            checkInput = true
        }
        if (phone.length==11 && checkInput) {
            Taro.showLoading({title:"发送中..."})
            api("sms/send",{
                mobile:phone,
                event:check?'changemobile':'changephone'
            }).then((res)=>{
                Taro.hideLoading();
                debuglog(res);
                this.setState({
                    time:parseInt(res.time+"")
                });
                const t = setInterval(()=>{
                    const {time} = this.state;
                    if (time==0) {
                        clearInterval(t);
                        return;
                    }
                    this.setState({
                        time:time-1
                    });
                },1000)
            }).catch((e)=>{
                Taro.hideLoading();
                Taro.showToast({
                    title:e,
                    icon:"none",
                    duration:2000
                })
            })
        } else {
            Taro.showToast({
                title:'请输入正确的原手机号',
                icon:'none',
                duration:1500
            })
        }
    }

    onOK = () => {
        const {code,phone,check} = this.state;
        let checkInput = false;
        if (code.length==6 && phone.length==11) {
            checkInput = true;
        }
        if (check) {
            if (checkInput) {
                Taro.showLoading({title:"加载中"})
                api("user/changemobile",{
                    mobile:phone,
                    captcha:code
                }).then(()=>{
                    userStore.getUserInfo();
                    Taro.hideLoading();
                    Taro.showToast({
                        title:'修改成功',
                        icon:"success",
                        duration:1500
                    });
                    setTimeout(() => {
                        Taro.navigateBack();
                    }, 1500);
                }).catch((e)=>{
                    Taro.hideLoading();
                    Taro.showToast({
                        title:e,
                        icon:"none",
                        duration:2000
                    })
                })
            }
        } else {
            if (checkInput && userStore.mobile == phone) {
                Taro.showLoading({title:"加载中"})
                api("sms/check",{
                    mobile:phone,
                    event:'changephone',
                    captcha:code
                }).then(()=>{
                    Taro.hideLoading();
                    this.setState({
                        check:true,
                        phone:"",
                        code:'',
                        btnAtive:false,
                        time:0
                    })
                }).catch((e)=>{
                    Taro.hideLoading();
                    Taro.showToast({
                        title:e,
                        icon:"none",
                        duration:2000
                    })
                })
            }
        }

    }
    render(){
        const {btnAtive,phoneActive,codeActive,time,check,phone,code} = this.state;

        return <View className='set_page mobile_page'>
            {/* @ts-ignore */}
            <View className='nav-bar' style={fixStatusBarHeight()}>
                <View className='back' onClick={()=>{
                    Taro.navigateBack();
                }}>
                    <IconFont name='24_shangyiye' size={48} color='#121314' />
                </View>
            </View>

            <View className='container'>
                <View className='tip'>
                    <Text className='txt'>{check?'输入新手机号':'输入原手机号'}</Text>
                </View>
                <View className='acount-logins'>
                    <View className='acounts'>
                        <Input type='text' maxLength={11} placeholder={check?'请输入新手机号':'请输入原手机号'} className={phoneActive?'acounts-input input-active':'acounts-input'} onInput={this.onInputPhone} value={phone}/>
                    </View>
                    <View className='acounts captcha'>
                        <Input type='text' maxLength={6} placeholder='请输入验证码' className={codeActive?'acounts-input input-active':'acounts-input'} onInput={this.onInputCode} value={code}/>
                        <Button className={time<=0?'get_code_btn':'get_code_btn get_code_btn_disable'} onClick={this.onCaptcha}>{time<=0?'获取验证码':`${time}s后重新获取`}</Button>
                    </View>
                </View>
                <Button className={btnAtive?'loginbtn loginbtnActive':'loginbtn'} onClick={this.onOK}>确定</Button>
            </View>
    </View>
    }

}
