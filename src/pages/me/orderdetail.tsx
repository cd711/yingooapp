import { ComponentType } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image } from '@tarojs/components'
import './orderdetail.less'
import IconFont from '../../components/iconfont';
import { api } from '../../utils/net'

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

    componentWillMount() { }

    componentDidMount() { }



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
                            <Image src='' className='img'/>
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
                            <Text className='price'>￥49.00</Text>
                        </View>
                    </View>
                </View>
            </View>
        )
    }
}
