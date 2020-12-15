import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Button,ScrollView } from '@tarojs/components'
import './setting.less'
import IconFont from '../../../../components/iconfont';
// / npx iconfont-taro
import {userStore} from "../../../../store/user";
import { observer, inject } from '@tarojs/mobx'
import TipModal from '../../../../components/tipmodal/TipModal'
import { deviceInfo } from '../../../../utils/common';


@inject("userStore")
@observer
export default class Setting extends Component<any,{
    tipModalShow:boolean;
    centerPartyHeight:number
}> {

    config: Config = {
        navigationBarTitleText: '设置',
        // backgroundColor:'#F5F6F9'
    }

    constructor(props){
        super(props);
        this.state = {
            tipModalShow:false,
            centerPartyHeight:500
        }
    }
    componentDidMount(){
        if (!userStore.isLogin) {
            if (deviceInfo.env == 'h5') {
                window.location.href = "/pages/index/index";
            } else {
                Taro.switchTab({
                    url:'/pages/index/index'
                })
            }
        }
        if (process.env.TARO_ENV != 'h5') {
            Taro.createSelectorQuery().select(".nav-bar").boundingClientRect((nav_rect)=>{
                this.setState({
                    centerPartyHeight:Taro.getSystemInfoSync().windowHeight-nav_rect.height
                });
            }).exec();
        }
    }
    loginOut = () => {
        try{
            Taro.removeStorageSync("TaroInfoKey");
            Taro.removeStorageSync("token");
            userStore.clear();
            this.setState({tipModalShow: false})
            Taro.showLoading({title: "请稍后..."});

            setTimeout(() => {
                Taro.hideLoading()
            }, 1500)
            setTimeout(() => {
                if(process.env.TARO_ENV === 'h5'){
                    window.location.href = "/pages/index/index"
                } else {
                    Taro.reLaunch({url: "/pages/index/index"});
                }
            }, 1501)
        }catch (e) {
            console.log(e)
        }
    }

    render() {
        const {tipModalShow,centerPartyHeight} = this.state;
        // const {id,nickname} = userStore;

        return (
            <View className='setting'>
                <View className='nav-bar' style={process.env.TARO_ENV === 'h5'?"":`padding-top:${Taro.getSystemInfoSync().statusBarHeight}px;`}>
                    <View className='left' onClick={() => {
                        if(process.env.TARO_ENV === 'h5'){
                            Taro.reLaunch({
                                url:'/pages/me/me'
                            });
                        } else {
                            Taro.switchTab({
                                url:'/pages/me/me'
                            });
                        }
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314'/>
                    </View>
                    <View className='center'>
                        <Text className='title'>{this.config.navigationBarTitleText}</Text>
                    </View>
                </View>
                <ScrollView scrollY className='setting_page_scroll' style={process.env.TARO_ENV === 'h5'?"":`height:${centerPartyHeight}px`}>
                <View className='slist'>
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
                    <View className='item' onClick={() => Taro.navigateTo({url: "/pages/me/feedback"})}>
                        <Text className='name'>问题反馈</Text>
                        <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                    </View>
                    <View className='item' onClick={() => Taro.navigateTo({url: `/pages/me/privacy?pageType=user_agreement`})}>
                        <Text className='name'>用户协议</Text>
                        <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                    </View>
                    <View className='item' onClick={() => Taro.navigateTo({url: `/pages/me/privacy?pageType=privacy`})}>
                        <Text className='name'>隐私政策</Text>
                        <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                    </View>
                    <View className='item' onClick={() => Taro.navigateTo({url: `/pages/me/aboutus`})}>
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
                </ScrollView>
                <TipModal isShow={tipModalShow} tip='是否退出当前账号？' onCancel={()=>{
                    this.setState({
                        tipModalShow:false
                    })
                }} onOK={this.loginOut} cancelText='不退出' okText='退出' />
            </View>
        )
    }
}
