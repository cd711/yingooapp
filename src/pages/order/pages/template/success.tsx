import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Button,Image } from '@tarojs/components'
import './success.less';
import IconFont from '../../../../components/iconfont';
import { observer, inject } from '@tarojs/mobx';
import SuccessIcon from '../../../../components/icon/SuccessIcon';
import WarmIcon from '../../../../components/icon/WarmIcon';
import { api, options } from '../../../../utils/net';
import { Base64 } from 'js-base64';
import {deviceInfo, fixStatusBarHeight, jumpUri, setPageTitle} from '../../../../utils/common';
import { userStore } from '../../../../store/user';


@inject("templateStore")
@observer
export default class Success extends Component<{},{
    way:string,
    price:string,
    state:boolean
}> {

    config: Config = {
        navigationBarTitleText: '支付结果'
    }
    constructor(props){
        super(props);
        this.state = {
            way:"wechat",
            price:"0.00",
            state:false
        }
    }

    componentDidMount() {
        setPageTitle("支付结果")
        if (deviceInfo.env == 'h5') {
            const url = window.location.href;
            window.history.pushState(null,null,'/pages/tabbar/me/me');
            window.history.pushState(null,null,'/pages/tabbar/order/order?tab=0');
            window.history.pushState(null,'支付结果',url);
        }
        if (userStore.isLogin) {
            const {pay_order_sn,status} = this.$router.params;
            if (status && pay_order_sn) {
                const s = Base64.decode(status);
                if (s && s.length && s.length>0) {
                    const t = s.split("-");
                    if (t.length == 2) {
                        if (parseInt(t[1]+"")==0) {
                            this.setState({
                                state:true,
                                price:"0.00"
                            });
                            return
                        }
                    }
                }
                Taro.showLoading({title:'正在查询订单支付状态'})
                this.getOrderStatus(pay_order_sn);
                this.setState({
                    state:true
                })
            }
            setTimeout(() => {
                if (pay_order_sn) {
                    this.getOrderStatus(pay_order_sn);
                }
            }, 1500);
        } else {
            if (deviceInfo.env == "h5") {
                window.location.href = '/pages/tabbar/index/index'
            } else {
                Taro.switchTab({
                    url:'/pages/tabbar/index/index'
                })
            }
        }
    }
    private request = 0;
    getOrderStatus = (pay_order_sn) => {
        api("app.pay/payStatus",{
            pay_order_sn,
        }).then((res)=>{
            setTimeout(() => {
                Taro.hideLoading();
                if (parseInt(res.status+"")>=1) {
                    this.setState({
                        way:res.pay_type,
                        price:res.pay_price,
                        state:true
                    });
                }else{
                    if (this.request<=1) {
                        setTimeout(() => {
                            this.getOrderStatus(pay_order_sn);
                            this.request += 1;
                        }, 1000);
                    }else{
                        Taro.showToast({
                            title:"订单",
                            icon:"none",
                            duration:2000
                        });
                        jumpUri('/pages/tabbar/order/order',true)
                    }
                }
            }, 800);
        }).catch((e)=>{
            Taro.hideLoading();
            Taro.showToast({
                title:e,
                icon:"none",
                duration:2000
            });
            setTimeout(() => {
                jumpUri('/pages/tabbar/order/order',true)
            }, 2000);
        })
    }

    render() {
        const { way,price,state } = this.state;
        const {pay_order_sn,status} = this.$router.params;
        // @ts-ignore
        return (
            <View className='success'>
                {/* @ts-ignore */}
                <View className='nav-bar' style={fixStatusBarHeight()}>
                    <View className='left' onClick={()=>{
                        Taro.getApp().tab = 1;
                        jumpUri('/pages/tabbar/order/order',true);
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314' />
                    </View>
                    <View className='center'>
                        <Text className='title'>支付结果</Text>
                    </View>
                </View>
                <View className='top'>
                    {
                        state?<View className='tip'>
                            <SuccessIcon width={232} height={240} />
                            <Text className='txt'>支付成功</Text>
                        </View>:<View className='tip'>
                            {/* <SuccessIcon width={232} height={240} /> */}
                            <Image src={`${options.sourceUrl}appsource/paying.svg`} className='img' />
                            <Text className='txt'>支付中...</Text>
                        </View>
                    }
                    {
                       state? <View className="ops">
                        <Button className='look-order-btn' onClick={()=>{
                            if (deviceInfo.env == "h5") {
                                window.history.pushState(null,null,'/pages/tabbar/me/me');
                            }
                            jumpUri('/pages/tabbar/order/order?tab=0',true);
                        }}>查看订单</Button>
                        <Button className='back-home-btn' onClick={()=>{
                            if (deviceInfo.env == "h5") {
                                window.history.pushState(null,null,'/pages/tabbar/order/order?tab=0');
                            }
                            jumpUri('/pages/tabbar/index/index',true);
                        }}>返回首页</Button>
                    </View>:<View className="ops">
                        <Button className='look-order-btn' onClick={()=>{
                            if (pay_order_sn) {
                                Taro.showLoading({title:"正在查询订单支付状态"})
                                this.getOrderStatus(pay_order_sn)
                            } else {
                                if (deviceInfo.env == "h5") {
                                    window.history.pushState(null,null,'/pages/tabbar/me/me');
                                }
                                jumpUri('/pages/tabbar/order/order?tab=0',true);
                            }
                        }}>未支付</Button>
                        <Button className='back-home-btn' onClick={()=>{
                            if (pay_order_sn) {
                                Taro.showLoading({title:"正在查询订单支付状态"})
                                this.getOrderStatus(pay_order_sn)
                            }
                        }}>已经完成支付</Button>
                    </View>
                    }

                </View>
                {
                    state && !status?<View className='line'>
                        <Text className='left'>支付方式</Text>
                        <Text className='way'>{way=="alipay"?'支付宝':'微信'}</Text>
                    </View>:null
                }
                {
                    state?<View className='line'>
                        <Text className='left'>支付金额</Text>
                        <View className='right'>
                            <Text className='sym'>¥</Text>
                            <Text className='num'>{price}</Text>
                        </View>
                    </View>:null
                }
                <View className='warm'>
                    <View className='title'>
                        <WarmIcon width={32} height={32} />
                        <Text className='txt'>温馨提示</Text>
                    </View>
                    <Text className='content'>如收到商品出行质量、错发、漏发，可申请售后退款</Text>
                </View>
            </View>
        )
    }
}

