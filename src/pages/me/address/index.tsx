import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image, Button } from '@tarojs/components'
import './index.less'
import IconFont from '../../../components/iconfont';
import { api } from '../../../utils/net';
import {templateStore} from '../../../store/template';
import { observer, inject } from '@tarojs/mobx';
import Checkbox from '../../../components/checkbox/checkbox'

@inject("templateStore")
@observer
export default class Address extends Component<any,{
    addressList: Array<any>
}> {

    config: Config = {
        navigationBarTitleText: '我的收获地址'
    }

    constructor(props){
        super(props);
        this.state = {
            addressList:[]
        }
    }

    componentDidShow(){
        console.log(this.$router.params)
        this.getList();
    }
    getList(){
        Taro.showLoading({title:"加载中..."});
        api("app.address/list").then((res)=>{
            Taro.hideLoading();
            res = res.map((item)=>{
                if (item.is_default>0) {
                    item["isChecked"] = true;
                } else {
                    item["isChecked"] = false;
                }
                return item;
            });
            this.setState({
                addressList:res
            });
            
        }).catch((e)=>{
            Taro.hideLoading();
            setTimeout(() => {
                Taro.navigateBack();
            }, 2000);
            Taro.showToast({
                title:e,
                icon:'none',
                duration:2000,
            })
        });
    }

    switchChecked = (item,index) => {
        const { addressList } = this.state;
        const isCheck = item["isChecked"];
        const temp = addressList.map((iter)=>{
            iter["isChecked"] = false;
            return iter;
        })
        temp[index]["isChecked"] = !isCheck;
        this.setState({
            addressList:temp
        })
        templateStore.address = item;
        Taro.navigateBack();
    }

    render() {
        const { addressList } = this.state;
        const {t} = this.$router.params;
        // console.log(addressList)
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
                    }}
                    >
                        <IconFont name='24_shangyiye' size={48} color='#121314' />
                    </View>
                    <View className='center'>
                        <Text className='title'>我的收货地址</Text>
                    </View>
                    {
                        addressList.length>0?<View className='right' onClick={()=>{
                            Taro.navigateTo({
                                url:'/pages/me/address/editor'
                            })
                        }}>
                            <Text className='txt'>新增地址</Text>
                        </View>:null
                    }
                </View>
                <View className='alist'>
                    {
                        addressList.length>0?addressList.map((item,index)=>(
                            <View className='item' key={item.id}>
                                <View className='left-part' onClick={this.switchChecked.bind(this,item,index)}>
                                    {
                                        t === 'select' ? <Checkbox isChecked={item.isChecked} onChange={(checked)=>{
                                            if (checked) {
                                                templateStore.address = item;
                                            }
                                        }} />:null
                                    }
                                    <View className='left'>
                                        <View className='info'>
                                            <Text className='name'>{item.contactor_name}</Text>
                                            <Text className='phone'>{item.phone}</Text>
                                            {
                                                item.is_default>0?<View className='default'>
                                                    <Text className='txt'>默认</Text>
                                                </View>:null
                                            }
                                        </View>
                                        <View className='addr'>
                                            <Text className='txt'>{item.address}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View className='right' onClick={(e)=>{
                                    e.stopPropagation();
                                    Taro.navigateTo({
                                        url:`/pages/me/address/editor?id=${item.id}`
                                    })
                                }}
                                >
                                    <IconFont name='24_qubianji' size={48} color='#121314' />
                                </View>
                            </View>
                        )):<View className='black'>
                            <Image src={require('../../../source/empty/noaddress.png')} className='img' />
                            <Text className='txt'>暂无收货地址</Text>
                            <Button className='add-btn' onClick={()=>{
                                Taro.navigateTo({
                                    url:'/pages/me/address/editor'
                                })
                            }}
                            >新增地址</Button>
                        </View>
                    }
                </View>
            </View>
        )
    }
}
