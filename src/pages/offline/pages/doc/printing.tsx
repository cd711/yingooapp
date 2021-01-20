import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Button,ScrollView,Image } from '@tarojs/components'
import './printing.less'
import IconFont from '../../../../components/iconfont';
import {userStore} from "../../../../store/user";
import { observer, inject } from '@tarojs/mobx'
// import TipModal from '../../../../components/tipmodal/TipModal'
import {debuglog, deviceInfo, jumpToPrivacy, updateChannelCode} from '../../../../utils/common';
import { options } from '../../../../utils/net';
import { AtActivityIndicator } from 'taro-ui'


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
                <View className='print_top'>
                    {/* 打印文档 ${options.sourceUrl}appsource/printing_doc.gif */}
                    {/* 打印照片 ${options.sourceUrl}appsource/printing_photo.gif */}
                    <Image className='print_gif' src={`${options.sourceUrl}appsource/printing_doc.gif`} />
                </View>
                <View className='printing_time_line'>
                    <View className='time_line_item'>
                        <View className='state'>
                            <IconFont name='22_yixuanzhong' size={30} />
                            <Text className='txt finished'>订单处理成功</Text>
                        </View>
                        <View className='line'></View>
                    </View>

                    <View className='time_line_item'>
                        <View className='state'>
                            <AtActivityIndicator size={30} color="#FF4966"></AtActivityIndicator>
                            <Text className='txt finished'>处理中...</Text>
                        </View>
                        <View className='line'></View>
                    </View>

                    <View className='time_line_item'>
                        <View className='state'>
                            <View className='wait_circle'></View>
                            <Text className='txt wait'>等待处理</Text>
                        </View>
                        <View className='line'></View>
                    </View>

                    <View className='time_line_item'>
                        <View className='state'>
                            <View className='wait_circle'></View>
                            <Text className='txt wait'>处理完成</Text>
                        </View>
                    </View>
                </View>
            </View>
        )
    }
}
