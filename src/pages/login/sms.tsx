import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input } from '@tarojs/components'
import './sms.less'
import IconFont from '../../components/iconfont';
import { api } from '../../utils/net';
import {userStore} from "../../store/user";
import { observer, inject } from '@tarojs/mobx'

@inject("userStore")
@observer
export default class SMS extends Component<any,{
    smsCode:string;
    time:number
}> {
    config: Config = {
        navigationBarTitleText: '验证码'
    }
    private input;
    private timer;
    constructor(props) {
        super(props);

        this.state = {
            smsCode:"",
            time:0
        }
    }
    componentDidMount(){

        this.input.inputRef.focus();
        this.sendCode();
    }
    sendCode = () => {
        const {mobile} = this.$router.params;
        Taro.showLoading({title:"正在发送..."});
        api("sms/send",{
            mobile,
            event:"login"
        }).then((res)=>{
            Taro.hideLoading();
            console.log(res)
            if (res && res.time) {
                this.setState({
                    time:res.time
                });
                this.timer = setInterval(()=>{
                    res.time = parseInt(res.time+"");
                    res.time --;
                    this.setState({
                        time:res.time
                    });
                    if (res.time == 0) {
                        clearInterval(this.timer);
                    }
                },1000);
            }
        }).catch((e)=>{
            Taro.hideLoading();
            Taro.showToast({
                title:e,
                icon:"none",
                duration:1500
            })
        })
    }
    mobileLogin = (code) => {
        const {mobile} = this.$router.params;
        Taro.showLoading({title:"加载中..."});
        api("user/mobilelogin",{
            mobile,
            captcha:code,
        }).then((res)=>{
            userStore.setInfo(res);
            Taro.hideLoading();
            Taro.reLaunch({
                url:"/pages/index/index"
            })
        }).catch((e)=>{
            Taro.hideLoading();
            console.log(e)
            Taro.showToast({
                title:e,
                icon:"none",
                duration:1500
            })
        })
    }
    onCodeInput = ({detail:{value}})=>{
        console.log(value)
        this.setState({
            smsCode:value
        });
        if (value.length == 6) {
            this.mobileLogin(value);
        }
    }
    render(){
        const {mobile} = this.$router.params;
        const {smsCode,time} = this.state;
        const list = [0, 1, 2, 3, 4, 5];
        return <View className='sms'>
            <View className='back' onClick={()=>{
                Taro.navigateBack();
            }}>
                <IconFont name='24_shangyiye' size={48} color='#121314' />
            </View>
            <View className='box'>
                <Text className='title'>输入短信验证码</Text>
                <View className='subtitle'>
                    <Text className='sendto'>验证码已发送至</Text>
                    <Text className='mobile-number'>{mobile}</Text>
                </View>
                <View className='inputBox' onClick={()=>{
                    // document.querySelector(".smscode").focus()
                    this.input.inputRef.focus();
                }}>
                    <Input type='number' placeholder='' className='smscode' maxLength={6} onInput={this.onCodeInput} value={smsCode} onBlur={(e)=>{
                        //@ts-ignore
                        e.target.focus();
                    }} ref={(node)=>{
                        this.input = node;
                    }} />
                    <View className='inputrow'>
                        {list.map((item)=><View key={item} className={smsCode.length>item?"code-box code-box-active":smsCode.length==item?"code-box code-box-on":'code-box'}>
                            <View className='intput-code-box'>
                                <Text>{smsCode[item]}</Text>
                            </View>
                        </View>)}
                    </View>
                </View>
                <View className='opTips'>
                    {
                        time == 0?<View onClick={()=>{
                            this.sendCode();
                        }}><Text className='resend'>重新发送</Text></View>:<View className='tipLine'>
                            <Text className='tl1'>{time}</Text>
                            <Text className='tl2'>后重发</Text>
                        </View>
                    }
                </View>
            </View>
    </View>
    }

}
