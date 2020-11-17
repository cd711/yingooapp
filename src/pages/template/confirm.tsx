
import Taro, { Component, Config,useState,useEffect } from '@tarojs/taro'
import { View, Text,Image, Button,ScrollView } from '@tarojs/components'
import './confirm.less';
import IconFont from '../../components/iconfont';
import { api } from '../../utils/net'
import {templateStore} from '../../store/template';
import {userStore} from '../../store/user';
import { observer, inject } from '@tarojs/mobx';
// import { AtLoadMore } from 'taro-ui';
import lodash from 'lodash';
// import moment from 'moment';
// import {ossUrl} from '../../utils/common'
import Counter from '../../components/counter/counter';
import FloatModal from '../../components/floatModal/FloatModal';
import Ticket from '../../components/ticket/Ticket';
import Fragment from '../../components/Fragment';
import {notNull, ossUrl,jsApiList} from '../../utils/common';
import { Base64 } from 'js-base64';
import wx from 'weixin-js-sdk'
import PayWayModal from '../../components/payway/PayWayModal';



@inject("templateStore","userStore")
@observer
export default class Confirm extends Component<any,{
    showTickedModal:boolean;
    showPayWayModal:boolean;

    data:any;
    tickets: [],
    ticketId: number | string | null,
    usedTicket: boolean,
    currentTicketOrderId:string,
    currentOrderTicketId:number,
    usedTickets:Array<any>
    order_sn:string
}> {

    config: Config = {
        navigationBarTitleText: '确认订单'
    }

    constructor(props){
        super(props);
        this.state = {
            showTickedModal: false,
            showPayWayModal: false,
            order_sn:"",
            data: {},
            tickets: [],
            ticketId: null,
            usedTicket: false,
            currentTicketOrderId:"",
            currentOrderTicketId:0,
            usedTickets:[]
        }
    }
    componentDidMount() {
        // console.log(this.$router.params)
        // skuid=375&total=1&tplid=55&model=0
        const {skuid,total,tplid,model,orderid,cartIds} = this.$router.params;
        // /pages/template/confirm?skuid=379&total=1&tplid=166&model=343
        if (orderid) {
            this.checkOrder(orderid);
        } else {

            let data:any = {
                sku_id:skuid,
                quantity:total,
                user_tpl_id:tplid,
                phone_model_id:model?model:336
            };
            if(cartIds){
                data = {
                    cart_ids:Base64.decode(cartIds)
                }
            }
            if (!lodash.isEmpty(userStore.address)) {
                templateStore.address = userStore.address;
                data["address_id"] = userStore.address.id;
            }
            Taro.showLoading({title:"加载中"});
            api("app.order_temp/add",data).then((res)=>{
                Taro.hideLoading();
                window.history.replaceState(null,null,`/pages/template/confirm?orderid=${res.prepay_id}`);
                this.filterUsedTicket(res.orders);
                this.setState({
                    data: res
                });
            }).catch((e)=>{
                Taro.hideLoading();
                Taro.showToast({
                    title:e,
                    duration:2000
                })
            })
        }
    }
    componentDidShow(){
        const {data:{address}} = this.state;
        if (!lodash.isEmpty(address) && !lodash.isEmpty(templateStore.address)) {
            if (address.id == templateStore.address.id) {
                return;
            }
        }
        if (!lodash.isEmpty(templateStore.address) && this.state.data && this.state.data.prepay_id) {
            Taro.showLoading({title:"加载中"});
            api("app.order_temp/address",{
                prepay_id: this.state.data.prepay_id,
                address_id:templateStore.address.id
            }).then((res)=>{
                Taro.hideLoading();
                this.filterUsedTicket(res.orders)
                this.setState({
                    data:res
                })
            })
        }
    }

    checkOrder = (id) => {
        Taro.showLoading({title:"加载中"});
        const url = "app.order_temp/info";
        // if (isInfo) {
        //     url = "app.order_temp/info";
        // }
        api(url,{
            prepay_id:id
        }).then((res)=>{
            Taro.hideLoading();
            this.filterUsedTicket(res.orders);
            templateStore.address = res.address;
            this.setState({
                data:res,
                // showPayWayModal:isInfo?false:true
            });
        }).catch(e => {
            Taro.hideLoading();
            setTimeout(() => {
                console.log('aaaaaaa')
                window.history.replaceState(null,null,'/pages/me/me');
                Taro.navigateTo({
                    url:'/pages/me/order?tab=1'
                })
            }, 2000);
            Taro.showToast({
                title:e,
                duration:2000,
                icon:"none"
            });
        })
    }

    filterUsedTicket = (orders) => {
        const temp = [];
        for (const iterator of orders) {
            if(iterator.use_coupon){
                const t = {
                    orderId:iterator.pre_order_id,
                    ticketId:iterator.use_coupon.id
                }
                temp.push(t);
            }
        }
        this.setState({
            usedTickets:temp
        })
    }

    onSubmitOrder = () => {
        // this.setState({
        //     showPayWayModal:true
        // })
        const { data } = this.state;
        // this.checkOrder(data.prepay_id,false);
        Taro.showLoading({title:'加载中...'})
        api('app.order/add',{
            prepay_id:data.prepay_id,
            remarks:""
        }).then((res)=>{
            // console.log(res);
            Taro.hideLoading();
            this.setState({
                order_sn:res.order_sn,
                showPayWayModal:true
            })
        }).catch((e)=>{
            Taro.hideLoading();
            setTimeout(() => {
                window.history.replaceState(null,null,'/pages/me/me');
                Taro.navigateTo({
                    url:'/pages/me/order?tab=1'
                })
            }, 2000);
            Taro.showToast({
                title:e,
                duration:2000,
                icon:"none"
            });

        })

    }

    // 选择优惠券
    onSelectTicket = (tickets, tId) => {
        console.log(tickets, tId)
        const discounts = tickets.map((item)=>{
            item["checked"] = false;
            if (tId == item.id) {
                item["checked"] = true;
            }
            return item;
        });
        this.setState({
            tickets:discounts,
            ticketId:Number(tId)
        })
    }

    //计数器更改
    onCounterChange = (num,payid,orderid,product) => {
        if ( parseInt(product.quantity) != num ) {
            Taro.showLoading({title:"加载中"})
            api("app.order_temp/quantity",{
                prepay_id:payid,
                pre_order_id:orderid,
                product_id:product.id,
                quantity:num
            }).then((res)=>{
                Taro.hideLoading();
                this.filterUsedTicket(res.orders)
                this.setState({
                    data:res
                })
            }).catch((e)=>{
                Taro.hideLoading();
                setTimeout(() => {
                    Taro.reLaunch({
                        url:'/pages/index/index'
                    })
                }, 2000);
                Taro.showToast({
                    title: e,
                    icon: "none",
                    duration:2000
                })
            })
        }
    }
    onTicketUsed = (payId) => {
        const {ticketId,currentTicketOrderId} = this.state;
        if(!notNull(ticketId) && Number(ticketId)>0){
            Taro.showLoading({title:"加载中"});
            api("app.order_temp/coupon",{
                prepay_id:payId,
                pre_order_id:currentTicketOrderId,
                usercoupon_id:ticketId
            }).then((res)=>{
                Taro.hideLoading();
                this.filterUsedTicket(res.orders);
                this.setState({
                    data:res
                });
            }).catch((e)=>{
                Taro.hideLoading();
                setTimeout(() => {
                    Taro.reLaunch({
                        url:'/pages/index/index'
                    })
                }, 2000);
                Taro.showToast({
                    title: e,
                    icon: "none",
                    duration:2000
                })
            })
            this.setState({
                showTickedModal: false,
                usedTicket:true,
                currentTicketOrderId:"",
                currentOrderTicketId:0
            });
        }

        this.setState({
            showTickedModal: false,
            currentTicketOrderId:"",
            currentOrderTicketId:0
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
        const { showTickedModal,showPayWayModal,data, tickets,usedTickets,order_sn} = this.state;
        const { address } = templateStore;
        return (
            <View className='confirm'>
                <View className='nav-bar'>
                    <View className='left' onClick={()=>{
                        Taro.navigateBack();
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314' />
                    </View>
                    <View className='center'>
                        <Text className='title'>确认订单</Text>
                    </View>
                </View>
                <ScrollView scrollY style={{paddingBottom:40,flex:1}}>
                {
                    address?<View className='address-part-has' onClick={()=>{
                        Taro.navigateTo({
                            url:`/pages/me/address/index?t=select&id=${address.id}`
                        })
                    }}>
                        <Image src={require('../../source/addressBackground.png')} className='backimg' />
                        <View className='address'>
                            <View className='icon'><IconFont name='20_dingwei' size={40} color='#FF4966' /></View>
                            <View className='info'>
                                <View className='youi'>
                                    <Text className='name'>{address.contactor_name}</Text>
                                    <Text className='phone'>{address.phone}</Text>
                                </View>
                                <Text className='details'>{address.address}</Text>
                            </View>
                            <View className='right'><IconFont name='20_xiayiye' size={40} color='#9C9DA6' /></View>
                        </View>
                    </View>:<View className='address-part' onClick={()=>{
                        Taro.navigateTo({
                            url:'/pages/me/address/index?t=select'
                        })
                    }}>
                        <Text className='title'>选择收货地址</Text>
                        <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                    </View>
                }

                {
                    data.orders && data.orders.map((item)=>(
                        <Fragment key={item.pre_order_id}>
                            <View className='goods-info'>
                                <View className='title'>
                                    <Text className='txt'>商品信息</Text>
                                    <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                                </View>
                                {
                                    item.products.map((product)=>(
                                    <View className='info' key={product.id}>
                                        <View className='pre-image'>
                                            <Image src={ossUrl(product.tpl.thumb_image,0)} className='img' mode='aspectFill'/>
                                            <View className='big'><IconFont name='20_fangdayulan' size={40} /></View>
                                        </View>
                                        <View className='center'>
                                            <Text className='name'>{product.product.title}</Text>
                                            <Text className='params'>规格：{product.sku.value.join("/")}</Text>
                                        </View>
                                        <View className='right'>
                                            <View className='price'>
                                                <Text className='sym'>¥</Text>
                                                <Text className='num'>{product.price}</Text>
                                            </View>
                                            <Counter num={parseInt(product.quantity)} onButtonClick={(e)=>{
                                                this.onCounterChange(e,data.prepay_id,item.pre_order_id,product);
                                            }}/>
                                        </View>
                                    </View>
                                    ))
                                }

                            </View>
                            <View className='goods-item'>
                                <Text className='title'>商品金额</Text>
                                <View className='price'>
                                    <Text className='sym'>¥</Text>
                                    <Text className='num'>{item.products_price}</Text>
                                </View>
                            </View>
                            <View className='goods-item' onClick={()=>{
                                let discounts = item.usable_discounts.filter(obj=>!usedTickets.some(obj1=>obj1.ticketId==obj.id && obj1.orderId != item.pre_order_id));
                                if (discounts==0) {
                                    return;
                                }
                                const ticketId = item.use_coupon?item.use_coupon.id:0
                                discounts = discounts.map((item)=>{
                                    item["checked"] = false;
                                    if (ticketId == item.id) {
                                        item["checked"] = true;
                                    }
                                    return item;
                                })
                                this.setState({
                                    showTickedModal:true,
                                    tickets: discounts,
                                    currentTicketOrderId: item.pre_order_id,
                                    currentOrderTicketId: ticketId
                                })
                            }}>
                                <Text className='title'>优惠券</Text>
                                {
                                    item.use_coupon
                                        ? <View className='right'>
                                        <View className='tt'>
                                            <Text className='n'>
                                                {/* @ts-ignore */}
                                                - ￥{item.use_coupon.coupon.money}
                                            </Text>
                                        </View>
                                        <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                                    </View> : (item.usable_discounts.filter(obj=>!usedTickets.some(obj1=>obj1.ticketId==obj.id && obj1.orderId != item.pre_order_id)).length==0
                                    ? <View className='right'>
                                        <Text className='txt'>无优惠券可用</Text>
                                        <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                                    </View>
                                    :<View className='right'>
                                        <View className='tt'>
                                            <Text className='has'>有</Text>
                                            <Text className='n'>{item.usable_discounts.filter(obj=>!usedTickets.some(obj1=>obj1.ticketId==obj.id && obj1.orderId != item.pre_order_id)).length}</Text>
                                            <Text>张优惠券可用</Text>
                                        </View>
                                        <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                                    </View>)
                                }
                            </View>
                            {/* <View className='goods-item'>
                                <Text className='title'>积分</Text>
                                <View className='right'>
                                    <Text className='txt'>无积分可用</Text>
                                </View>
                            </View> */}
                            <View className='goods-item'>
                                <Text className='title'>运费</Text>
                                <View className='price'>
                                    <Text className='sym'>¥</Text>
                                    <Text className='num'>{parseFloat(item.delivery_price+"")>0?parseFloat(item.delivery_price+"").toFixed(2):"00.00"}</Text>
                                </View>
                            </View>
                            <View className='goods-item'>
                                <Text className='title'>小计</Text>
                                <View className='price red'>
                                    <Text className='sym'>¥</Text>
                                    <Text className='num'>{parseFloat(item.order_price+"")>0?parseFloat(item.order_price+"").toFixed(2):"00.00"}</Text>
                                </View>
                            </View>
                        </Fragment>
                    ))
                }
                </ScrollView>
                <View className='bottom'>
                    <View className='left'>
                        <Text className='title'>合计：</Text>
                        <View className='price'>
                            <Text className='sym'>¥</Text>
                            <Text className='num'>{parseFloat(data.order_price+"")>0?parseFloat(data.order_price+"").toFixed(2):"00.00"}</Text>
                        </View>
                    </View>
                    {
                        address?<Button className='submit-order-btn submit-order-active' onClick={this.onSubmitOrder}>提交订单</Button>:<Button className='submit-order-btn' onClick={()=>{
                            Taro.showToast({
                                title:'请选择地址!',
                                icon:'none',
                                duration:1500
                            })
                        }}>提交订单</Button>
                    }

                </View>
                <FloatModal title='优惠卷' isShow={showTickedModal} onClose={()=>{
                    this.setState({
                        showTickedModal:false
                    })
                }}>
                    <ScrollView scrollY>
                        <View className='yhlist'>
                            {
                                tickets.map((value: any, index) => (
                                    <Ticket key={index}
                                            isSelected={value.checked}
                                            ticket={value.coupon}
                                            onChange={() => this.onSelectTicket(tickets, value.id)} />
                                ))
                            }
                        </View>
                    </ScrollView>
                    <View className='yh_ops'>
                        <Button className='use-btn' onClick={()=>{
                            this.onTicketUsed(data.prepay_id)
                        }}>使用</Button>
                    </View>
                </FloatModal>
                <PayWayModal
                    isShow={showPayWayModal}
                    totalPrice={parseFloat(data.order_price+"")>0?parseFloat(data.order_price+"").toFixed(2):"0.00"}
                    order_sn={order_sn}
                    onResult={this.onResult}
                    onClose={()=>{
                        this.setState({
                            showPayWayModal:false
                        });
                        window.history.replaceState(null,null,'/pages/me/me');
                        Taro.navigateTo({
                            url:'/pages/me/order?tab=1'
                        })
                    }}/>
            </View>
        )
    }
}


