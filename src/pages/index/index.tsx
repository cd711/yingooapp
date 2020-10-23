import { ComponentType } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button, Text,Image } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'

import './index.less'
import IconFont from '../../components/iconfont'
import { userStore } from "../../store/user";

@inject("userStore")
@observer
class Index extends Component {

    /**
     * 指定config的类型声明为: Taro.Config
     *
     * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
     * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
     * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
     */
    config: Config = {
        navigationBarTitleText: '发现'
    }

    componentWillMount() { }

    componentWillReact() {
        console.log('componentWillReact')
    }

    componentDidMount() { }

    componentWillUnmount() { }

    componentDidShow() { }

    componentDidHide() { }



    render() {
        const { } = userStore;
        const pics = [
            "https://i.ibb.co/sK68FQ0/c6a8dc33e8a84646b4cdc30f5cea391efc8a141c2bef0-UJ8-MBJ.jpg",
            "https://i.ibb.co/n6Ky6bV/cfff57e742254d16d383aa0e580ca03baa37099fed129-PZBbzk-fw1200.jpg",
            "https://i.ibb.co/sK68FQ0/c6a8dc33e8a84646b4cdc30f5cea391efc8a141c2bef0-UJ8-MBJ.jpg",
            "https://i.ibb.co/n6Ky6bV/cfff57e742254d16d383aa0e580ca03baa37099fed129-PZBbzk-fw1200.jpg",
            "https://i.ibb.co/sK68FQ0/c6a8dc33e8a84646b4cdc30f5cea391efc8a141c2bef0-UJ8-MBJ.jpg",
            "https://i.ibb.co/n6Ky6bV/cfff57e742254d16d383aa0e580ca03baa37099fed129-PZBbzk-fw1200.jpg",
        ]
        return (
            <View className='index'>
                <View className='top-search'>
                    <View className='search-box'>
                        <IconFont name='20_sousuo' size={40} color="#9C9DA6" />
                        <Text className='placeholders'>搜索海量模板</Text>
                    </View>
                </View>
                <View className='container'>
                    <View className='temp-warp'>
                        <View className='title'>
                            <Text className='txt'>大胆的色彩和创意</Text>
                        </View>
                        <View className='sub-title'>
                            <Text className='txt'>将色彩与创意做到极致</Text>
                        </View>
                        <View className='grid'>
                            {
                                pics.map((item)=>{
                                    <View className='photo-warp'>
                                        <Image src={item} />
                                    </View>
                                })
                            }
                            
                        </View>
                    </View>
                </View>
            </View>
        )
    }
}

export default Index as ComponentType
