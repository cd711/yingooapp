import Taro, {Component, Config} from '@tarojs/taro'
import {Button, Image, ScrollView, Text, View} from '@tarojs/components'
import './order.less'
import IconFont from '../../../../components/iconfont';
import {userStore} from "../../../../store/user";
import {inject, observer} from '@tarojs/mobx'
import {
    debuglog,
    deviceInfo, getTempDataContainer, getURLParamsStr, getUserKey,
    isEmptyX, jumpUri, removeDuplicationForArr,
    setPageTitle,
    setTempDataContainer,
    updateChannelCode, urlEncode
} from '../../../../utils/common';
import {api} from '../../../../utils/net';
import LoginModal from '../../../../components/login/loginModal';
import Counter from '../../../../components/counter/counter';
import OfflinePrint from '../../../../utils/offlinePrint';



@inject("userStore")
@observer

export default class PrintOrder extends Component<any, {
    centerPartyHeight:number;
    terminal_status_text:string;
    waitingNumber:string;
    waitingTime:string;
    pages:number;
    number:number;
    payPrice:string;
    pre_order_id:string;
    prepay_id:string
}> {

    config: Config = {
        navigationBarTitleText: '提交订单',
    }

    constructor(props) {
        super(props);
        this.state = {
            centerPartyHeight:0,
            terminal_status_text:"运行中",
            waitingNumber:"无",
            waitingTime:"直接打印",
            pages:1,
            number:1,
            payPrice:"0",
            pre_order_id:"",
            prepay_id:""
        }
    }

    componentDidMount() {
        setPageTitle("提交订单");
        if (process.env.TARO_ENV != 'h5') {
            Taro.createSelectorQuery().select(".nav-bar").boundingClientRect((nav_rect) => {
                Taro.createSelectorQuery().select(".status_bottom").boundingClientRect((bottom_rect) => {
                    this.setState({
                        centerPartyHeight: Taro.getSystemInfoSync().windowHeight - nav_rect.height - bottom_rect.height
                    });
                }).exec();
            }).exec();
        }
        const {t} = this.$router.params;
        if (t) {
            const key = "order_preview_"+t;
            Taro.showLoading({title:"加载中..."})
            getTempDataContainer(key,(value)=>{
                console.log(value);
                OfflinePrint.terminalStatus(value.tid).then((res)=>{
                    Taro.hideLoading();
                    const pagen = parseInt(res.currentCopyDoc.pages+"")>0 ?parseInt(res.currentCopyDoc.queue_num+""):0;                
                    this.setState({
                        terminal_status_text:res.status_text,
                        waitingNumber:parseInt(res.currentCopyDoc.queue_num+"")>0?res.currentCopyDoc.queue_num+"":"无",
                        waitingTime:pagen>0?(pagen*20)+"秒":"直接打印"
                    });
                    this.setState({
                        number:value.number,
                        pages:value.pages,
                        payPrice:value.order_price,
                        pre_order_id:value.pre_order_id
                    })
                }).catch((e)=>{
                    Taro.hideLoading();
                    Taro.showToast({
                        title:e,
                        icon:"none",
                        duration:2000
                    });
                    setTimeout(() => {
                        Taro.navigateBack();
                    }, 2000);
                })

            });
        } else {
            Taro.navigateBack();
        }
        
    }
    private initPayWayModal = false;
    onSubmitOrder = () => {
        // this.setState({
        //     showPayWayModal:true
        // })
        this.initPayWayModal = true;
        const {pre_order_id} = this.state;

        // this.checkOrder(data.prepay_id,false);
        // Taro.showLoading({title: '加载中...'})
        // api('app.order/add', {
        //     prepay_id: data.prepay_id,
        //     remarks: isEmptyX(orderMessages)?"":JSON.stringify(orderMessages)
        // }).then((res) => {
        //     debuglog("ccc",res);
        //     Taro.hideLoading();
        //     this.setState({
        //         real_order_id:res.real_order_id
        //     })
        //     if (res.status > 0) {
               
        //         Taro.navigateTo({
        //             url:updateChannelCode(`/pages/offline/pages/doc/printing?id=${res.real_order_id[0]}&printtype=${terminalPrintType}`)
        //         });
        //         return;
        //     }
        //     this.setState({
        //         real_order_id:res.real_order_id,
        //         payPrice:parseFloat(res.pay_price+"").toFixed(2),
        //         order_sn: res.order_sn,
        //         showPayWayModal: true,
        //         payStatus:res.status
        //     });
        // }).catch((e) => {
        //     Taro.hideLoading();
        //     setTimeout(() => {
        //         window.history.replaceState(null, null, updateChannelCode('/pages/tabbar/me/me'));
        //         Taro.getApp().tab = 1;
        //         if (deviceInfo.env == 'h5') {
        //             window.location.href = updateChannelCode('/pages/tabbar/order/order?tab=1')
        //         } else {
        //             Taro.switchTab({
        //                 url: updateChannelCode('/pages/tabbar/order/order?tab=1')
        //             })
        //         }

        //     }, 2000);
        //     Taro.showToast({
        //         title: e,
        //         duration: 2000,
        //         icon: "none"
        //     });

        // })

    }
    

    render() {
        const {centerPartyHeight,terminal_status_text,waitingNumber,waitingTime,pages,number,payPrice} = this.state;
        return (
            <View className='print_status_order'>
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
                        <View className='print_status_box'>
                            <View className='device_status'>
                                <Image src='https://cdn.playbox.yingoo.com/appsource/device_print.png'
                                       className='icon'/>
                                <Text className='txt'>{terminal_status_text}</Text>
                            </View>
                            <View className='waiting_box'>
                                <View className='waiting'>
                                    <Text className='num'>{waitingNumber}</Text>
                                    <Text className='wtip'>排队人数</Text>
                                </View>
                                <View className='time'>
                                    <Text className='ttop'>{waitingTime}</Text>
                                    <Text className='ttip'>预计时间</Text>
                                </View>
                            </View>
                        </View>
                        <View className='status_item'>
                            <View className='print_item'>
                                <Text className='left_txt'>纸张大小</Text>
                                <Text className='right_txt'>A4</Text>
                            </View>
                            <View className='print_item'>
                                <Text className='left_txt'>文档页数</Text>
                                <Text className='right_txt'>{pages}页</Text>
                            </View>
                            <View className='print_item'>
                                <Text className='left_txt'>打印份数</Text>
                                <Counter num={number} />
                            </View>
                            <View className='print_item'>
                                <Text className='left_txt'>商品共计</Text>
                                <Text className='right_txt'>￥{payPrice}</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <View className='status_bottom'>
                    <View className='boxs'>
                        <Button className='re_scan_qrcode_button' onClick={()=>{
                            Taro.navigateTo({
                                url:updateChannelCode("/pages/offline/pages/doc/coping")
                            })
                        }}>提交订单</Button>
                    </View>
                </View>
            </View>
        )
    }
}

