import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image, Button,ScrollView } from '@tarojs/components'
import './index.less'
import IconFont from '../../../../../components/iconfont';
import { api } from '../../../../../utils/net';
import {templateStore} from '../../../../../store/template';
import { observer, inject } from '@tarojs/mobx';
import Checkboxs from '../../../../../components/checkbox/checkbox'
import { userStore } from '../../../../../store/user';
import {deviceInfo, fixStatusBarHeight, updateChannelCode} from '../../../../../utils/common';

@inject("userStore","templateStore")
@observer
export default class Address extends Component<any,{
    addressList: Array<any>
    centerPartyHeight:number
}> {

    config: Config = {
        navigationBarTitleText: '我的收获地址'
    }

    constructor(props){
        super(props);
        this.state = {
            addressList:[],
            centerPartyHeight:500
        }
    }

    componentDidShow(){
        if (!userStore.isLogin) {
            if (deviceInfo.env == 'h5') {
                window.location.href = updateChannelCode("/pages/tabbar/index/index");
            } else {
                Taro.switchTab({
                    url: updateChannelCode('/pages/tabbar/index/index')
                })
            }
        }
        if (process.env.TARO_ENV != 'h5') {
            Taro.createSelectorQuery().select(".nav-bar").boundingClientRect((nav_rect)=>{
                Taro.createSelectorQuery().select(".address_bottom_bar").boundingClientRect((bottom_rect)=>{
                    this.setState({
                        centerPartyHeight:Taro.getSystemInfoSync().windowHeight-nav_rect.height-bottom_rect.height
                    });
                }).exec();
            }).exec();
        }
        console.log(this.$router.params)
        this.getList();
    }
    getList(){
        Taro.showLoading({title:"加载中..."});
        const {t,id} = this.$router.params;
        api("app.address/list").then((res)=>{
            Taro.hideLoading();
            let delId = true;
            res = res.map((item)=>{
                item["isChecked"] = false;
                if (t && t=="select" && id && parseInt(id)>0 && id == item.id) {
                    item["isChecked"] = true;
                    templateStore.address = item;
                    delId = false;
                }
                return item;
            });
            if (t && t=="select" && delId && res.length>0) {
                res[0]["isChecked"] = true;
                templateStore.address = res[0];
                if (deviceInfo.env == 'h5') {
                    window.history.replaceState(null,null,updateChannelCode(`/pages/me/pages/me/address/index?t=select&id=${res[0].id}`))
                }
            }
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
        const { addressList,centerPartyHeight } = this.state;
        const {t} = this.$router.params;
        // console.log(addressList)
        // @ts-ignore
        return (
            <View className='address'>
                {/* @ts-ignore */}
                <View className='nav-bar' style={fixStatusBarHeight()}>
                    <View className='left' onClick={()=>{
                        Taro.navigateBack();
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314' />
                    </View>
                    <View className='center'>
                        <Text className='title'>我的收货地址</Text>
                    </View>
                </View>
                <ScrollView scrollY className='address_page_scroll' style={process.env.TARO_ENV === 'h5'?"":`height:${centerPartyHeight}px`}>
                <View className='alist'>
                    {
                        addressList.length>0?addressList.map((item,index)=>(
                            <View className='item' key={item.id}>
                                <View className='left-part' onClick={this.switchChecked.bind(this,item,index)}>
                                    {
                                        t === 'select' ? <Checkboxs isChecked={item.isChecked} disabled />:null
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
                                        url: updateChannelCode(`/pages/me/pages/me/address/editor?id=${item.id}`)
                                    })
                                }}
                                >
                                    <IconFont name='24_qubianji' size={48} color='#121314' />
                                </View>
                            </View>
                        )):<View className='black'>
                            <Image src={require('../../../../../source/empty/noaddress.png')} className='img' />
                            <Text className='txt'>暂无收货地址</Text>
                            {/* <Button className='add-btn' onClick={()=>{
                                Taro.navigateTo({
                                    url:'/pages/me/pages/me/address/editor'
                                })
                            }}
                            >新增地址</Button> */}
                        </View>
                    }
                </View>
                </ScrollView>

                <View className='address_bottom_bar'>
                    <Button className='add-btn' onClick={()=>{
                        Taro.navigateTo({
                            url: updateChannelCode('/pages/me/pages/me/address/editor')
                        })
                    }}>新增收货地址</Button>
                </View>
            </View>
        )
    }
}
