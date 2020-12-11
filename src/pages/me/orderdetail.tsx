import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image,Button,ScrollView } from '@tarojs/components'
import './orderdetail.less'
import IconFont from '../../components/iconfont';
import { api } from '../../utils/net'
import isEmpty from 'lodash/isEmpty';
import { deviceInfo, fixStatusBarHeight, ossUrl } from '../../utils/common';
import moment from "moment";
import PayWayModal from '../../components/payway/PayWayModal';
import { templateStore } from '../../store/template';
import { observer, inject } from '@tarojs/mobx';
import page from '../../utils/ext';
import { AtModal,AtModalContent } from "taro-ui"
import copy from 'copy-to-clipboard';
import TipModal from '../../components/tipmodal/TipModal';
import Fragment from '../../components/Fragment';

@inject("templateStore")
@observer
@page({wechatAutoLogin:true})
export default class OrderDetail extends Component<{},{
    data:any,
    hours:string,
    minutes:string,
    seconds:string,
    showPayWayModal:boolean,
    navBarChange:boolean,
    showServiceModal:boolean,
    showCancelModal:boolean,
    centerPartyHeight:number
}> {

    config: Config = {
        navigationBarTitleText: '我的订单'
    }

    constructor(props){
        super(props);
        this.state = {
            data:{},
            hours:"00",
            minutes:"00",
            seconds:"00",
            showPayWayModal:false,
            navBarChange:false,
            showServiceModal:false,
            showCancelModal:false,
            centerPartyHeight:500
        }
    }
    componentDidMount(){
        if (process.env.TARO_ENV != 'h5') {
            Taro.createSelectorQuery().select(".nav-bar").boundingClientRect((nav_rect)=>{
                console.log(nav_rect)
                Taro.createSelectorQuery().select(".ops").boundingClientRect((status_react)=>{
                    console.log(status_react)
                    this.setState({
                        centerPartyHeight:Taro.getSystemInfoSync().windowHeight-nav_rect.height-status_react.height
                    });
                }).exec();
            }).exec();
        }
        templateStore.address = null;
        const {id} = this.$router.params;
        if (id) {
            api("app.order/info",{
                id
            }).then((res)=>{
                
                clearInterval(this.intervalTime);
                this.setState({
                    data:res,
                    hours:"00",
                    minutes:"00",
                    seconds:"00"
                });
                if (res.state_tip.value == 1) {
                    this.calcTime(res.create_time);
                }
            }).catch((e)=>{
                Taro.hideLoading();
                Taro.showToast({
                    title:e||"服务器开小差了，稍后再试",
                    icon:"none",
                    duration:2000
                })
            })
        }

    }
    componentDidShow(){
        if(templateStore.address !=  null){
            Taro.showLoading({title:"加载中..."});
            const {data} = this.state;
            api("app.order/editAddress",{
                id:data.id,
                address_id:templateStore.address.id
            }).then((res)=>{
                Taro.hideLoading();
                clearInterval(this.intervalTime);
                this.setState({
                    data:res,
                    hours:"00",
                    minutes:"00",
                    seconds:"00"
                });
                if (res.state_tip.value == 1) {
                    this.calcTime(res.create_time);
                }
            }).catch((e)=>{
                Taro.hideLoading();
                Taro.showToast({
                    title:e||"服务器开小差了，稍后再试",
                    icon:"none",
                    duration:2000
                })
            })
        }

    }
    
    private intervalTime:any = 0;
    calcTime = (time) =>{
        const ftime:any = moment.unix(time).add(30,'m');
        const dd = () => {
            const nowt:any = moment();
            const du = moment.duration(ftime - nowt, 'ms');
            let hours = du.get('hours');
            let mins = du.get('minutes');
            let ss = du.get('seconds');
            if (hours<=0 && mins<=0 && ss<=0) {
                clearInterval(this.intervalTime);
                hours = 0;
                mins = 0;
                ss = 0;
            }
            this.setState({
                hours:hours>=0 && hours<=9 ? `0${hours}` : `${hours}`,
                minutes:mins>=0 && mins<=9 ? `0${mins}` : `${mins}`,
                seconds:ss>=0 && ss<=9 ? `0${ss}` : `${ss}`,
            });
        }
        dd();
        this.intervalTime = setInterval(dd, 1000);
    }
    private cancelId = 0;
    onCancelOrder = (id) => {
        this.cancelId = id;
        this.setState({
            showCancelModal:true
        })

    }
    handleCancel = () => {
        this.setState({showCancelModal:false})
        if (this.cancelId == 0) {
            this.cancelId = 0;
            return;
        }
        Taro.showLoading({title:"处理中"})
        api("app.order/cancel",{
            id:this.cancelId
        }).then((res)=>{
            Taro.hideLoading();
            clearInterval(this.intervalTime);
            this.setState({
                data:res,
                hours:"00",
                minutes:"00",
                seconds:"00"
            });
            if (res.state_tip.value == 1) {
                this.calcTime(res.create_time);
            }
            Taro.showToast({
                title:'取消成功',
                icon:'none',
                duration:2000
            });
        }).catch((e)=>{
            Taro.hideLoading();
            Taro.showToast({
                title:e,
                icon:'none',
                duration:2000
            });
        })
    }
    onDelOrder = (id) => {
        Taro.showLoading({title:"处理中"})
        api("app.order/del",{
            id
        }).then(()=>{
            Taro.hideLoading();
            setTimeout(() => {
                Taro.navigateBack();
            }, 2000);
            Taro.showToast({
                title:'删除成功',
                icon:'none',
                duration:2000
            });

        }).catch(()=>{
            Taro.hideLoading();
            Taro.showToast({
                title:'服务器开小差了，稍后再试',
                icon:'none',
                duration:2000
            });
        })
    }
    onResult = (res) => {
        if (res.code == 1) {
            
        } else {
            Taro.showToast({
                title:res.data,
                icon:'none',
                duration:2000
            });
        }
    }
    onScroll = (e) => {
        const top = e.detail.scrollTop;
        let navBarChange = false;
        if (top>24) {
            navBarChange = true;
        }
        this.setState({
            navBarChange
        })
    }
    onReceviceOrder = (id) => {
        api('app.order/receive',{
            id
        }).then(()=>{
            Taro.hideLoading();
            // this.getList(this.state.switchTabActive)
        }).catch(()=>{
            Taro.hideLoading();
            Taro.showToast({
                title:'服务器开小差了，稍后再试',
                icon:'none',
                duration:2000
            });
        })
    }
    onServiceModalShow = () => {
        this.setState({
            showServiceModal:true
        })
    }
    render() {
        const { data,hours,minutes,seconds,showPayWayModal,navBarChange,showServiceModal,showCancelModal,centerPartyHeight } = this.state;
        const state = data.state_tip?data.state_tip.value:0;
        const afterState = data.after_sale_status_tip?data.after_sale_status_tip.value:0;
        let status = data.state_tip?data.state_tip.text:"";
        status = afterState!=0?data.after_sale_status_tip.text:status;
        const plist = isEmpty(data.products)?[]:data.products;
        // @ts-ignore
        return (
            <View className='order-detail'>
                {/* style={`background: ${navBarChange?"#FF4966":"#FFF"}`} */}
                {/* @ts-ignore */}
                <View className={navBarChange?'nav-bar':(state==-1?'nav-bar bar-gray':'nav-bar bar-active')} style={fixStatusBarHeight()}>
                    <View className='left' onClick={() => {
                        if (Taro.getCurrentPages().length==1) {
                            Taro.navigateTo({
                                url:"/pages/me/order?tab=0"
                            })
                        }else{
                            Taro.navigateBack();
                        }
                    }}>
                        <IconFont name='24_shangyiye' size={48} color={navBarChange?'#121314':'#FFF'} />
                    </View>
                    <View className='center'>
                        <Text className='title'>我的订单</Text>
                    </View>
                    <View className='right' onClick={this.onServiceModalShow}>
                        <IconFont name='24_kefu' size={48} color={navBarChange?'#121314':'#FFF'} />
                    </View>
                </View>
                <ScrollView scrollY className='order_content_page' onScroll={this.onScroll} style={deviceInfo.env === 'h5'?"":`height:${centerPartyHeight}px`}>
                <View className='container'>
                <View className='top' style={`background:${state==-1?'#9C9DA6':'#FF4966'}`}>
                    <View className='status'>
                        <Text className='statustxt'>{status}</Text>
                        <View className='time-tip'>
                        {state==1 && afterState == 0?<View className='waiting-pay'>
                                <Text className='waiting-pay-txt'>剩余</Text>
                                <View className='time'>
                                    <View className='item'>
                                        <Text className='txt'>{hours}</Text>
                                    </View>
                                    <Text className='sym'>:</Text>
                                    <View className='item'>
                                        <Text className='txt'>{minutes}</Text>
                                    </View>
                                    <Text className='sym'>:</Text>
                                    <View className='item'>
                                        <Text className='txt'>{seconds}</Text>
                                    </View>
                                </View>
                                <Text className='waiting-pay-txt'>秒，将自动取消订单</Text>
                            </View>:state==2 && afterState == 0?<View className='waiting-pay'>
                                <Text className='waiting-pay-txt'>等待卖家发货</Text>
                            </View>:state==3 && afterState == 0?<View className='waiting-pay'>
                                <Text className='waiting-pay-txt'>等待买家确认收货</Text>
                            </View>:afterState != 0?<View className='waiting-pay'>
                                <Text className='waiting-pay-txt'>{data.after_sale_status_tip.tip}</Text>
                            </View>:state==-1?<View className='waiting-pay'>
                                <Text className='waiting-pay-txt'>{data.state_tip.tip}</Text>
                            </View>:state==4 && afterState == 0?<View className='waiting-pay'>
                                <Text className='waiting-pay-txt'>{data.state_tip.tip}</Text>
                            </View>:null}
                        </View>
                    </View>
                    <View className='address-info'>
                        <View className='icon'><IconFont name='20_dingwei' size={40} color='#FF4966' /></View>
                        <View className='info'>
                            <View className='youi'>
                                <Text className='name'>{data.contactor}</Text>
                                <Text className='phone'>{data.contactor_phone}</Text>
                                {/* <View className='default'>
                                    <Text className='txt'>默认</Text>
                                </View> */}
                            </View>
                            <Text className='address'>{data.address}</Text>
                        </View>
                    </View>
                </View>
                <View className='plist'>
                    {
                        plist.map((item)=>(
                        <View className='order-info' key={item.product_id}>
                            <View className='order-img'>
                                <Image src={ossUrl(item.image,0)} className='img' mode='aspectFill' />
                                <View className='big'><IconFont name='20_fangdayulan' size={40} /></View>
                            </View>
                            <View className='order-name'>
                                <Text className='name'>{item.title}</Text>
                                <Text className='gg'>规格：{item.attributes}</Text>
                                <Text className='num'>x{item.quantity}</Text>
                            </View>
                            <View className='price'>
                                <Text className='symbol'>￥</Text>
                                <Text className='n'>{item.price}</Text>
                            </View>
                        </View>
                        ))
                    }
                </View>
                <View className='price-list'>
                    <View className='box'>
                        <View className='top-part'>
                            <View className='line'>
                                <Text className='name'>商品金额</Text>
                                <Text className='price'>￥{data.products_price||'0.00'}</Text>
                            </View>
                            <View className='line'>
                                <Text className='name'>优惠券抵扣</Text>
                                <Text className='price'>￥{data.discount_price}</Text>
                            </View>
                            <View className='line'>
                                <Text className='name'>运费</Text>
                                <Text className='price'>￥{data.delivery_price}</Text>
                            </View>
                        </View>
                        <View className='bottom-part'>
                            <Text className='name'>实付：</Text>
                            <View className='price'><Text className='sym'>￥</Text>{data.order_price}</View>
                        </View>
                    </View>
                </View>
                <View className='order-plist'>
                    <View className='box'>
                        <View className='order-num'>
                            <Text className='txt'>订单编号：{data.order_sn}</Text>
                            <View onClick={()=>{
                                copy(data.order_sn);
                                Taro.showToast({
                                    title:"复制成功",
                                    icon:'none',
                                    duration:1000
                                })
                            }}><IconFont name='20_fuzhi' size={40} color='#9C9DA6' /></View>
                        </View>
                        <Text className='order-time'>下单时间：{moment.unix(data.create_time).format("YYYY-MM-DD HH:mm:ss")}</Text>
                        <Text className='pay-way'>支付方式：微信支付</Text>
                    </View>
                </View>
                <Text className='order-tips'>如收到商品出现质量、错发、漏发，可申请售后退款</Text>
                </View>
                </ScrollView>
                <View className='ops'>
                    {
                        state == 1 && afterState == 0?<Fragment>
                        <Button className='red-border-btn' onClick={this.onCancelOrder.bind(this,data.id)}>取消订单</Button>
                        <Button className='red-border-btn' onClick={()=>{
                            Taro.navigateTo({
                                url:`/pages/me/address/index?t=select&id=${0}`
                            })
                        }}>修改地址</Button>
                        {/* <Button className='gray-border-btn' onClick={()=>{
                            Taro.navigateTo({
                                url:'/pages/me/refund'
                            })
                        }}>申请退款</Button> */}
                        <Button className='red-full-btn' onClick={()=>{
                            this.setState({
                                showPayWayModal:true
                            })
                        }}>去支付</Button>
                        </Fragment>:state == 2 && afterState == 0?<Fragment>
                        <Button className='red-border-btn' onClick={this.onCancelOrder.bind(this,data.id)}>取消订单</Button>

                        </Fragment>:(state == 4 || state == -1)&& afterState == 0?<Fragment>
                        <Button className='gray-border-btn' onClick={this.onDelOrder.bind(this,data.id)}>删除订单</Button>
                        </Fragment>:state == 3 && afterState == 0?<Fragment>
                        <Button className='red-full-btn' onClick={this.onReceviceOrder.bind(this,data.id)}>确认收货</Button>
                        </Fragment>:null
                    }
                </View>
                {/* <PayWayModal 
                    isShow={showPayWayModal} 
                    totalPrice={parseFloat(data.order_price+"")>0?parseFloat(data.order_price+"").toFixed(2):"0.00"} 
                    order_sn={data.order_sn}
                    onResult={this.onResult}
                    onClose={()=>{
                        this.setState({
                            showPayWayModal:false
                        })
                    }}/> */}
                    <AtModal isOpened={showServiceModal} onClose={()=>{
                            this.setState({
                                showServiceModal:false
                            })
                        }}>
                        <AtModalContent>
                            <View className='service_content'>
                                <View className='title'>
                                    <Text className='txt'>映果客服</Text>
                                </View>
                                <View className='line_item'>
                                    <Text className='name'>微信：</Text>
                                    <Text className='content'>13198561713</Text>
                                </View>
                                <View className='line_item'>
                                    <Text className='name'>电话：</Text>
                                    <Text className='content'>18628087932</Text>
                                </View>
                                <View className='line_item last_item'>
                                    <Text className='name'>邮箱：</Text>
                                    <a href="mailto:18628087932@qq.com"><Text className='content'>18628087932@qq.com</Text></a>
                                </View>
                                <Button className='copy_wechat' onClick={()=>{
                                    if (deviceInfo.env == 'h5') {
                                        copy('13198561713');
                                        Taro.showToast({
                                            title:"复制成功",
                                            icon:'none',
                                            duration:1000
                                        })
                                    } else {
                                        Taro.setClipboardData({data:'13198561713'})
                                    }
                                }}>复制微信号</Button>
                            </View>
                        </AtModalContent>
                    </AtModal>
                    <TipModal isShow={showCancelModal} tip="是否要取消订单" cancelText="不取消" okText="取消订单" onCancel={()=>{
                        this.setState({
                            showCancelModal:false
                        });
                        this.cancelId = 0;
                    }} onOK={()=>{
                        this.handleCancel();
                    }} />
            </View>
        )
    }
}
