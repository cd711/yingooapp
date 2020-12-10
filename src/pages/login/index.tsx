import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input } from '@tarojs/components'
import './index.less'
import HeaderTop from './header'
import IconFont from '../../components/iconfont';
import LoginFooter from './footer'
import { deviceInfo } from '../../utils/common';



export default class Login extends Component<any,{
    codeBtnActive:boolean;
    showMobileClear:boolean;
    inputActive:boolean;
    textActive:boolean;
    inputValue:string;
    inputFocus:boolean
}> {

    config: Config = {
        navigationBarTitleText: '登录'
    }
    private inputRef: { inputRef: { focus: () => void; }; };
    constructor(props: any){
        super(props);
        this.state = {
            codeBtnActive:false,
            showMobileClear:false,
            inputValue:"",
            inputActive:false,
            textActive:false,
            inputFocus:false
        }
    }
    componentDidMount(){

    }

    onMobileInput = ({detail:{value}}) => {
        const pattern = /(13\d|14[579]|15[^4\D]|17[^49\D]|18\d)\d{8}/g;
        if (value.length<=0) {
            this.setState({textActive:false})
        }else{
            this.setState({textActive:true})
        }
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
            textActive:false,
            inputFocus:true
        });
        
        if (deviceInfo.env == "h5") {
            this.inputRef.inputRef.focus();
        }
        
    }
    sendSMS = () => {
        const { codeBtnActive,inputValue } = this.state;
        if (codeBtnActive && inputValue.length == 11) {
            Taro.navigateTo({
                url:`/pages/login/sms?mobile=${inputValue}&status=l`
            })
        }
    }
    render() {
        const { codeBtnActive,showMobileClear,inputValue,inputActive,textActive,inputFocus } = this.state;
        return (
            <View className='login'>
                <HeaderTop rightText='账号登录' url='/pages/login/acount' />
                <View className='container'>
                    <View className='title'>
                        <Text className='ttext'>Hi,</Text>
                        <Text className='ttext'>欢迎来到映果定制</Text>
                    </View>
                    <View className='acount'>
                        <Input type='number' placeholder='请输入手机号' focus={inputFocus} style={`font-size:${Taro.pxTransform(textActive?36:28)}`} className={inputActive?'acount-input acount-input-active':"acount-input"} maxLength={11} onInput={this.onMobileInput} onFocus={()=>{
                            this.setState({inputActive:true})
                        }} onBlur={()=>{
                            this.setState({
                                inputActive:false,
                                inputFocus:false
                            })
                            if (inputValue.length<=0) {
                                this.setState({textActive:false})
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
                    {
                        deviceInfo.env!="h5"?<View className='pwlogin' onClick={()=>{
                            Taro.navigateTo({
                                url:'/pages/login/acount'
                            })
                        }}>
                            <Text className='txt'>密码登录</Text>
                        </View>:null
                    }
                </View>
                <LoginFooter />
            </View>
        )
    }
}
