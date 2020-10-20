import { ComponentType } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input,Image } from '@tarojs/components'
import './sms.less'
import IconFont from '../../components/iconfont';

export default class SMS extends Component<any,{
    smsCode:string;
    auto:boolean
}> {
    config: Config = {
        navigationBarTitleText: '验证码'
    }
    private input;
    constructor(props) {
        super(props);

        this.state = {
            smsCode:"",
            auto:false
        }
    }
    componentDidMount(){
        console.log(this.$router.params);
        
    }
    onCodeInput = ({detail:{value}})=>{
        console.log(value)
        this.setState({
            smsCode:value
        })
    }
    render(){
        const {mobile} = this.$router.params;
        const {smsCode,auto} = this.state;
        const list = [0, 1, 2, 3, 4, 5];
        return <View className='sms'>
            <View className='back' onClick={()=>{
                Taro.navigateBack();
            }}>
                <IconFont name='24_shangyiye' size={24} color='#121314'/>
            </View>
            <View className='box'>
                <Text className='title'>输入短信验证码</Text>
                <View className='subtitle'>
                    <Text className='sendto'>验证码已发送至</Text>
                    <Text className='mobile-number'>{mobile}</Text>
                </View>
                <View className='inputBox'>
                    <Input type='number' placeholder='' className="smscode" maxLength={6} onInput={this.onCodeInput} value={smsCode} focus={auto}/>
                    <View className='inputrow'>
                        {list.map((item,index)=><View key={item} className='code-box'>
                            <View className='intput-code-box'>
                                <Text>{smsCode[item]}</Text>
                            </View>
                        </View>)}
                    </View>
                </View>
            </View>
    </View>
    }

}
