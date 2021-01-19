import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Button,ScrollView,Image } from '@tarojs/components'
import './printing.less'
import IconFont from '../../../../components/iconfont';
import {userStore} from "../../../../store/user";
import { observer, inject } from '@tarojs/mobx'
// import TipModal from '../../../../components/tipmodal/TipModal'
import {debuglog, deviceInfo, jumpToPrivacy, updateChannelCode} from '../../../../utils/common';


@inject("userStore")
@observer
export default class Printing extends Component<any,{
    tipModalShow:boolean;
    centerPartyHeight:number;
}> {

    config: Config = {
        navigationBarTitleText: '打印中',
        // backgroundColor:'#F5F6F9'
    }

    constructor(props){
        super(props);
        this.state = {
            tipModalShow:false,
            centerPartyHeight:500,

        }
    }
    componentDidMount(){
        if(deviceInfo.env == 'h5'){
            document.title = this.config.navigationBarTitleText || "打印中";
        }
        if (!userStore.isLogin) {
            if (deviceInfo.env == 'h5') {
                window.location.href = updateChannelCode("/pages/tabbar/index/index");
            } else {
                Taro.switchTab({
                    url: updateChannelCode('/pages/tabbar/index/index')
                })
            }
        }
        // if (process.env.TARO_ENV != 'h5') {
        //     Taro.createSelectorQuery().select(".nav-bar").boundingClientRect((nav_rect)=>{
        //         this.setState({
        //             centerPartyHeight:Taro.getSystemInfoSync().windowHeight-nav_rect.height
        //         });
        //     }).exec();
        // }
    }


    render() {
        const {} = this.state;
        // const {id,nickname} = userStore;

        return (
            <View className='doc_printing'>
                <View className='nav-bar' style={process.env.TARO_ENV === 'h5'?"":`padding-top:${Taro.getSystemInfoSync().statusBarHeight}px;`}>
                    <View className='left' onClick={() => {
                        if(process.env.TARO_ENV === 'h5'){
                            Taro.reLaunch({
                                url: updateChannelCode('/pages/tabbar/index/index')
                            });
                        } else {
                            Taro.switchTab({
                                url: updateChannelCode('/pages/tabbar/index/index')
                            });
                        }
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314'/>
                    </View>
                    <View className='center'>
                        <Text className='title'>{this.config.navigationBarTitleText}</Text>
                    </View>
                </View>
                
            </View>
        )
    }
}
