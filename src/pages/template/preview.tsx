import { ComponentType } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input,Image, Button } from '@tarojs/components'
import './preview.less';
import IconFont from '../../components/iconfont';
import { api } from '../../utils/net'

import {templateStore} from '../../store/template';
import { observer, inject } from '@tarojs/mobx';
// import { AtLoadMore } from 'taro-ui';
// import lodash from 'lodash';
import moment from 'moment';
import {ossUrl} from '../../utils/common'
import { PlaceOrder } from './place';
const pics = [
    "https://i.ibb.co/sK68FQ0/c6a8dc33e8a84646b4cdc30f5cea391efc8a141c2bef0-UJ8-MBJ.jpg",
    "https://i.ibb.co/n6Ky6bV/cfff57e742254d16d383aa0e580ca03baa37099fed129-PZBbzk-fw1200.jpg",
    "https://i.ibb.co/sK68FQ0/c6a8dc33e8a84646b4cdc30f5cea391efc8a141c2bef0-UJ8-MBJ.jpg",
    "https://i.ibb.co/n6Ky6bV/cfff57e742254d16d383aa0e580ca03baa37099fed129-PZBbzk-fw1200.jpg",
    "https://i.ibb.co/sK68FQ0/c6a8dc33e8a84646b4cdc30f5cea391efc8a141c2bef0-UJ8-MBJ.jpg",
    "https://i.ibb.co/n6Ky6bV/cfff57e742254d16d383aa0e580ca03baa37099fed129-PZBbzk-fw1200.jpg",
]

@inject("templateStore")
@observer
export default class Preview extends Component<any,{
    placeOrderShow:boolean;
}> {

    config: Config = {
        navigationBarTitleText: '预览'
    }
    
    constructor(props){
        super(props);
        this.state = {
            placeOrderShow:false
        }
    }

    componentWillMount() { }

    componentDidMount() {  }

    onPlaceOrderClose= () => {
        this.setState({
            placeOrderShow:false
        });
    }
    
    render() {
        const { placeOrderShow } = this.state;

        return (
            <View className='preview'>
                <View className='nav-bar'>
                    <View className='left' onClick={()=>{
                        Taro.navigateBack();
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314' />
                    </View>
                    <View className="center">
                        <Text className='title'>预览</Text>
                    </View>
                    <View className='right'>
                        <IconFont name='24_fenxiang' size={48} color='#121314'/>
                    </View>
                </View>
                <View className='container'>
                    <Image src="" className='pre-image'/>
                </View>
                <View className='bottom'>
                    <View className='editor'>
                        {/* 保存按钮 图标:24_qubaocun 文字:保存 */}
                        <IconFont name='24_qubianji' size={48} color='#707177' />
                        <Text className='txt'>编辑</Text>
                    </View>
                    <Button className='noworder' onClick={()=>{
                        this.setState({
                            placeOrderShow:true
                        })
                    }}>立即下单</Button>
                </View>
                <PlaceOrder isShow={placeOrderShow} onClose={this.onPlaceOrderClose} images={pics} onButtonClose={this.onPlaceOrderClose} onBuyNumberChange={(n)=>{
                    console.log(n);
                }}/>
            </View>
        )
    }
}
