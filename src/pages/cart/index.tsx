import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input,Image } from '@tarojs/components'
import './index.less'
import IconFont from '../../components/iconfont';
import Checkbox from '../../components/checkbox/checkbox';
import Counter from '../../components/counter/counter';
import {ossUrl} from '../../utils/common';
// import { api } from '../../utils/net'

export default class Cart extends Component<{},{

}> {

    config: Config = {
        navigationBarTitleText: '购物车'
    }

    constructor(props){
        super(props);
        this.state = {

        }
    }


    render() {
        const {  } = this.state;
        return (
            <View className='cart'>
                <View className='nav-bar'>
                    <View className='left' onClick={() => {
                        Taro.navigateBack();
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314' />
                    </View>
                    <View className='center'>
                        <Text className='title'>购物车</Text>
                    </View>
                    <View className='right'>
                        <Text className='txt'>管理</Text>
                    </View>
                </View>
                <View className='list'>
                    <View className='item'>
                        <Checkbox isChecked={false} className='left'/>
                        <View className='right'>
                            <View className='pre-image'>
                                <Image src={ossUrl("",0)} className='img' mode='aspectFill'/>
                                <View className='big'><IconFont name='20_fangdayulan' size={40} /></View>
                            </View>
                            <View className='party'>
                                <View className='name'>
                                    <Text className='txt'>嘻哈纯棉圆领运动短袖</Text>
                                </View>
                                <View className='np'>
                                    <View className='price'>
                                        <Text className='l'>¥</Text>
                                        <Text className='n'>99.00</Text>
                                    </View>
                                    <Counter />
                                </View>
                            </View>

                        </View>
                    </View>
                </View>
            </View>
        )
    }
}
