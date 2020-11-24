import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input,Button } from '@tarojs/components'
import './index.less'
import './find.less'
import IconFont from '../../components/iconfont';
import { api } from '../../utils/net';
import {userStore} from "../../store/user";
import { observer, inject } from '@tarojs/mobx'
// import page from '../../utils/ext';

@inject("userStore")
@observer
// @page({wechatAutoLogin:true})
export default class Set extends Component<any,{
    codeBtnActive:boolean;
    showMobileClear:boolean;
    inputActive:boolean
    inputValue:string;

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
            inputActive:false
        }
    }
    private inputRef: { inputRef: { focus: () => void; }; };
    componentDidMount(){
        

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
                url:`/pages/login/sms?mobile=${inputValue}&status=f`
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
    render(){
        const { codeBtnActive,showMobileClear,inputValue,inputActive } = this.state;
        return <View className='login find_page'>
            <View className='back' onClick={()=>{
                Taro.navigateBack();
            }}>
                <IconFont name='24_shangyiye' size={48} color='#121314' />
            </View>
            <View className='container'>
                <View className='title'>
                    <Text className='ttext'>Hi,</Text>
                    <Text className='ttext'>输入原手机号，找回密码</Text>
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
                        <Text className='gtext'>下一步</Text>
                    </View>
            </View>
        </View>
    }

}
