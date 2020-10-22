import { ComponentType } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image, Button } from '@tarojs/components'
import './setting.less'
import IconFont from '../../components/iconfont';
// / npx iconfont-taro
import {userStore} from "../../store/user";
import { observer, inject } from '@tarojs/mobx'
import { AtNavBar} from 'taro-ui'
import {TipModal} from '../../components/tipmodal/TipModal'

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





    handleClick = () => {}
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
                <View className='alist' style={{paddingTop:60}}>
                    <View className='item' onClick={()=>{
                    }}>
                        <Text className='name'>映果号</Text>
                        <View className='right'>
                            <Text className='rtxt'>YG_337700</Text>
                            {/* <IconFont name='20_xiayiye' size={40} color="#9C9DA6" /> */}
                        </View>
                    </View>
                    <View className='item'>
                        <Text className='name'>手机绑定</Text>
                        <View className='right'>
                            <Text className='rtxt'>156****8888</Text>
                            <IconFont name='20_xiayiye' size={40} color="#9C9DA6" />
                        </View>
                    </View>
                    <View className='item'>
                        <Text className='name'>密码</Text>
                        <View className='right'>
                            <Text className='rtxt'>未设置</Text>
                            <IconFont name='20_xiayiye' size={40} color="#9C9DA6" />
                        </View>
                    </View>
                </View>
                <View className='alist'>
                    <Text className='title'>其他方式登录</Text>
                    <View className='item'>
                        <Text className='name'>QQ</Text>
                        <View className='right'>
                            <Text className='rtxt'>8888888</Text>
                            <IconFont name='20_xiayiye' size={40} color="#9C9DA6" />
                        </View>
                    </View>
                    <View className='item'>
                        <Text className='name'>微信</Text>
                        <View className='right'>
                            <Image src={require('../../source/defaultAvatar.png')} />
                            <Text className='rtxt'>156****8888</Text>
                            <IconFont name='20_xiayiye' size={40} color="#9C9DA6" />
                        </View>
                    </View>
                </View>


                <View style={{paddingTop:54}}></View>
                <TipModal isShow={tipModalShow} tip="是否解除当前绑定的微信？" onCancel={(e)=>{
                    this.setState({
                        tipModalShow:false
                    })
                    console.log(e)
                }} onOK={(e)=>{
                    console.log(e)
                }}/>
            </View>
        )
    }
}
