import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image, Button,ScrollView } from '@tarojs/components'
import './order.less'
import IconFont from '../../components/iconfont';
// / npx iconfont-taro
import {userStore} from "../../store/user";
import {templateStore} from "../../store/template";
import { observer, inject } from '@tarojs/mobx'
import { AtNavBar} from 'taro-ui'
import { api } from '../../utils/net';
import { ListModel, ossUrl } from '../../utils/common';

import PayWayModal from '../../components/payway/PayWayModal';

const tabs = ["全部","待付款","待发货","待收货","已完成"];

@inject("userStore","templateStore")
@observer
export default class Order extends Component<any,{
    switchTabActive:number;
    data:ListModel;
    showPayWayModal:boolean;
    order_price:string;
    order_sn:string
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
            order_sn:""
        }
    }
    componentDidMount(){
        console.log(userStore.nickname);
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
            size:20,
            status
        }).then((res)=>{
            Taro.hideLoading();
            this.setState({
                data:res
            })
        })
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
        if (res.code == 1) {
            
        } else {
            this.setState({
                showPayWayModal:false
            })
            Taro.showToast({
                title:res.data || res.data.errMsg,
                icon:'none',
                duration:2000
            });
        }
    }
    render() {
        const {switchTabActive,data,showPayWayModal,order_price,order_sn} = this.state;
        const list = data && data.list && data.list.length>0 ? data.list:[];
        return (
            <View className='order'>
                <AtNavBar
                    onClickLeftIcon={()=>{
                        Taro.reLaunch({
                            url:'/pages/me/me'
                        });
                    }}
                    color='#121314'
                    title='我的订单'
                    border={false}
                    // fixed
                    leftIconType={{
                        value:'chevron-left',
                        color:'#121314',
                        size:24
                    }}
                />
                <View className='status-switch-bar'>
                    {
                        tabs.map((item,index)=>(
                            <View className={switchTabActive==index?'item active':'item'} onClick={()=>{
                                this.setState({
                                    switchTabActive:index
                                });
                                window.history.replaceState(null,null,`/pages/me/order?tab=${index}`);
                            }} key={index}>
                                <Text className='txt'>{item}</Text>
                                {switchTabActive==index?<Image src={require("../../source/switchBottom.png")} className='img' />:null}
                            </View>
                        ))
                    }
                </View>
                <ScrollView scrollY>
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
                                        <IconFont name='20_fuzhi' size={40} color='#D7D7DA' />
                                    </View>
                                    <Text className={`status ${item.status==1?'pay':(item.status==2||item.status==3?'deliver':'complete')}`}>{item.state_tip}</Text>
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
                                        <Text className='num'>￥{item.payed_price}</Text>
                                    </View>
                                </View>
                                {
                                    item.status == 1 ? <View className='ops'>
                                        <Button className='red-border-btn' onClick={this.onCancelOrder.bind(this,item.id)}>取消订单</Button>
                                        <Button className='red-border-btn' onClick={()=>{
                                            Taro.navigateTo({
                                                url:`/pages/me/orderdetail?id=${item.id}`
                                            })
                                        }}>查看订单</Button>
                                        <Button className='red-full-btn' onClick={()=>{
                                            console.log(item.order_sn)
                                            this.setState({
                                                order_price:item.order_price,
                                                order_sn:item.order_sn,
                                                showPayWayModal:true
                                            })
                                        }}>去支付</Button>
                                    </View>:item.status == 2 ? <View className='ops'>
                                        <Button className='red-border-btn' onClick={()=>{
                                            Taro.navigateTo({
                                                url:`/pages/me/orderdetail?id=${item.id}`
                                            })
                                        }}>查看订单</Button>
                                    </View>:item.status == 3 ?<View className='ops'>
                                        <Button className='red-border-btn' onClick={()=>{
                                            Taro.navigateTo({
                                                url:`/pages/me/orderdetail?id=${item.id}`
                                            })
                                        }}>查看订单</Button>
                                        <Button className='red-full-btn' onClick={this.onReceviceOrder.bind(this,item.id)}>确定收货</Button>
                                    </View>:item.status == 4 || item.status == -1 ? <View className='ops'>
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
            </View>
        )
    }
}
