import { ComponentType } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input,Image, Button } from '@tarojs/components'
import './photos.less'
import IconFont from '../../components/iconfont';
import { api } from '../../utils/net'

export default class Photos extends Component<any,{
    navSwitchActive:number;
}> {

    config: Config = {
        navigationBarTitleText: '首页'
    }
    constructor(props){
        super(props);
        this.state = {
            navSwitchActive:0
        }
    }
    componentWillMount() { }

    componentDidMount() { 

    }

    componentWillUnmount() { }

    componentDidShow() { }

    componentDidHide() { }


    render() {
        const { navSwitchActive } = this.state;
        const tabs = ["图片","视频"];
        return (
            <View className='photos'>
                <View className='nav-bar'>
                    <View className='left' onClick={()=>{
                        Taro.navigateBack();
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314' />
                    </View>
                    <View className='center'>
                        <View className='nav-switch'>
                            {
                                tabs.map((item,index)=>(
                                    <View className={navSwitchActive==index?'item active':'item'} key={index} onClick={()=>{
                                        this.setState({
                                            navSwitchActive:index
                                        })
                                    }}>
                                        <Text className='txt'>{item}</Text>
                                    </View>
                                ))
                            }
                        </View>
                    </View>
                </View>
                <View className='container'>
                    <View className='empty'>
                        <Image src={require('../../source/empty/nophoto.png')} className='img'/>
                        <Text className='txt'>暂无素材</Text>
                        <Button className='btn'>上传素材</Button>
                    </View>
                </View>
            </View>
        )
    }
}
