import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image } from '@tarojs/components'
import './acount.less'
import IconFont from '../../../../components/iconfont';
import {userStore} from "../../../../store/user";
import { observer, inject } from '@tarojs/mobx'
import TipModal from '../../../../components/tipmodal/TipModal'
import {fixStatusBarHeight, updateChannelCode} from '../../../../utils/common';

@inject("userStore")
@observer
export default class Setting extends Component<any,{
    tipModalShow:boolean;
}> {

    config: Config = {
        navigationBarTitleText: '账号管理',
        // backgroundColor:'#F5F6F9'
    }

    constructor(props){
        super(props);
        this.state = {
            tipModalShow:false
        }
    }


    componentDidMount(){
        console.log(userStore.mobile)
    }


    render() {
        const {tipModalShow} = this.state;
        const {id,mobile,set_pwd} = userStore;

        return (
            <View className='acounts'>
                {/* @ts-ignore */}
                <View className='nav-bar' style={fixStatusBarHeight()}>
                    <View className='left' onClick={() => {
                        Taro.navigateBack();
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314'/>
                    </View>
                    <View className='center'>
                        <Text className='title'>{this.config.navigationBarTitleText}</Text>
                    </View>
                </View>
                <View className='alist'>
                    <View className='item'>
                        <Text className='name'>映果号</Text>
                        <View className='right'>
                            <Text className='rtxt'>{id}</Text>
                            {/* <IconFont name='20_xiayiye' size={40} color="#9C9DA6" /> */}
                        </View>
                    </View>
                    <View className='item' onClick={()=>{
                        if (mobile.length!=11) {
                            Taro.navigateTo({
                                url: updateChannelCode(`/pages/login/mobile`)
                            })
                        }
                    }}>
                        <Text className='name'>手机绑定</Text>
                        <View className='right'>
                            <Text className='rtxt'>{mobile.length==11?`${mobile.substr(0,3)}****${mobile.substr(mobile.length-4,4)}`:"未绑定"}</Text>
                            <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                        </View>
                    </View>
                    <View className='item' onClick={()=>{
                            if (mobile.length!=11) {
                                Taro.showToast({
                                    title:'请先绑定手机号码',
                                    icon:'none',
                                    duration:2000
                                })
                                return;
                            }
                            if (set_pwd) {
                                return;
                            }
                            Taro.navigateTo({
                                url: updateChannelCode('/pages/login/set')
                            })
                        }}>
                        <Text className='name'>密码</Text>
                        <View className='right'>
                            <Text className='rtxt'>{set_pwd?'已设置':'未设置'}</Text>
                            <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                        </View>
                    </View>
                </View>
                <View className='alist'>
                    <Text className='title'>其他方式登录</Text>
                    {/* <View className='item' onClick={()=>{
                        this.setState({
                            tipModalShow:true
                        })
                    }}>
                        <Text className='name'>QQ</Text>
                        <View className='right'>
                            <Text className='rtxt'>8888888</Text>
                            <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                        </View>
                    </View> */}
                    <View className='item' onClick={()=>{
                        Taro.showToast({
                            title:'解绑功能开发中',
                            icon:'none'
                        })
                        // this.setState({
                        //     tipModalShow:true
                        // })
                    }}>
                        <Text className='name'>微信</Text>
                        <View className='right'>
                            <Image src={userStore.isLogin?userStore.avatar:require('../../../../source/defaultAvatar.png')} className='rimg' />
                            <Text className='rtxt'>{userStore.nickname}</Text>
                            <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                        </View>
                    </View>
                </View>


                <View style={{paddingTop:54}} />
                <TipModal isShow={tipModalShow} tip='是否解除当前绑定的微信？' onCancel={()=>{
                    this.setState({
                        tipModalShow:false
                    })
                }} cancelText='取消' okText='解绑' />
            </View>
        )
    }
}
