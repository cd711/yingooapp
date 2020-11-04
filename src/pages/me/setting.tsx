import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import './setting.less'
import IconFont from '../../components/iconfont';
// / npx iconfont-taro
import {userStore} from "../../store/user";
import { observer, inject } from '@tarojs/mobx'
import { AtNavBar} from 'taro-ui'
import TipModal from '../../components/tipmodal/TipModal'

@inject("userStore")
@observer
export default class Setting extends Component<any,{
    tipModalShow:boolean;
}> {

    config: Config = {
        navigationBarTitleText: '设置',
        // backgroundColor:'#F5F6F9'
    }

    constructor(props){
        super(props);
        this.state = {

            tipModalShow:false
        }
    }



    componentDidMount() { 
        // alert(Taro.getSystemInfoSync().statusBarHeight);
        console.log(Taro.getSystemInfoSync(),userStore.nickname)
        
    }

    render() {
        const {tipModalShow} = this.state;
        // const {id,nickname} = userStore;
        
        return (
            <View className='setting'>
                <AtNavBar
                    onClickLeftIcon={()=>{
                        Taro.navigateBack();
                    }}
                    color='#121314'
                    title='设置'
                    border={false}
                    fixed
                    leftIconType={{
                        value:'chevron-left',
                        color:'#121314',
                        size:24
                    }}
                />
                <View className='slist' style={{paddingTop:60}}>
                    <Text className='title'>个人/账号</Text>
                    <View className='item' onClick={()=>{
                        Taro.navigateTo({
                            url:'/pages/me/profile'
                        })
                    }}>
                        <Text className='name'>个人信息</Text>
                        <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                    </View>
                    <View className='item' onClick={()=>{
                        Taro.navigateTo({
                            url:'/pages/me/acount'
                        })
                    }}>
                        <Text className='name'>账号管理</Text>
                        <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                    </View>
                </View>
                <View className='slist'>
                    <Text className='title'>通用</Text>
                    <View className='item' onClick={()=>{
                        Taro.navigateTo({
                            url:'/pages/me/photos'
                        })
                    }}>
                        <Text className='name'>素材库</Text>
                        <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                    </View>
                    <View className='item' onClick={()=>{
                        Taro.navigateTo({
                            url:'/pages/me/address/index'
                        })
                    }}>
                        <Text className='name'>收货地址</Text>
                        <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                    </View>
                </View>
                <View className='slist'>
                    <Text className='title'>关于反馈</Text>
                    <View className='item'>
                        <Text className='name'>问题反馈</Text>
                        <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                    </View>
                    <View className='item'>
                        <Text className='name'>用户协议</Text>
                        <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                    </View>
                    <View className='item'>
                        <Text className='name'>隐私政策</Text>
                        <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                    </View>
                    <View className='item'>
                        <Text className='name'>关于我们</Text>
                        <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                    </View>
                </View>
                <Button className='quit' onClick={()=>{
                    this.setState({
                        tipModalShow:true
                    })
                }}>退出登录</Button>
                <View style={{paddingTop:54}}></View>
                <TipModal isShow={tipModalShow} tip='是否退出当前账号？' onCancel={(e)=>{
                    this.setState({
                        tipModalShow:false
                    })
                    console.log(e)
                }} onOK={(e)=>{
                    console.log(e);
                    Taro.removeStorage({key:"TaroInfoKey"});
                    Taro.removeStorage({key:"token"});
                    Taro.switchTab({url:"/pages/index/index"});
                }} cancelText='不退出' okText='退出' />
            </View>
        )
    }
}
