import { ComponentType } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input } from '@tarojs/components'
import './index.less'
import IconFont from '../../../components/iconfont';
import { api } from '../../../utils/net';
import { AtNavBar } from 'taro-ui'
export default class Address extends Component<any,{

}> {

    config: Config = {
        navigationBarTitleText: '我的收获地址'
    }

    constructor(props){
        super(props);
        this.state = {

        }
    }
    componentWillMount() { }

    componentDidMount() { 

    }

    componentWillUnmount() { }


    render() {
        const {  } = this.state;
        return (
            <View className='address'>
                {/* <AtNavBar
                    onClickLeftIcon={()=>{
                        Taro.navigateBack();
                    }}
                    color='#121314'
                    title='我的收获地址'
                    border={true}
                    // fixed
                    leftIconType={{
                        value:'chevron-left',
                        color:'#121314',
                        size:24
                    }}
                /> */}
                <View className='nav-bar'>
                    <View className='left' onClick={()=>{
                        Taro.navigateBack();
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314' />
                    </View>
                    <View className='center'>
                        <Text className='title'>我的收货地址</Text>
                    </View>
                    <View className='right' onClick={()=>{
                        Taro.navigateTo({
                            url:'/pages/me/address/editor'
                        })
                    }}>
                        <Text className='txt'>新增地址</Text>
                    </View>
                </View>
                <View className='alist'>
                    <View className='item'>
                        <View className='left'>
                            <View className='info'>
                                <Text className='name'>邵奇</Text>
                                <Text className='phone'>13388888888</Text>
                                <View className='default'>
                                    <Text className='txt'>默认</Text>
                                </View>
                            </View>
                            <View className='addr'>
                                <Text className='txt'>四川省 成都市 高新区 天府大道北段1700号新世纪环球购物中心E5</Text>
                            </View>
                        </View>
                        <View className='right'>
                            <IconFont name='24_qubianji' size={48} color='#121314' />
                        </View>
                    </View>
                </View>
            </View>
        )
    }
}
