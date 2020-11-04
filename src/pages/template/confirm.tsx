
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image, Button } from '@tarojs/components'
import './confirm.less';
import IconFont from '../../components/iconfont';
// import { api } from '../../utils/net'
import {templateStore} from '../../store/template';
import { observer, inject } from '@tarojs/mobx';
// import { AtLoadMore } from 'taro-ui';
// import lodash from 'lodash';
// import moment from 'moment';
// import {ossUrl} from '../../utils/common'
import Counter from '../../components/counter/counter';
import FloatModal from '../../components/floatModal/FloatModal';
import Ticket from '../../components/ticket/Ticket';


@inject("templateStore")
@observer
export default class Confirm extends Component<any,{
    showTickedModal:boolean
}> {

    config: Config = {
        navigationBarTitleText: '确认订单'
    }
    
    constructor(props){
        super(props);
        this.state = {
            showTickedModal: false
        }
    }

    componentDidMount() { 
        console.log(templateStore.address);
    }

    render() {
        const { showTickedModal } = this.state;
        const {address} = templateStore;
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
                {
                    address?<View className='address-part-has' onClick={()=>{
                        Taro.navigateTo({
                            url:'/pages/me/address/index?t=select'
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


                <View className='goods-info'>
                    <View className='title'>
                        <Text className='txt'>商品信息</Text>
                        <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                    </View>
                    <View className='info'>
                        <View className='pre-image'>
                            <Image src='' className='img' />
                            <View className='big'><IconFont name='20_fangdayulan' size={40} /></View>
                        </View>
                        <View className='center'>
                            <Text className='name'>嘻哈纯棉圆领运动短袖</Text>
                            <Text className='params'>规格：210*210mm/20g超感纸/硬壳</Text>
                        </View>
                        <View className='right'>
                            <View className='price'>
                                <Text className='sym'>¥</Text>
                                <Text className='num'>49.00</Text>
                            </View>
                            <Counter onCounterChange={(e)=>{
                                console.log(e);
                            }} />
                        </View>
                    </View>
                </View>
                <View className='goods-item'>
                    <Text className='title'>商品金额</Text>
                    <View className='price'>
                        <Text className='sym'>¥</Text>
                        <Text className='num'>49.00</Text>
                    </View>
                </View>
                <View className='goods-item' onClick={()=>{
                    this.setState({
                        showTickedModal:true
                    })
                }}>
                    <Text className='title'>优惠券</Text>
                    <View className='right'>
                        <Text className='txt'>无优惠券可用</Text>
                        <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                    </View>
                </View>
                <View className='goods-item'>
                    <Text className='title'>积分</Text>
                    <View className='right'>
                        <Text className='txt'>无积分可用</Text>
                    </View>
                </View>
                <View className='goods-item'>
                    <Text className='title'>运费</Text>
                    <View className='price'>
                        <Text className='sym'>¥</Text>
                        <Text className='num'>00.00</Text>
                    </View>
                </View>
                <View className='goods-item'>
                    <Text className='title'>小计</Text>
                    <View className='price red'>
                        <Text className='sym'>¥</Text>
                        <Text className='num'>00.00</Text>
                    </View>
                </View>
                <View className='bottom'>
                    <View className='left'>
                        <Text className='title'>合计：</Text>
                        <View className='price'>
                            <Text className='sym'>¥</Text>
                            <Text className='num'>00.00</Text>
                        </View>
                    </View>
                    <Button className='submit-order-btn'>提交订单</Button>
                </View>
                <FloatModal title='优惠卷' isShow={showTickedModal} onClose={()=>{
                    this.setState({
                        showTickedModal:false
                    })
                }}>
                    <View className='yhlist'>
                        <Ticket />
                    </View>
                </FloatModal>
                <View className='opsbar'></View>
            </View>
        )
    }
}
