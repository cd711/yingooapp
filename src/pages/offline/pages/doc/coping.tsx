import Taro, {Component, Config} from '@tarojs/taro'
import {Button, Image, ScrollView, Text, View} from '@tarojs/components'
import './coping.less'
import IconFont from '../../../../components/iconfont';
import {userStore} from "../../../../store/user";
import {inject, observer} from '@tarojs/mobx'
import {
    debuglog,
    deviceInfo, getURLParamsStr, getUserKey,
    isEmptyX, jumpUri, removeDuplicationForArr,
    setPageTitle,
    setTempDataContainer,
    updateChannelCode, urlEncode
} from '../../../../utils/common';
import {api,options} from '../../../../utils/net';
import LoginModal from '../../../../components/login/loginModal';
import OperationTip from '../common/operation';




@inject("userStore")
@observer

export default class Coping extends Component<any, {
    centerPartyHeight:number;
    ShowOperationTip:boolean;
}> {

    config: Config = {
        navigationBarTitleText: '复印中',
    }

    constructor(props) {
        super(props);
        this.state = {
            centerPartyHeight:0,
            ShowOperationTip:true
        }
    }

    componentDidMount() {
        setPageTitle("复印中")
        if (process.env.TARO_ENV != 'h5') {
            Taro.createSelectorQuery().select(".nav-bar").boundingClientRect((nav_rect) => {
                Taro.createSelectorQuery().select(".status_bottom").boundingClientRect((bottom_rect) => {
                    this.setState({
                        centerPartyHeight: Taro.getSystemInfoSync().windowHeight - nav_rect.height - bottom_rect.height
                    });
                }).exec();
            }).exec();
        }
        // api("device.terminal/copyStatus",{
        //     order_id:
        // })
    }

    

    render() {
        const {centerPartyHeight,ShowOperationTip} = this.state;
        return (
            <View className='print_coping'>
                <LoginModal isTabbar={false}/>
                <View className='nav-bar'
                      style={process.env.TARO_ENV === 'h5' ? "" : `padding-top:${Taro.getSystemInfoSync().statusBarHeight}px;`}>
                    <View className='left' onClick={() => {
                        if (Taro.getCurrentPages().length>1) {
                            Taro.navigateBack();
                        } else {
                            jumpUri("/pages/tabbar/index/index",true);
                        }
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314'/>
                    </View>
                    <View className='center'>
                        <Text className='title'>{this.config.navigationBarTitleText}</Text>
                    </View>
                </View>
                <ScrollView scrollY enableFlex className='print_status_scroll'
                            style={process.env.TARO_ENV != 'h5' ? `height:${centerPartyHeight}px` : ""}>
                    <View className='print_status_container'>
                        <View className='tops'>
                            <Image src={`${options.sourceUrl}appsource/printing_doc.gif`} />
                            <Text className='txt'>打印机运行中，请放入复印文件</Text> 
                        </View>
                        <View className='page_items'>
                            <View className='page_item'>
                                <Text className='lefttxt'>第一页</Text>
                                <Text className='waitingputin'>请放入复印的文件</Text>
                            </View>
                            <View className='page_item'>
                                <Text className='lefttxt'>第二页</Text>
                                <Text className='waiting'>待打印</Text>
                            </View>
                            <View className='page_item'>
                                <Text className='lefttxt'>第三页</Text>
                                <Button className='startButton'>点击打印</Button>
                            </View>
                            <View className='page_item'>
                                <Text className='lefttxt'>第四页</Text>
                                <Text className='printing'>打印中</Text>
                            </View>
                            <View className='page_item'>
                                <Text className='lefttxt'>第五页</Text>
                                <Text className='printed'>已打印</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <View className='status_bottom'>
                    <View className='boxs'>
                        <Button className='re_scan_qrcode_button' onClick={()=>{}}>
                            <Image src={require("../../source/callphone.png")} className='button_img'/>
                            <Text className='button_txt'>联系客服</Text>
                        </Button>
                    </View>
                </View>
                <OperationTip isShow={ShowOperationTip} onClose={()=>{
                    this.setState({
                        ShowOperationTip:false
                    })
                }} onOkButton={()=>{
                    this.setState({
                        ShowOperationTip:false
                    })
                }}/>
            </View>
        )
    }
}

