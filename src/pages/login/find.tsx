import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input } from '@tarojs/components'
import './index.less'
import './find.less'
import IconFont from '../../components/iconfont';
import { observer, inject } from '@tarojs/mobx'
import {fixStatusBarHeight, deviceInfo, updateChannelCode, setPageTitle} from '../../utils/common';
import { api } from '../../utils/net';

@inject("userStore")
@observer
// @page({wechatAutoLogin:true})
export default class Set extends Component<any,{
    codeBtnActive:boolean;
    showMobileClear:boolean;
    inputActive:boolean
    inputValue:string;
    textActive:boolean;
    inputFocus:boolean
}> {
    config: Config = {
        navigationBarTitleText: '设置密码'
    }

    constructor(props) {
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
    private inputRef: { inputRef: { focus: () => void; }; };
    componentDidMount(){
        setPageTitle("设置密码")
        // if (!userStore.isLogin) {
        //     if (deviceInfo.env == 'h5') {
        //         window.location.href = "/pages/tabbar/index/index";
        //     } else {
        //         Taro.switchTab({
        //             url:'/pages/tabbar/index/index'
        //         })
        //     }
        // }

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
            inputActive:false,
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
            this.checkMobile(inputValue,(is)=>{
                if (is) {
                    Taro.navigateTo({
                        url: updateChannelCode(`/pages/login/sms?mobile=${inputValue}&status=f`)
                    })
                } else {
                    Taro.showToast({
                        title:"手机号未注册",
                        icon:"none",
                        duration:1500
                    });
                }
            });
        }
    }
    checkMobile = (mobile,callback:(is:boolean,msg?:string)=>void) => {
        Taro.showLoading({title:"正在验证..."});
        api("user/checkMobile",{
            mobile
        }).then((res)=>{
            Taro.hideLoading();
            if (res && parseInt(res.id+"")>0) {
                callback(true);
            } else {
                callback(false)
            }
        }).catch((e)=>{
            Taro.hideLoading();
            Taro.showToast({
                title:e,
                icon:"none",
                duration:1500
            });
        })
    }
    render(){
        const { codeBtnActive,showMobileClear,inputValue,inputActive,textActive,inputFocus } = this.state;
        // @ts-ignore
        return <View className='login find_page'>
            {/* @ts-ignore */}
            <View className='nav-bar' style={fixStatusBarHeight()}>
                <View className='back' onClick={()=>{
                    Taro.navigateBack();
                }}>
                    <IconFont name='24_shangyiye' size={48} color='#121314' />
                </View>
            </View>

            <View className='container'>
                <View className='title'>
                    <Text className='ttext'>Hi,</Text>
                    <Text className='ttext'>输入原手机号，找回密码</Text>
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
                        <Text className='gtext'>下一步</Text>
                    </View>
            </View>
        </View>
    }

}
