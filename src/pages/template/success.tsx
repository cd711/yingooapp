import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image, Button } from '@tarojs/components'
import './success.less';
import IconFont from '../../components/iconfont';
import { api } from '../../utils/net'
import { AtNavBar} from 'taro-ui'
// import {templateStore} from '../../store/template';
import { observer, inject } from '@tarojs/mobx';
// import { AtLoadMore } from 'taro-ui';
// import lodash from 'lodash';
import moment from 'moment';
import {ossUrl} from '../../utils/common'
import SuccessIcon from '../../components/icon/SuccessIcon';
import WarmIcon from '../../components/icon/WarmIcon';
// interface LikeData{
//     list:Array<any>,
//     size:number,
//     start:number,
//     total:number
// }

@inject("templateStore")
@observer
export default class Success extends Component<any,{

}> {

    config: Config = {
        navigationBarTitleText: '模板详情'
    }
    constructor(props){
        super(props);
        this.state = {

        }
    }

    componentDidMount() { 
        console.log();
    }

    

    render() {
        const {  } = this.state;
        return (
            <View className='success'>
                <View className='nav-bar'>
                    <View className='left' onClick={()=>{
                        Taro.navigateBack();
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314' />
                    </View>
                    <View className='center'>
                        <Text className='title'>支付成功</Text>
                    </View>
                </View>
                <View className='top'>
                    <View className='tip'>
                        <SuccessIcon width={232} height={240} />
                        <Text className='txt'>支付成功</Text>
                    </View>
                    <View className="ops">
                        <Button className='look-order-btn'>查看订单</Button>
                        <Button className='back-home-btn' onClick={()=>{
                            Taro.switchTab({
                                url:'/pages/index/index'
                            })
                        }}>返回首页</Button>
                    </View>
                </View>
                <View className='line'>
                    <Text className='left'>支付方式</Text>
                    <Text className='way'>支付宝</Text>
                </View>
                <View className='line'>
                    <Text className='left'>支付金额</Text>
                    <View className='right'>
                        <Text className='sym'>¥</Text>
                        <Text className='num'>49.00</Text>
                    </View>
                </View>
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

