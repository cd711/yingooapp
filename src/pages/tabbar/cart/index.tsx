import Taro, {Component, Config} from '@tarojs/taro'
import {Button, Image, ScrollView, Text, View} from '@tarojs/components'
import IconFont from '../../../components/iconfont';
import Checkboxs from '../../../components/checkbox/checkbox';
import Counter from '../../../components/counter/counter';
import {
    debuglog,
    deviceInfo,
    fixStatusBarHeight,
    jumpOrderConfimPreview,
    ossUrl,
    updateChannelCode,
    updateTabBarChannelCode
} from '../../../utils/common';
import {api, options} from '../../../utils/net';
import CartLeftIcon from '../../../components/icon/CartLeftIcon';
import CartRightIcon from '../../../components/icon/CartRightIcon';
import {Base64} from 'js-base64';
import {AtSwipeAction} from "taro-ui"
import './index.less'
import TipModal from '../../../components/tipmodal/TipModal';
import {inject, observer} from '@tarojs/mobx'
import {userStore} from '../../../store/user';
import { observe } from 'mobx';
import LoginModal from "../../../components/login/loginModal";
import page from '../../../utils/ext'

@inject("userStore")
@observer
@page({
    share:true
})
export default class Cart extends Component<{}, {
    source: any;
    allSelected: boolean;
    total: number;
    isManage: boolean;
    selectIds: Array<any>;
    showDelTipModal: boolean;
}> {

    config: Config = {
        navigationBarTitleText: '购物车'
    }
    private tipModalOkCallBack: () => void = undefined;

    constructor(props) {
        super(props);
        this.state = {
            source: null,
            allSelected: false,
            total: 0,
            isManage: false,
            selectIds: [],
            showDelTipModal: false
        }
    }

    componentDidShow() {
        updateTabBarChannelCode("/pages/tabbar/cart/index")
    }

    componentDidMount() {
        // if (!userStore.isLogin) {
        //     if (deviceInfo.env == 'h5') {
        //         window.location.href = "/pages/tabbar/index/index";
        //     } else {
        //         Taro.switchTab({
        //             url: '/pages/tabbar/index/index'
        //         })
        //     }
        // }
        observe(userStore,"id",(change)=>{
            if (change.newValue != change.oldValue) {
                this.initData();
            }
        })
        if (userStore.isLogin) {
            this.initData();
        }
    }
    initData = () => {
        Taro.showLoading({title: '加载中'});
        api("app.cart/list", {
            size: 20,
            start: 0
        }).then((res) => {
            Taro.hideLoading();
            debuglog(res);
            if (res) {
                res.list = res.list.map((item) => {
                    item["checked"] = false;
                    item["opened"] = false;
                    return item;
                })
                this.setState({
                    source: res
                })
            }
        }).catch((e) => {
            debuglog(e);
        })
    }
    onItemClick = (list, index) => {
        list[index]["checked"] = !list[index]["checked"];
        const {source} = this.state;
        source.list = list;
        this.calcTotal(list);
        this.setState({
            source
        })
    }
    onAllSelect = (list, allSelected) => {
        if (!userStore.isLogin) {
            userStore.showLoginModal = true;
            return;
        }
        const {source} = this.state;
        source.list = list.map((item) => {
            item["checked"] = !allSelected;
            return item;
        });
        this.calcTotal(source.list);
        this.setState({
            allSelected: !allSelected,
            source
        })
    }
    calcTotal = (list: Array<any>) => {
        let tt = 0;
        let n = 0;
        const tempIds = [];
        for (const iterator of list) {
            if (iterator["checked"]) {
                tt += (parseFloat(iterator.sku.price) * parseFloat(iterator.quantity));
                n++;
                tempIds.push(iterator.id);
            }
        }
        this.setState({
            total: tt,
            allSelected: n == list.length,
            selectIds: tempIds
        });
    }
    onDelItem = (list: Array<any>, index) => {
        this.tipModalOkCallBack = () => {
            this.setState({
                showDelTipModal: false
            })
            Taro.showLoading({title: "删除中..."})
            const item = list[index];
            const {source} = this.state;
            api("app.cart/delete", {
                ids: item.id
            }).then(() => {
                Taro.hideLoading();
                source.list = list.filter(obj => obj.id != item.id);
                this.calcTotal(source.list)
                this.setState({
                    source,
                    selectIds: []
                })
            }).catch(() => {
                Taro.hideLoading();
                Taro.showToast({
                    title: "删除失败，请稍后再试",
                    icon: 'none',
                    duration: 2000
                })
            })
        }
        this.setState({
            showDelTipModal: true
        })
    }

    render() {
        const {source, allSelected, total, selectIds, showDelTipModal} = this.state;
        const list = source && source.list && source.list.length > 0 ? source.list : [];
        debuglog("list",list.length>0)
        const delOption = [{
            text: '删除',
            style: {
                width: Taro.pxTransform(120),
                height: Taro.pxTransform(224),
                background: "#FF4966",
                display: "flex",
                "justify-content": "center",
                padding: 0,
            }
        }];
        return (
            <View className='cart'>
                <LoginModal isTabbar />
                {/* @ts-ignore */}
                <View className='nav-bar' style={fixStatusBarHeight()}>
                    {/* <View className='left' onClick={() => {
                        Taro.navigateBack();
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314'/>
                    </View> */}
                    <View className='center'>
                        <Text className='title'>购物车</Text>
                    </View>
                </View>

                    {
                        list.length>0?<ScrollView scrollY className='center'>
                            <View className='list'>
                            {
                                list.map((item, index) => (
                                    <View className='item' key={item.id}>
                                        <AtSwipeAction options={delOption} autoClose
                                                    onClick={() => this.onDelItem(list, index)} isOpened={item.opened}
                                                    onOpened={() => {
                                                        source.list = list.map((iterator) => {
                                                            if (iterator.id == item.id) {
                                                                iterator.opened = true;
                                                            } else {
                                                                iterator.opened = false;
                                                            }
                                                            return iterator;
                                                        });
                                                        this.setState({
                                                            source
                                                        });
                                                    }} onClosed={() => {
                                            source.list = list.map((iterator) => {
                                                iterator.opened = false
                                                return iterator;
                                            });
                                            this.setState({
                                                source
                                            });
                                        }}>
                                            <View className='item_container'
                                                onClick={this.onItemClick.bind(this, list, index)}>
                                                <Checkboxs isChecked={item.checked} className='left' disabled/>
                                                <View className='right'>
                                                    <View className='pre-image'>
                                                        <Image src={ossUrl(item.thumb_image, 0)} className='img'
                                                            mode='aspectFill'/>
                                                        <View className='big' onClick={(e)=>{
                                                            e.stopPropagation();
                                                            Taro.previewImage({
                                                                current:item.thumb_image,
                                                                urls:[item.thumb_image]
                                                            })
                                                        }}><IconFont name='20_fangdayulan'
                                                                                        size={40}/></View>
                                                    </View>
                                                    <View className='party'>
                                                        <View className='name'>
                                                            <Text className='txt'>{item.product.title.length>10?item.product.title.substring(0,10)+"...":item.product.title}</Text>
                                                        </View>
                                                        <Text className='gg'>规格:{item.sku.value.join("/")}</Text>
                                                        <View className='np'>
                                                            <View className='price'>
                                                                <Text className='l'>¥</Text>
                                                                <Text
                                                                    className='n'>{(parseFloat(item.sku.price) * parseFloat(item.quantity)).toFixed(2)}</Text>
                                                            </View>
                                                            {
                                                                item.opened ?
                                                                    <Text className='total'>x{item.quantity}</Text> :
                                                                    <Counter num={item.quantity} onButtonClick={(num) => {
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
                                        </AtSwipeAction>
                                    </View>
                                ))
                            }
                        </View>
                        </ScrollView>:<View className='blank'>
                            <Image src={`${options.sourceUrl}appsource/nocart.svg`} className='img'/>
                            <Text className='tip'>购物车是空的</Text>
                            <Button className='go_gg_btn' onClick={()=>{
                                if (userStore.isLogin) {
                                    if (deviceInfo.env == "h5") {
                                        window.location.href = updateChannelCode('/pages/tabbar/index/index');
                                    } else {
                                        Taro.switchTab({
                                            url: updateChannelCode('/pages/tabbar/index/index')
                                        })
                                    }
                                } else {
                                    userStore.showLoginModal = true;
                                }

                            }}>去逛逛</Button>
                        </View>
                    }
                    <View className='bottom' style={deviceInfo.env=="h5"?`bottom: ${Taro.pxTransform(110)};`:`bottom: ${Taro.pxTransform(0)};`}>
                        <View className="all" onClick={this.onAllSelect.bind(this, list, allSelected)}>
                            <Checkboxs isChecked={allSelected} disabled/>
                            <Text className='txt'>全选</Text>
                        </View>
                        <View className='ops'>
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
                            <View className='right' onClick={() => {
                                if (total > 0) {
                                    const cartIds = selectIds.join(',');
                                    jumpOrderConfimPreview({
                                        cartIds:Base64.encode(cartIds, true)
                                    })

                                }
                            }}>
                                <CartRightIcon width={220} height={88} linght={total > 0}/>
                                <Text className='txt'>结算</Text>
                            </View>
                        </View>
                </View>
                <TipModal isShow={showDelTipModal} tip="是否删除？" cancelText="取消" okText="确定" onCancel={() => {
                    this.setState({showDelTipModal: false})
                }} onOK={this.tipModalOkCallBack}/>
            </View>
        )
    }
}
