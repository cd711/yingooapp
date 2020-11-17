import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input } from '@tarojs/components'
import './index.less'
import HeaderTop from './header'
import IconFont from '../../components/iconfont';
import LoginFooter from './footer'
// import { api } from '../../utils/net'

export default class Login extends Component<any,{
    codeBtnActive:boolean;
    showMobileClear:boolean;
    inputActive:boolean
    inputValue:string;
}> {

    config: Config = {
        navigationBarTitleText: '首页'
    }
    private inputRef;
    constructor(props){
        super(props);
        this.state = {
            codeBtnActive:false,
            showMobileClear:false,
            inputValue:"",
            inputActive:false
        }
    }


    onMobileInput = ({detail:{value}}) => {
        const pattern = /(13\d|14[579]|15[^4\D]|17[^49\D]|18\d)\d{8}/g;
        this.setState({
            inputValue:value
        })
        if (value.length>0) {
            this.setState({
                showMobileClear:true
            })
        } else {
            this.setState({
                showMobileClear:false
            }) 
        }
        if (pattern.test(value)) {
            this.setState({
                codeBtnActive:true,

            })
        } else {
            this.setState({
                codeBtnActive:false
            })
        }
    }
    onInputClear = () => {
        this.setState({
            inputValue:"",
            showMobileClear:false,
            codeBtnActive:false,
            inputActive:false
        });
        this.inputRef.inputRef.focus();
    }
    sendSMS = () => {
        const { codeBtnActive,inputValue } = this.state;
        if (codeBtnActive && inputValue.length == 11) {
            Taro.navigateTo({
                url:`/pages/login/sms?mobile=${inputValue}`
            })
            // Taro.showLoading({title:"正在发送..."});
            // api("sms/send",{
            //     mobile:"13340631853",
            //     event:"login"
            // }).then(()=>{
            //     Taro.hideLoading();

            // })
        }
    }
    render() {
        const { codeBtnActive,showMobileClear,inputValue,inputActive } = this.state;
        return (
            <View className='login'>
                <HeaderTop rightText='账号登录' url='/pages/login/acount' />
                <View className='container'>
                    <View className='title'>
                        <Text className='ttext'>Hi,</Text>
                        <Text className='ttext'>欢迎来到映果定制</Text>
                    </View>
                    <View className='acount'>
                        <Input type='number' placeholder='请输入手机号' className={inputActive?'acount-input acount-input-active':"acount-input"} maxLength={11} onInput={this.onMobileInput} onFocus={()=>{
                            this.setState({inputActive:true})
                        }} onBlur={()=>{
                            if (inputValue.length<=0) {
                                this.setState({inputActive:false})
                            }
                        }} ref={(node)=>{this.inputRef = node}} value={inputValue} />
                        {/* <Text className='forget'>忘记密码</Text> */}
                        {
                            showMobileClear?<View className='clearIcon' onClick={this.onInputClear}><IconFont name='16_qingkong' size={32} color='#999999' /></View>:null
                        }
                    </View>
                    <View className={codeBtnActive?'getcode codeActive':'getcode'} onClick={this.sendSMS}>
                        <Text className='gtext'>获取验证码</Text>
                    </View>
                </View>
                <LoginFooter />
            </View>
        )
    }
}
