import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input,Button } from '@tarojs/components'
import './index.less'
import './set.less'
import IconFont from '../../components/iconfont';
import { api } from '../../utils/net';
import {userStore} from "../../store/user";
import { observer, inject } from '@tarojs/mobx'
import page from '../../utils/ext';

@inject("userStore")
@observer
@page({wechatAutoLogin:true})
export default class Set extends Component<any,{
    btnAtive:boolean;
    pwd:string;
    again:string
}> {
    config: Config = {
        navigationBarTitleText: '设置密码'
    }

    constructor(props) {
        super(props);

        this.state = {
            btnAtive:false,
            pwd:"",
            again:""
        }
    }
    componentDidMount(){
        

    }
    componentDidUpdate(){
        const {pwd,again} = this.state;
        if (pwd.length>=6 && again.length>=6) {
            this.setState({
                btnAtive:true
            })
        } else {
            this.setState({
                btnAtive:false
            })
        }
    }
    render(){

        const {btnAtive} = this.state;

        return <View className='set_page'>
            <View className='back' onClick={()=>{
                Taro.navigateBack();
            }}>
                <IconFont name='24_shangyiye' size={48} color='#121314' />
            </View>
            <View className='container'>
                <View className='tip'>
                    <Text className='txt'>设置你的新密码</Text>
                </View>
                <View className='acount-logins'>
                    <View className='acounts'>
                        <Input type='text' password placeholder='请输入新密码' className='acounts-input' onInput={({detail:{value}})=>this.setState({pwd:value})}/>
                    </View>
                    <View className='acounts'>
                        <Input type='text' password placeholder='再次输入密码' className='acounts-input' onInput={({detail:{value}})=>this.setState({again:value})}/>
                    </View>
                </View>
                <Button className={btnAtive?'loginbtn loginbtnActive':'loginbtn'} onClick={()=>{}}>确定</Button>
            </View>


    </View>
    }

}
