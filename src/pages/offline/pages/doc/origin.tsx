import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Button,ScrollView,Image } from '@tarojs/components'
import './origin.less'
import IconFont from '../../../../components/iconfont';
import {userStore} from "../../../../store/user";
import { observer, inject } from '@tarojs/mobx'
// import TipModal from '../../../../components/tipmodal/TipModal'
import {debuglog, deviceInfo, jumpToPrivacy, updateChannelCode} from '../../../../utils/common';
import ScanTipModal from '../../../../components/scanTipModal/scantipmodal';


@inject("userStore")
@observer
export default class Origin extends Component<any,{
    tipModalShow:boolean;
    centerPartyHeight:number;
}> {

    config: Config = {
        navigationBarTitleText: '选择来源',
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
            document.title = this.config.navigationBarTitleText || "选择来源";
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
            <View className='doc_origin'>
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
                <View className='origin_title'>
                    <Text className='txt'>请选择上传方式</Text>
                </View>
                <View className='origin_way_list'>
                    <View className='origin_way_item origin_way_item_green' onClick={()=>{
                        Taro.chooseMessageFile({
                            count:1,
                            type:"file",
                            success:(res)=>{
                                console.log(res);

                            }
                        })
                    }}>
                        <View className='box'>
                            <Text className='wechat_chat'>微信聊天</Text>
                            <Text className='from_chat'>从微信聊天中上传</Text>
                            <View className='push_right'>
                                <Image className='icon' src={require("../../source/right.png")} />
                            </View>
                        </View>
                        <Image className='t_wechat' src={require("../../source/t_wechat.png")} />
                        <Image className='b_wechat' src={require("../../source/wechat_chat.png")} />
                    </View>
                    <View className='origin_way_item origin_way_item_orange' onClick={()=>{
                        Taro.navigateTo({
                            url:"/pages/offline/pages/doc/mydoc"
                        })
                    }}>
                        <View className='box'>
                            <Text className='wechat_chat'>我的文档</Text>
                            <Text className='from_chat'>从我的文档库中选择</Text>
                            <View className='push_right'>
                                <Image className='icon' src={require("../../source/right.png")} />
                            </View>
                        </View>
                        <Image className='t_wechat' src={require("../../source/t_doc.png")} />
                        <Image className='b_wechat' src={require("../../source/doc.png")} />
                    </View>
                </View>
                <ScanTipModal isShow={false}>
                    <View className='ScanTipModal_title'>
                        <Text className='txt'>设备状态不正常</Text>
                    </View>
                </ScanTipModal>
            </View>
        )
    }
}
