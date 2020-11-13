import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image, Button } from '@tarojs/components'
import './order.less'
import IconFont from '../../components/iconfont';
// / npx iconfont-taro
import {userStore} from "../../store/user";
import { observer, inject } from '@tarojs/mobx'
import { AtNavBar} from 'taro-ui'
import { api } from '../../utils/net';
import { ListModel } from '../../utils/common';

const tabs = ["全部","待付款","待发货","待收货","已完成"];

@inject("userStore")
@observer
export default class Order extends Component<any,{
    switchTabActive:number;
    data:ListModel
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
            }
        }
    }
    componentDidMount(){
        console.log(userStore.nickname);
        const {tab} = this.$router.params;
        if(parseInt(tab)>=0){
            this.setState({
                switchTabActive:parseInt(tab)
            })
        }else {
            this.getList();
        }
    }
    componentWillUpdate(nextProps, nextState) {
        const {switchTabActive} = this.state;
        if (switchTabActive != nextState.switchTabActive) {
            // console.log(`switchTabActive变化`,switchTabActive,nextState.switchTabActive);
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
            console.log(res);
            Taro.hideLoading();
            this.setState({
                data:res
            })
        })
    }



    render() {
        const {switchTabActive,data} = this.state;
        const list = data && data.list && data.list.length>0 ? data.list:[];
        return (
            <View className='order'>
                <AtNavBar
                    onClickLeftIcon={()=>{
                        Taro.navigateBack();
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
                                })
                            }} key={index}>
                                <Text className='txt'>{item}</Text>
                                {switchTabActive==index?<Image src={require("../../source/switchBottom.png")} className='img' />:null}
                            </View>
                        ))
                    }
                </View>
                <View className='container'>
                    {
                        list.length == 0 ? <View className='empty'>
                            <Image src={require('../../source/empty/nullorder.png')} className='pic' />
                            <Text className='txt'>暂无订单</Text>
                            <Button className='gofind'>去发现</Button>
                        </View>:<View className='item' onClick={()=>{
                                Taro.navigateTo({
                                    url:'/pages/me/orderdetail'
                                })
                            }}>
                                <View className='order-state'>
                                    <View className='order-num'>
                                        <Text className='txt'>订单编号：1032442932904</Text>
                                        <IconFont name='20_fuzhi' size={40} color='#9C9DA6' />
                                    </View>
                                    <Text className='status'>等待付款</Text>
                                </View>
                                <View className='order-info'>
                                    <View className='order-img'>
                                        <Image src='' className='img' />
                                        <View className='big'><IconFont name='20_fangdayulan' size={40} /></View>
                                    </View>
                                    <View className='order-name'>
                                        <Text className='name'>INS 6寸LOMO定制高清光感银定光…</Text>
                                        <Text className='num'>x1</Text>
                                    </View>
                                    <View className='price'>
                                        <Text className='symbol'>￥</Text>
                                        <Text className='n'>49.9</Text>
                                    </View>
                                </View>
                                <View className='price-info'>
                                    <View className='total'>
                                        <Text className='name'>总价</Text>
                                        <Text className='num'>￥99.00</Text>
                                    </View>
                                    <View className='discount'>
                                        <Text className='name'>优惠</Text>
                                        <Text className='num'>￥99.00</Text>
                                    </View>
                                    <View className='pay'>
                                        <Text className='name'>实付款</Text>
                                        <Text className='num'>￥99.00</Text>
                                    </View>
                                </View>
                                <View className='ops'>
                                    <Button className='red-border-btn'>取消订单</Button>
                                    <Button className='red-border-btn'>取消订单</Button>
                                    <Button className='red-border-btn'>取消订单</Button>
                                    <Button className='red-full-btn'>去支付</Button>
                                </View>
                            </View>
                    }
                    
                </View>
            </View>
        )
    }
}
