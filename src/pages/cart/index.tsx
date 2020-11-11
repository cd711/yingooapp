import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input,Image } from '@tarojs/components'
import './index.less'
import IconFont from '../../components/iconfont';
import Checkbox from '../../components/checkbox/checkbox';
import Counter from '../../components/counter/counter';
import {ossUrl} from '../../utils/common';
import { api } from '../../utils/net'

export default class Cart extends Component<{},{
    source:any
}> {

    config: Config = {
        navigationBarTitleText: '购物车'
    }

    constructor(props){
        super(props);
        this.state = {
            source:null
        }
    }
    componentDidMount(){
        Taro.showLoading({title:'加载中'}); 
        api("app.cart/list",{
            size:20,
            start:0
        }).then((res)=>{
            Taro.hideLoading();
            console.log(res);
            if (res) {
                res.list = res.list.map((item)=>{
                    item["checked"] = false;
                    return item;
                })
                this.setState({
                    source:res
                })
            }
        }).catch((e)=>{
            console.log(e);
        })
    }
    onItemClick = (list,index) => {
        list[index]["checked"] = !list[index]["checked"];
        const {source} = this.state;
        source.list = list; 
        this.setState({
            source
        })
    }

    render() {
        const { source } = this.state;
        const list = source && source.list && source.list.length>0?source.list:[];
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
                    {
                        list.map((item,index)=>(
                            <View className='item' key={item.id} onClick={this.onItemClick.bind(this,list,index)}>
                                <Checkbox isChecked={item.checked} className='left' disabled/>
                                <View className='right'>
                                    <View className='pre-image'>
                                        <Image src={ossUrl(item.tpl.thumb_image,0)} className='img' mode='aspectFill'/>
                                        <View className='big'><IconFont name='20_fangdayulan' size={40} /></View>
                                    </View>
                                    <View className='party'>
                                        <View className='name'>
                                            <Text className='txt'>{item.product.title}</Text>
                                        </View>
                                        <Text className='gg'>规格:{item.sku.value.join("/")}</Text>
                                        <View className='np'>
                                            <View className='price'>
                                                <Text className='l'>¥</Text>
                                                <Text className='n'>{(parseFloat(item.sku.price)*parseFloat(item.quantity)).toFixed(2)}</Text>
                                            </View>
                                            <Counter num={item.quantity}/>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))
                    }

                </View>
            </View>
        )
    }
}
