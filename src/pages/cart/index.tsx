import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input,Image,ScrollView, Button } from '@tarojs/components'
import './index.less'
import IconFont from '../../components/iconfont';
import Checkbox from '../../components/checkbox/checkbox';
import Counter from '../../components/counter/counter';
import {ossUrl} from '../../utils/common';
import { api } from '../../utils/net';
import CartLeftIcon from '../../components/icon/CartLeftIcon';
import CartRightIcon from '../../components/icon/CartRightIcon';

export default class Cart extends Component<{},{
    source:any;
    allSelected:boolean;
    total:number;
    isManage:boolean;
    selectIds:Array<any>;
}> {

    config: Config = {
        navigationBarTitleText: '购物车'
    }

    constructor(props){
        super(props);
        this.state = {
            source:null,
            allSelected:false,
            total:0,
            isManage:false,
            selectIds:[]
        }
    }

    componentDidMount(){

        const {manage} = this.$router.params;
        if(manage){
            this.setState({
                isManage:true
            })
        }
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
        this.calcTotal(list);
        this.setState({
            source
        })
    }
    onAllSelect = (list,allSelected) => {
        const {source} = this.state;
        source.list = list.map((item)=>{
            item["checked"] = !allSelected;
            return item;
        });
        this.calcTotal(source.list);
        this.setState({
            allSelected:!allSelected,
            source
        })
    }
    calcTotal = (list:Array<any>) =>{
        let tt = 0;
        let n = 0;
        const tempIds = [];
        for (const iterator of list) {
            if(iterator["checked"]){
                tt += (parseFloat(iterator.sku.price)*parseFloat(iterator.quantity));
                n ++;
                tempIds.push(iterator.id);
            }
        }
        this.setState({
            total:tt,
            allSelected:n==list.length?true:false,
            selectIds:tempIds
        });
    }

    render() {
        const { source,allSelected,total,isManage,selectIds } = this.state;
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
                    <View className='right' onClick={()=>{
                        let url = "/pages/cart/index"
                        if (!isManage) {
                            url = "/pages/cart/index?manage=1"
                        } 
                        window.history.replaceState(null,null,url)
                        this.setState({
                            isManage:!isManage
                        })
                        
                    }}>
                        <Text className='txt'>{isManage?'完成':'管理'}</Text>
                    </View>
                </View>
                <ScrollView scrollY className='center'>
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
                                                {
                                                    isManage?<Text className='total'>x{item.quantity}</Text>:<Counter num={item.quantity} onButtonClick={(num)=>{
                                                        list[index]["quantity"] = num;
                                                        const {source} = this.state;
                                                        source.list = list; 
                                                        this.calcTotal(list);
                                                        this.setState({
                                                            source
                                                        })
                                                    }}/>
                                                }
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))
                        }
                    </View>
                </ScrollView>
                <View className='bottom'>
                    <View className="all" onClick={this.onAllSelect.bind(this,list,allSelected)}>
                        <Checkbox isChecked={allSelected} disabled/>
                        <Text className='txt'>全选</Text>
                    </View>
                    {
                        isManage?<Button className='remove-cart-btn' onClick={()=>{
                            if (selectIds.length>0) {
                                Taro.showLoading({title:"删除中"})
                                api("app.cart/delete",{
                                    ids:selectIds.join(',')
                                }).then(()=>{
                                    Taro.hideLoading();
                                    source.list = list.filter(obj=>!selectIds.some(obj1=>obj1==obj.id));
                                    this.setState({
                                        source,
                                        selectIds:[]
                                    })
                                }).catch(()=>{
                                    Taro.hideLoading();
                                    Taro.showToast({
                                        title:"删除失败，请稍后再试",
                                        icon:'none',
                                        duration:2000
                                    })
                                })
                            }
                        }}>移除购物车</Button>:<View className='ops'>
                            <View className='left'>
                                <CartLeftIcon width={366} height={88}/>
                                <View className='total'>
                                    <Text className='name'>合计：</Text>
                                    <View className='price'>
                                        <Text className='syn'>¥</Text>
                                        <Text className='num'>{total.toFixed(2)}</Text>
                                    </View>
                                </View>
                            </View>
                            <View className='right' onClick={()=>{
                                if (total>0) {
                                    
                                }
                            }}>
                                <CartRightIcon width={220} height={88} linght={total>0}/>
                                <Text className='txt'>结算</Text>
                            </View>
                        </View>
                    }
                    
                </View>
            </View>
        )
    }
}
