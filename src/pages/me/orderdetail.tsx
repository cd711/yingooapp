import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image,Button } from '@tarojs/components'
import './orderdetail.less'
import IconFont from '../../components/iconfont';
import { api } from '../../utils/net'
import lodash from 'lodash';
import { ossUrl } from '../../utils/common';
import moment from "moment";
import PayWayModal from '../../components/payway/PayWayModal';
import { templateStore } from '../../store/template';
import { observer, inject } from '@tarojs/mobx';


@inject("templateStore")
@observer
export default class OrderDetail extends Component<any,{
    data:any,
    hours:string,
    minutes:string,
    seconds:string,
    showPayWayModal:boolean
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
            showPayWayModal:false
        }
    }
    componentDidMount(){
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
                if (res.status == 1) {
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
                this.setState({
                    data:res,
                    hours:"00",
                    minutes:"00",
                    seconds:"00"
                });
                if (res.status == 1) {
                    this.calcTime(res.create_time);
                }
            }).catch((e)=>{
                console.log(e)
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
            const hours = du.get('hours');
            const mins = du.get('minutes');
            const ss = du.get('seconds');
            if (hours<=0 && mins<=0 && ss<=0) {
                clearInterval(this.intervalTime);
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
    onCancelOrder = (id) => {
        Taro.showLoading({title:"处理中"})
        api("app.order/cancel",{
            id
        }).then(()=>{
            Taro.hideLoading();
            Taro.showToast({
                title:'取消成功',
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
    render() {
        const { data,hours,minutes,seconds,showPayWayModal } = this.state;
        const status = data.state_tip?data.state_tip:"";
        const plist = lodash.isEmpty(data.products)?[]:data.products;
        return (
            <View className='order-detail'>
                <View className='top'>
                    <View className='status'>
                        <Text className='statustxt'>{status}</Text>
                        <View className='time-tip'>
                        {data.status==1?<View className='waiting-pay'>
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
                            </View>:data.status==2?<View className='waiting-pay'>
                                <Text className='waiting-pay-txt'>等待卖家发货</Text>
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
                            <IconFont name='20_fuzhi' size={40} color='#9C9DA6' />
                        </View>
                        <Text className='order-time'>下单时间：{moment.unix(data.create_time).format("YYYY-MM-DD HH:mm:ss")}</Text>
                        <Text className='pay-way'>支付方式：微信支付</Text>
                    </View>
                </View>
                <Text className='order-tips'>如收到商品出现质量、错发、漏发，可申请售后退款</Text>
                {
                    data.status == 1?<View className='ops'>
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
                    </View>:data.status == 2?<View className='ops'>
                        <Button className='red-border-btn' onClick={this.onCancelOrder.bind(this,data.id)}>取消订单</Button>

                    </View>:data.status == 4?<View className='ops'>
                        <Button className='gray-border-btn' onClick={this.onDelOrder.bind(this,data.id)}>删除订单</Button>
                    </View>:null
                }
                <PayWayModal 
                    isShow={showPayWayModal} 
                    totalPrice={parseFloat(data.order_price+"")>0?parseFloat(data.order_price+"").toFixed(2):"0.00"} 
                    order_sn={data.order_sn}
                    onResult={this.onResult}
                    onClose={()=>{
                        this.setState({
                            showPayWayModal:false
                        })
                    }}/>
            </View>
        )
    }
}
