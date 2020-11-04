import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image,Button } from '@tarojs/components'
import './orderdetail.less'
import IconFont from '../../components/iconfont';
// import { api } from '../../utils/net'

export default class OrderDetail extends Component<any,{

}> {

    config: Config = {
        navigationBarTitleText: '我的订单'
    }

    constructor(props){
        super(props);
        this.state = {

        }
    }



    render() {
        const { } = this.state;
        return (
            <View className='order-detail'>
                <View className='top'>
                    <View className='status'>
                        <Text className='statustxt'>等待付款</Text>

                        <View className='time-tip'>

                            <View className='waiting-pay'>
                                <Text className='waiting-pay-txt'>剩余</Text>
                                <View className='time'>
                                    <View className='item'>
                                        <Text className='txt'>00</Text>
                                    </View>
                                    <Text className='sym'>:</Text>
                                    <View className='item'>
                                        <Text className='txt'>00</Text>
                                    </View>
                                    <Text className='sym'>:</Text>
                                    <View className='item'>
                                        <Text className='txt'>00</Text>
                                    </View>
                                </View>
                                <Text className='waiting-pay-txt'>秒，将自动取消订单</Text>
                            </View>

                        </View>
                    </View>
                    <View className='address-info'>
                        <View className='icon'><IconFont name='20_dingwei' size={40} color='#FF4966' /></View>
                        <View className='info'>
                            <View className='youi'>
                                <Text className='name'>可可</Text>
                                <Text className='phone'>13388889999</Text>
                                <View className='default'>
                                    <Text className='txt'>默认</Text>
                                </View>
                            </View>
                            <Text className='address'>四川省 成都市 武侯区 环球中心E5</Text>
                        </View>
                    </View>
                </View>
                <View className='plist'>
                    <View className='order-info'>
                        <View className='order-img'>
                            <Image src='' className='img' />
                            <View className='big'><IconFont name='20_fangdayulan' size={40} /></View>
                        </View>
                        <View className='order-name'>
                            <Text className='name'>INS 6寸LOMO定制高…</Text>
                            <Text className='gg'>规格：210*210mm/20g超感纸/硬壳</Text>
                            <Text className='num'>x1</Text>
                        </View>
                        <View className='price'>
                            <Text className='symbol'>￥</Text>
                            <Text className='n'>49.9</Text>
                        </View>
                    </View>
                </View>
                <View className='price-list'>
                    <View className='box'>
                        <View className='top-part'>
                            <View className='line'>
                                <Text className='name'>商品金额</Text>
                                <Text className='price'>￥49.00</Text>
                            </View>
                            <View className='line'>
                                <Text className='name'>商品金额</Text>
                                <Text className='price'>￥49.00</Text>
                            </View>
                            <View className='line'>
                                <Text className='name'>商品金额</Text>
                                <Text className='price'>￥49.00</Text>
                            </View>
                        </View>
                        <View className='bottom-part'>
                            <Text className='name'>实付：</Text>
                            <View className='price'><Text className='sym'>￥</Text>49.00</View>
                        </View>
                    </View>
                </View>
                <View className='order-plist'>
                    <View className='box'>
                        <View className='order-num'>
                            <Text className='txt'>订单编号：212312454366436643</Text>
                            <IconFont name='20_fuzhi' size={40} color='#9C9DA6' />
                        </View>
                        <Text className='order-time'>下单时间：2020-09-24 12:30:24</Text>
                        <Text className='pay-way'>支付方式：微信支付</Text>
                    </View>
                </View>
                <Text className='order-tips'>如收到商品出现质量、错发、漏发，可申请售后退款</Text>
                <View className='ops'>
                    <Button className='red-border-btn'>取消订单</Button>
                    <Button className='red-border-btn'>修改地址</Button>
                    <Button className='gray-border-btn' onClick={()=>{
                        Taro.navigateTo({
                            url:'/pages/me/refund'
                        })
                    }}>申请退款</Button>
                    <Button className='red-full-btn'>去支付</Button>
                </View>
            </View>
        )
    }
}
