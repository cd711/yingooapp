
import Taro, { Component, Config,useState,useEffect } from '@tarojs/taro'
import { View, Text,Image, Button,ScrollView } from '@tarojs/components'
import './confirm.less';
import IconFont from '../../components/iconfont';
import { api } from '../../utils/net'
import {templateStore} from '../../store/template';
import {userStore} from '../../store/user';
import { observer, inject } from '@tarojs/mobx';
// import { AtLoadMore } from 'taro-ui';
// import lodash from 'lodash';
// import moment from 'moment';
// import {ossUrl} from '../../utils/common'
import Counter from '../../components/counter/counter';
import FloatModal from '../../components/floatModal/FloatModal';
import Ticket from '../../components/ticket/Ticket';
import Checkbox from '../../components/checkbox/checkbox';
import Fragment from '../../components/Fragment';
import { ossUrl } from '../../utils/common';



const payway = [
    {
        icon:'32_weixinzhifu',
        name:'微信',
        checked:true
    },
    {
        icon:'32_zhifubaozhifu',
        name:'支付宝',
        checked:false
    }
]

@inject("templateStore","userStore")
@observer
export default class Confirm extends Component<any,{
    showTickedModal:boolean;
    showPayWayModal:boolean;
    payWayArray:Array<any>;
    data:any
}> {

    config: Config = {
        navigationBarTitleText: '确认订单'
    }
    
    constructor(props){
        super(props);
        this.state = {
            showTickedModal: false,
            showPayWayModal: false,
            payWayArray: payway,
            data:{}
        }
    }
    componentDidMount() { 
        // console.log(this.$router.params)
        // skuid=375&total=1&tplid=55&model=0
        const {skuid,total,tplid,model,orderid} = this.$router.params;
        if (orderid) {
            this.checkOrder(orderid);
        } else {
            const data = {
                sku_id:skuid,
                quantity:total,
                user_tpl_id:tplid,
                phone_model_id:336
            };
            if (userStore.address) {
                templateStore.address = userStore.address;
                data["address_id"] = userStore.address.id;
            }
            Taro.showLoading({title:"加载中"});
            api("app.order_temp/add",data).then((res)=>{
                Taro.hideLoading();
                window.history.pushState(null,null,`/pages/template/confirm?orderid=${res.prepay_id}`);
                this.setState({
                    data:res
                });
            })
        }
    }
    componentDidShow(){
        const {data:{address}} = this.state;
        if (address && templateStore.address) {
            if (address.id != templateStore.address.id) {
                Taro.showLoading({title:"加载中"});
                api("app.order_temp/address",{
                    prepay_id: this.state.data.prepay_id,
                    address_id:templateStore.address.id
                }).then((res)=>{
                    Taro.hideLoading();
                    this.setState({
                        data:res
                    })
                })
            }
        }
    }
    checkOrder = (id) => {
        Taro.showLoading({title:"加载中"});
        api("app.order_temp/check",{
            prepay_id:id
        }).then((res)=>{
            Taro.hideLoading();
            templateStore.address = res.address;
            this.setState({
                data:res
            })
        })
    }
    onSubmitOrder = () => {
        // this.setState({
        //     showPayWayModal:true
        // })
        const { data } = this.state;
        this.checkOrder(data.prepay_id);

    }
    //计数器更改
    onCounterChange = (num,product) => {
        // console.log(num)
        if ( parseInt(product.quantity) != num ) {
            console.log(num,product);
        }
    }
     render() {
        const { showTickedModal,showPayWayModal,payWayArray,data } = this.state;
        const { address } = templateStore;
        return (
            <View className='confirm'>
                <View className='nav-bar'>
                    <View className='left' onClick={()=>{

                        // console.log(Taro.getCurrentPages().length)
                        Taro.navigateBack();
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314' />
                    </View>
                    <View className='center'>
                        <Text className='title'>确认订单</Text>
                    </View>
                </View>
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
                    data && data.orders && data.orders.map((item,index)=>(
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
                                            <Counter num={parseInt(product.quantity)} onCounterChange={(e)=>{
                                                this.onCounterChange(e,product)
                                            }} />
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
                                if (item.usable_discounts.length==0) {
                                    return;
                                }
                                this.setState({
                                    showTickedModal:true
                                })
                            }}>
                                <Text className='title'>优惠券</Text>
                                {
                                    item.usable_discounts.length==0?<View className='right'>
                                        <Text className='txt'>无优惠券可用</Text>
                                        <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                                    </View>:<View className='right'>
                                        <View className='tt'>
                                            <Text className='has'>有</Text>
                                            <Text className='n'>{item.usable_discounts.length}</Text>
                                            <Text>张优惠券可用</Text>
                                        </View>
                                        <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                                    </View>
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
                            <Ticket isNew />
                            <Ticket />
                            <Ticket />
                            <Ticket />
                        </View>
                    </ScrollView>
                    <View className='yh_ops'>
                        <Button className='use-btn'>使用</Button>
                    </View>
                </FloatModal>
                <View className='paywaymodal'>
                    <FloatModal isShow={showPayWayModal} onClose={()=>{
                        this.setState({
                            showPayWayModal:false
                        });
                    }}>
                        <View className='pay-way-modal-content'>
                            <View className='price-item'>
                                <Text className="txt">您需要支付</Text>
                                <View className='price'>
                                    <Text className='left'>¥</Text>
                                    <Text className='right'>32.00</Text>
                                </View>
                            </View>
                            <View className='way-list'>
                                {
                                    payWayArray.map((item,index)=>(
                                        <PayWay isCheck={item.checked} icon={item.icon} name={item.name} onPress={()=>{
                                            this.setState({
                                                payWayArray:payWayArray.map((it,idx)=>{
                                                    it.checked = idx == index?true:false;
                                                    return it;
                                                })
                                            })
                                        }} key={index} />
                                    ))
                                }
                            </View>
                            <Button className='pay-btn'>确定支付</Button>
                        </View>
                    </FloatModal>
                </View>

                <View className='opsbar'></View>
            </View>
        )
    }
}
const PayWay: React.FC<any> = ({isCheck,icon,name,onPress}) => {
    const [isSelect,setIsSelect] = useState(false);
    useEffect(()=>{
        if (isCheck != isSelect) {
            setIsSelect(isCheck);
        }
    },[isCheck])
    return  <View className={isSelect?'xy_pay_way_item xy_pay_way_item_active':'xy_pay_way_item'} onClick={()=>{
                setIsSelect(true);
                onPress && onPress()
            }}>
            <View className='name'>
                <IconFont name={icon} size={64} />
                <Text className='txt'>{name}</Text>
            </View>
            <Checkbox isChecked={isSelect} disabled />
        </View>
}

