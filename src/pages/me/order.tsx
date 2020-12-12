import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image, Button,ScrollView } from '@tarojs/components'
import './order.less'
import IconFont from '../../components/iconfont';
// / npx iconfont-taro
import {userStore} from "../../store/user";
import {templateStore} from "../../store/template";
import { observer, inject } from '@tarojs/mobx'
import { api } from '../../utils/net';
import { deviceInfo, fixStatusBarHeight, ListModel, ossUrl } from '../../utils/common';

import PayWayModal from '../../components/payway/PayWayModal';
import page from '../../utils/ext';
import copy from 'copy-to-clipboard';
import TipModal from '../../components/tipmodal/TipModal';


const tabs = ["全部","待付款","待发货","待收货","已完成"];

@inject("userStore","templateStore")
@observer
@page({wechatAutoLogin:true})
export default class Order extends Component<any,{
    switchTabActive:number;
    data:ListModel;
    showPayWayModal:boolean;
    order_price:string;
    order_sn:string;
    orderId:number;
    showCancelModal:boolean;
    centerPartyHeight:number
}> {

    config: Config = {
        navigationBarTitleText: '我的订单',
        // backgroundColor:'#F5F6F9'
    }

    constructor(props){
        super(props);
        this.state = {
            switchTabActive:0,
            data:{
                list:[],
                start:0,
                size:0,
                total:0
            },
            showPayWayModal:false,
            order_price:"0.00",
            order_sn:"",
            orderId:0,
            showCancelModal:false,
            centerPartyHeight:500
        }
    }
    componentDidMount(){
        if (process.env.TARO_ENV != 'h5') {
            Taro.createSelectorQuery().select(".nav-bar").boundingClientRect((nav_rect)=>{
                Taro.createSelectorQuery().select(".status-switch-bar").boundingClientRect((status_react)=>{
                    this.setState({
                        centerPartyHeight:Taro.getSystemInfoSync().windowHeight-nav_rect.height-status_react.height
                    });
                }).exec();
            }).exec();
        }
        const {tab} = this.$router.params;
        const {data,switchTabActive} = this.state;
        templateStore.address = null;
        
        if(parseInt(tab)>=0){
            if (switchTabActive != parseInt(tab)) {
                this.setState({
                    switchTabActive:parseInt(tab)
                });
            }
            if (parseInt(tab) == 0 && data.list.length == 0) {
                this.getList();
            }
        }else {
            
            this.getList();
        }
    }
    componentWillUpdate(_, nextState) {
        const {switchTabActive} = this.state;
        if (switchTabActive != nextState.switchTabActive) {
            this.getList(nextState.switchTabActive);
        }
    }
    getList = (status:number=0) => {
        Taro.showLoading({title:"加载中"})
        api('app.order/list',{
            start:0,
            size:40,
            status
        }).then((res)=>{
            // console.log("list",res)
            Taro.hideLoading();
            this.setState({
                data:res
            })
        }).catch((e)=>{
            Taro.hideLoading();
            Taro.showToast({
                title:e,
                duration:1500,
                icon:"none",
            });
            setTimeout(() => {
                Taro.reLaunch({
                    url:'/pages/me/me'
                })
            }, 1500);
        })
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
        }).then(()=>{

            Taro.hideLoading();
            Taro.showToast({
                title:'取消成功',
                icon:'none',
                duration:2000
            });
            
            this.getList(this.state.switchTabActive)
        }).catch((e)=>{
            Taro.hideLoading();
            Taro.showToast({
                title:e,
                icon:'none',
                duration:2000
            });
        });
        this.cancelId = 0;
    }
    onDelOrder = (id) => {
        Taro.showLoading({title:"处理中"})
        api("app.order/del",{
            id
        }).then(()=>{
            Taro.hideLoading();
            this.getList(this.state.switchTabActive)
        }).catch(()=>{
            Taro.hideLoading();
            Taro.showToast({
                title:'服务器开小差了，稍后再试',
                icon:'none',
                duration:2000
            });
        })
    }
    onReceviceOrder = (id) => {
        api('app.order/receive',{
            id
        }).then(()=>{
            Taro.hideLoading();
            this.getList(this.state.switchTabActive)
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
        this.setState({
            showPayWayModal:false,
        });
        let title = res.data;
        const {orderId} =this.state;
        let url = `/pages/me/orderdetail?id=${orderId}`;
        if (res.code == 1) {
            title = '支付成功';
        }
        if (title.length>0) {
            Taro.showToast({
                title,
                icon: 'none',
                duration: 1500
            });
        }
        setTimeout(() => {
            Taro.navigateTo({
                url
            })
        }, 1500);
    }
    render() {
        const {switchTabActive,data,showPayWayModal,order_price,order_sn,showCancelModal,centerPartyHeight} = this.state;
        const list = data && data.list && data.list.length>0 ? data.list:[];
        // 
        return (
            <View className='order'>
                {/* @ts-ignore */}
                <View className='nav-bar' style={fixStatusBarHeight()}>
                    <View className='left' onClick={() => {
                        if (deviceInfo.env == 'h5') {
                            Taro.reLaunch({
                                url:"/pages/me/me"
                            })
                        }else{
                            Taro.switchTab({
                                url:"/pages/me/me"
                            })                            
                        }
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314'/>
                    </View>
                    <View className='center'>
                        <Text className='title'>我的订单</Text>
                    </View>
                </View>
                <View className='status-switch-bar'>
                    {
                        tabs.map((item,index)=>(
                            <View className={switchTabActive==index?'item active':'item'} onClick={()=>{
                                this.setState({
                                    switchTabActive:index
                                });
                                if (deviceInfo.env == 'h5') {
                                    window.history.replaceState(null,null,`/pages/me/order?tab=${index}`);
                                }
                            }} key={index+""}>
                                <Text className='txt'>{item}</Text>
                                {switchTabActive==index?<Image src={require("../../source/switchBottom.png")} className='img' />:null}
                            </View>
                        ))
                    }
                </View>
                <ScrollView scrollY className='order_list_page_scroll' style={deviceInfo.env === 'h5'?"":`height:${centerPartyHeight}px`}>
                <View className='container'>
                    {
                        list.length == 0 ? <View className='empty'>
                            <Image src={require('../../source/empty/nullorder.png')} className='pic' />
                            <Text className='txt'>暂无订单</Text>
                            <Button className='gofind' onClick={()=>{
                                Taro.switchTab({
                                    url:'/pages/index/index'
                                })
                            }}>去发现</Button>
                        </View>:list.map((item)=>(
                        <View className='item' key={item.id}>
                                <View className='order-state'>
                                    <View className='order-num'>
                                        <Text className='txt'>订单编号：{item.order_sn}</Text>
                                        <View onClick={()=>{
                                            if (deviceInfo.env == 'h5') {
                                                copy(item.order_sn);
                                                Taro.showToast({
                                                    title:"复制成功",
                                                    icon:'none',
                                                    duration:1000
                                                })
                                            } else {
                                                Taro.setClipboardData({data:item.order_sn})
                                            }
                                        }}><IconFont name='20_fuzhi' size={40} color='#D7D7DA' /></View>
                                    </View>
                                    <Text className={`status ${item.state_tip.value==1?'pay':(item.state_tip.value==2||item.state_tip.value==3?'deliver':'complete')}`}>{item.after_sale_status_tip.value!=0?item.after_sale_status_tip.text:item.state_tip.text}</Text>
                                </View>
                                {
                                    item.products.map((product)=>(
                                        <View className='order-info' key={product.product_id} onClick={()=>{
                                            Taro.navigateTo({
                                                url:`/pages/me/orderdetail?id=${item.id}`
                                            })
                                        }}>
                                            <View className='order-img'>
                                                <Image src={ossUrl(product.image,0)} className='img' mode='aspectFill'/>
                                                <View className='big'><IconFont name='20_fangdayulan' size={40}/></View>
                                            </View>
                                            <View className='order-name'>
                                                <Text className='name'>{product.attributes}</Text>
                                                <Text className='num'>x{product.quantity}</Text>
                                            </View>
                                            <View className='price'>
                                                <Text className='symbol'>￥</Text>
                                                <Text className='n'>{product.price}</Text>
                                            </View>
                                        </View>
                                    ))
                                }
                                
                                <View className='price-info'>
                                    <View className='total'>
                                        <Text className='name'>总价</Text>
                                        <Text className='num'>￥{item.order_price}</Text>
                                    </View>
                                    <View className='discount'>
                                        <Text className='name'>优惠</Text>
                                        <Text className='num'>￥{item.discount_price}</Text>
                                    </View>
                                    <View className='pay'>
                                        <Text className='name'>实付款</Text>
                                        <Text className='num'>￥{item.pay_price}</Text>
                                    </View>
                                </View>
                                {
                                    item.state_tip.value == 1 && item.after_sale_status_tip.value==0 ? <View className='ops'>
                                        <Button className='red-border-btn' onClick={this.onCancelOrder.bind(this,item.id)}>取消订单</Button>
                                        <Button className='red-border-btn' onClick={()=>{
                                            Taro.navigateTo({
                                                url:`/pages/me/orderdetail?id=${item.id}`
                                            })
                                        }}>查看订单</Button>
                                        <Button className='red-full-btn' onClick={()=>{
                                            if (parseFloat(item.pay_price+"")==0) {
                                                Taro.showToast({
                                                    title:'订单异常，请联系客服!',
                                                    icon:"none",
                                                    duration:1500
                                                })
                                                return;
                                            }
                                            this.setState({
                                                order_price:item.order_price,
                                                order_sn:item.order_sn,
                                                showPayWayModal:true,
                                                orderId:item.id
                                            })
                                        }}>去支付</Button>
                                    </View>:item.state_tip.value == 2 && item.after_sale_status_tip.value==0 ? <View className='ops'>
                                        <Button className='red-border-btn' onClick={()=>{
                                            Taro.navigateTo({
                                                url:`/pages/me/orderdetail?id=${item.id}`
                                            })
                                        }}>查看订单</Button>
                                    </View>:item.state_tip.value == 3&& item.after_sale_status_tip.value==0  ?<View className='ops'>
                                        <Button className='red-border-btn' onClick={()=>{
                                            Taro.navigateTo({
                                                url:`/pages/me/orderdetail?id=${item.id}`
                                            })
                                        }}>查看订单</Button>
                                        <Button className='red-full-btn' onClick={this.onReceviceOrder.bind(this,item.id)}>确定收货</Button>
                                    </View>:(item.state_tip.value == 4 || item.state_tip.value == -1) && item.after_sale_status_tip.value==0  ? <View className='ops'>
                                        <Button className='gray-border-btn' onClick={this.onDelOrder.bind(this,item.id)}>删除订单</Button>
                                        <Button className='gray-border-btn' onClick={()=>{
                                            Taro.navigateTo({
                                                url:`/pages/me/orderdetail?id=${item.id}`
                                            })
                                        }}>查看订单</Button>
                                    </View>:null
                                }
                            </View>
                            ))
                    }

                </View>
                </ScrollView>
                <PayWayModal 
                    isShow={showPayWayModal} 
                    totalPrice={parseFloat(order_price+"")>0?parseFloat(order_price+"").toFixed(2):"0.00"} 
                    order_sn={order_sn}
                    onResult={this.onResult}
                    onClose={()=>{
                        this.setState({
                            showPayWayModal:false
                        })
                    }}/>
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
