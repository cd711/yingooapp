import Taro, {Component, Config} from '@tarojs/taro'
import {Button, Image, RichText, ScrollView, Swiper, SwiperItem, Text, View} from '@tarojs/components'
import IconFont from '../../../../components/iconfont';
import {
    deviceInfo,
    fixStatusBarHeight,
    getTempDataContainer,
    getURLParamsStr,
    getUserKey,
    jumpToEditor,
    notNull,
    ossUrl,
    setTempDataContainer,
    sleep,
    urlEncode
} from '../../../../utils/common';
import {api} from '../../../../utils/net';
import './detail.less'
import {PlaceOrder} from '../template/place';
import WxParse from '../../../../components/wxParse/wxParse';
import PhotosEle from "../../../../components/photos/photos";
import photoStore from "../../../../store/photo";
import LoginModal from '../../../../components/login/loginModal';
import {userStore} from "../../../../store/user";
import {inject, observer} from '@tarojs/mobx'
import {observe} from 'mobx';

@inject("userStore")
@observer
export default class Login extends Component<{}, {
    data: any,
    currentPreImageIndex: number,
    placeOrderShow: boolean,
    buyTotal: number,
    sku: any,
    skuName: Array<string>,
    showOkButton: boolean,
    centerPartyHeight: number,
    defalutSkuIds: Array<number>,
    maxBuyNum: number;
    showPicSelector: boolean;
    toast: any;
    selectSkuId: number;
    toastStatus: boolean;
    goodsPrice:string;
    goodsMarketPrice:string
}> {

    config: Config = {
        navigationBarTitleText: '商品详情'
    }

    constructor(props: any) {
        super(props);
        this.state = {
            data: null,
            currentPreImageIndex: 0,
            placeOrderShow: false,
            buyTotal: 1,
            sku: null,
            skuName: [],
            showOkButton: false,
            centerPartyHeight: 550,
            defalutSkuIds: [],
            maxBuyNum: 0,
            showPicSelector: false,
            toast: {
                title: "",
                icon: "",
                status: false
            },
            toastStatus: false,
            selectSkuId: 0,
            goodsPrice:"0.00",
            goodsMarketPrice:"0.00"
        }
    }

    private tempDataContainerData = null;
    private tempDataContainerKey = "";
    public modalInit = false;

    private requesting: number = 0;
    receiveCoupon = async () => {
        if (this.requesting > 1) {
            return
        }
        this.requesting += 1;
        const {coupon} = this.$router.params;
        if (notNull(coupon)) {
            return
        }
        try {
            await api("app.coupon/add", {id: coupon});
            this.setState({
                toast: {
                    title: "领取成功",
                    icon: require("../../../../source/t_succ.png"),
                    status: true
                },
                toastStatus: true
            })
            this.toastClose();
            this.requesting = 0;
        } catch (e) {
            console.log("领取优惠券失败：", e)
            this.setState({
                toast: {
                    title: e,
                    icon: require("../../../../source/t_fail.png"),
                    status: true
                },
                toastStatus: true
            });
            this.requesting = 0;
            this.toastClose()
        }
    }

    componentWillPreload() {
        console.log("componentWillPreload")

        return new Promise<void>((resolve, reject) => {
            setTempDataContainer("product_preview_sku", null, (is) => {
                if (is) {
                    resolve();
                } else {
                    reject();
                }
            });
        })
    }

    componentDidMount() {
        if (userStore.isLogin) {
            this.receiveCoupon()
            setTempDataContainer("product_preview_sku", null, () => {
            });
        }
        observe(userStore, "id", (change) => {
            if (change.newValue != change.oldValue && userStore.isLogin) {
                this.receiveCoupon()
                setTempDataContainer("product_preview_sku", null, () => {
                });
            }
        })
        if (process.env.TARO_ENV != 'h5') {
            Taro.createSelectorQuery().select(".nav-bar").boundingClientRect((nav_rect) => {
                Taro.createSelectorQuery().select(".product_bottom_bar").boundingClientRect((status_react) => {
                    this.setState({
                        centerPartyHeight: Taro.getSystemInfoSync().windowHeight - nav_rect.height - status_react.height
                    });
                }).exec();
            }).exec();
        }
        const {id, pid, rid} = this.$router.params;
        if (id != "" && id != undefined && id != null && parseInt(id) > 0 && pid != "" && pid != undefined && pid != null) {
            this.setState({
                showOkButton: true
            });
        }
        if (id != "" && id != undefined && id != null && parseInt(id) > 0) {
            Taro.showLoading({title: '加载中...'})
            api("app.product/info", {
                id
            }).then((res) => {
                Taro.hideLoading();
                this.modalInit = true;
                res.attrGroup = res.attrGroup.filter((item) => {
                    console.log(item)
                    return item.special_show != "photonumber"
                })
                console.log(res.attrGroup)
                if (pid != "" && pid != undefined && pid != null) {
                    getTempDataContainer(`${id}_${pid}`, (value) => {
                        if (value != null) {
                            console.log(value);
                            this.tempDataContainerData = value;
                            this.tempDataContainerKey = `${id}_${pid}`;
                            if (value.hasOldSku) {
                                res.attrItems = res.attrItems.map((item) => {
                                    return item.filter((it) => {
                                        if (value.selectSku != null) {
                                            return value.selectSku.value.some((obj) => obj == it.name)
                                        }
                                        return true;
                                    })
                                })
                                console.log(res.attrItems)
                            }
                            let select_ids = [];
                            if (value && value.selectSku) {
                                select_ids = value.selectSku.value_id.split(",");
                            }
                            this.setState({
                                defalutSkuIds: select_ids,
                                skuName: value && value.selectSku ? value.selectSku.value.map((item, index) => {
                                    const key = value.selectSku.keys[index];
                                    if (item == "") {
                                        return key;
                                    }
                                    return item;
                                }) : [],
                                maxBuyNum: value && value.currentAddBuyItem && value.currentAddBuyItem.max_quantity ? parseInt(value.currentAddBuyItem.max_quantity + "") : 0,
                                data: res
                            });
                        }
                    })
                } else {
                    if (!notNull(rid)) {
                        this.getProductConfig(rid, (result) => {
                            // console.log(result);
                            // result.attr_ids = [58,59,60,64,66,67,70];
                            // result.defalut_attr_ids = [59,64];
                            if (result.attr_ids.length > 0) {
                                res.attrItems = res.attrItems.map((item) => {
                                    return item.filter((val) => {
                                        return result.attr_ids.indexOf(parseInt(val.id + "")) != -1
                                    })
                                });
                                res.skus = res.skus.filter((item) => {
                                    const vals = item.value.split(",");
                                    return vals.every(v => result.attr_ids.includes(parseInt(v + "")))
                                })
                            }
                            this.setState({
                                data: res,
                                defalutSkuIds: result.default_attr_ids.map((item) => parseInt(item + "")).map((it) => {
                                    return it + ""
                                })
                            })
                        })
                    } else {
                        this.setState({
                            data: res
                        })
                    }

                }
                if (deviceInfo.env != "h5") {
                    WxParse.wxParse('article', 'html', res.content, this.$scope, 0);
                }
            }).catch((e) => {
                console.log(e);
                Taro.hideLoading();
                Taro.showToast({
                    title: e,
                    duration: 2000,
                    icon: 'none'
                });
                setTimeout(() => {
                    if (Taro.getCurrentPages().length > 1) {
                        Taro.navigateBack();
                    } else {
                        if (deviceInfo.env == 'h5') {
                            window.location.href = '/pages/tabbar/index/index'
                        } else {
                            Taro.switchTab({
                                url: '/pages/tabbar/index/index'
                            })
                        }
                    }
                }, 2001);
            })
        } else {
            Taro.showToast({
                title: '参数错误',
                duration: 2000,
                icon: 'none'
            });
            setTimeout(() => {
                if (Taro.getCurrentPages().length > 1) {
                    Taro.navigateBack();
                } else {
                    if (deviceInfo.env == 'h5') {
                        window.location.href = '/pages/tabbar/index/index'
                    } else {
                        Taro.switchTab({
                            url: '/pages/tabbar/index/index'
                        })
                    }
                }
            }, 2001);
        }

    }

    getProductConfig = (id: string, callback: (r: any) => void) => {
        api("app.index/indexConfig", {
            id
        }).then((res) => {
            if (res) {
                callback(res)
            }
        })
    }
    onAddCart = () => {
        if (!userStore.isLogin) {
            userStore.showLoginModal = true;
            return;
        }
        this.setState({
            placeOrderShow: true
        });
    }
    onNowBuy = () => {
        if (!userStore.isLogin) {
            userStore.showLoginModal = true;
            return;
        }
        this.setState({
            placeOrderShow: true
        });
    }
    onPlaceOrderClose = () => {
        this.setState({

            placeOrderShow: false,
            // showOkButton:false
        });
    }
    onOkButtonClick = () => {
        if (!userStore.isLogin) {
            userStore.showLoginModal = true;
            return;
        }

        const {buyTotal, sku, selectSkuId, data} = this.state;
        if (sku && sku.length == data.attrGroup.length && selectSkuId > 0 && buyTotal > 0) {
            this.setState({
                placeOrderShow: false
            });
            setTempDataContainer(this.tempDataContainerKey, {
                ...this.tempDataContainerData,
                buyTotal,
                sku,
                selectSkuId,
                isOk: true
            }, (is) => {
                if (is) {
                    Taro.navigateBack();
                }
            })
        } else {
            Taro.showToast({
                title: "请选择规格!",
                icon: "none",
                duration: 2000
            });
        }
    }
    goUrl = (url) => {
        if (deviceInfo.env == 'h5') {
            window.location.href = url;
        } else {
            Taro.navigateTo({
                url
            })
        }
    }

    onPhotoSelect = async ({ids, imgs, attrs}) => {

        const {data, sku, selectSkuId} = this.state;
        this.setState({showPicSelector: false})
        Taro.showLoading({title: "请稍后...."})

        const path = [];
        for (let i = 0; i < ids.length; i++) {
            path.push({
                id: ids[i],
                url: imgs[i],
                attr: attrs[i],
                edited: false,
                doc: ""
            })
        }

        try {
            await photoStore.setActionParamsToServer(getUserKey(), {
                photo: {
                    path,
                    id: "",
                    sku: ""
                }
            })
            Taro.hideLoading()
            const tmp = {
                id: data.id,
                cid: data.tpl_category_id,
                sku_id: data.attrGroup.length != data.attrItems.length ? sku.join(",") : selectSkuId,
            }

            if (sku) {
                if (data.attrGroup.length != data.attrItems.length) {
                    tmp["inc"] = "xxxx";
                }
            }
            if (sku != null) {
                tmp["detail"] = "t";
            }
            const str = getURLParamsStr(urlEncode(tmp));
            Taro.navigateTo({
                url: `/pages/editor/pages/printing/change?${str}`
            })

        } catch (e) {
            console.log("存储临时数据出错：", e)
            Taro.hideLoading()
            Taro.showToast({title: "出错啦~，稍后试试吧"})
        }
    }

    toastClose = async () => {
        await sleep(2000)
        this.setState({
            toast: {
                ...this.state.toast,
                status: false
            },
            toastStatus: false
        })
    }

    render() {
        const {
            data,
            currentPreImageIndex,
            placeOrderShow,
            skuName,
            showOkButton,
            centerPartyHeight,
            defalutSkuIds,
            maxBuyNum,
            showPicSelector,
            toast,
            toastStatus,
            goodsPrice,
            selectSkuId,
            goodsMarketPrice
        } = this.state;
        const image: Array<any> = data && data.image && data.image.length > 0 ? data.image : [];
        // const flag_text: Array<any> = data && !notNull(data.flag_text) ? data.flag_text : [];
        const tags_text: Array<any> = data && !notNull(data.tags_text) ? data.tags_text.slice(0, 4) : [];
        const attrGroup: Array<any> = data && !notNull(data.attrGroup) ? data.attrGroup : [];
        console.log()
        // @ts-ignore
        return (
            <View className='p_detail'>
                <View className='nav-bar' style={fixStatusBarHeight()}>
                    <View className='left' onClick={() => {
                        if (Taro.getCurrentPages().length > 1) {
                            Taro.navigateBack();
                        } else {
                            if (deviceInfo.env == 'h5') {
                                window.location.href = '/pages/tabbar/index/index'
                            } else {
                                Taro.switchTab({
                                    url: '/pages/tabbar/index/index'
                                });
                            }
                        }
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314'/>
                    </View>
                    <View className='center'>
                        <Text className='title'>{this.config.navigationBarTitleText || '商品详情'}</Text>
                    </View>
                </View>
                {
                    toastStatus
                        ? <View className="detail_toast_container">
                            <View className="toast_main">
                                <View className="img"><Image src={toast.icon} className="icon"/></View>
                                <View className="txt_info"><Text className="txt">{toast.title}</Text></View>
                            </View>
                        </View>
                        : null
                }
                <LoginModal isTabbar={false}/>
                <ScrollView scrollY className="p_detail_scroll"
                            style={deviceInfo.env === 'h5' ? "flex:1" : `height:${centerPartyHeight}px`}>
                    <View className='pre_image_swiper'>
                        {
                            image.length > 0 ? <Swiper indicatorDots={false}
                                                       autoplay={false}
                                                       className="pre_swiper"
                                                       onChange={({detail: {current}}) => {
                                                           if (current != currentPreImageIndex) {
                                                               this.setState({
                                                                   currentPreImageIndex: current
                                                               })
                                                           }
                                                       }}
                                                       current={currentPreImageIndex}
                                                       style={deviceInfo.env == 'h5' ? "" : `width:${deviceInfo.windowWidth}px;height:${deviceInfo.windowWidth}px`}
                                >
                                    {
                                        image.map((item, index) => (
                                            <SwiperItem key={index + ""}
                                                        style={`width:${deviceInfo.windowWidth}px;height:${deviceInfo.windowWidth}px`}>
                                                <Image lazyLoad src={ossUrl(item, 2)}
                                                       style={`width:${deviceInfo.windowWidth}px;height:${deviceInfo.windowWidth}px`}
                                                       onClick={() => {
                                                           Taro.previewImage({
                                                               current: ossUrl(item, 3),
                                                               urls: image
                                                           })
                                                       }}/>
                                            </SwiperItem>
                                        ))
                                    }
                                </Swiper> :
                                <View style={`width:${deviceInfo.windowWidth}px;height:${deviceInfo.windowWidth}px`}/>
                        }

                        <View className="indicator">
                            <Text className='txt'>{`${currentPreImageIndex + 1}/${image.length}`}</Text>
                        </View>
                    </View>
                    <View className="product_info">
                        <View className='title'>
                            <Text
                                className='txt'>{data && data.title ? (data.title.length > 30 ? `${data.title.substring(0, 30)}...` : data.title) : ""}</Text>
                            <Image className='icon' src={require("../../../../source/hot.png")}/>
                        </View>

                        <View className='tags'>
                            {
                                tags_text.map((item) => (
                                    <View className='item' key={item.id}>
                                        <Text className='txt'>{item.name}</Text>
                                    </View>
                                ))
                            }
                        </View>

                        <View className='price_line'>
                            <View className='dp'>
                                <Text className='smy'>￥</Text>
                                <Text className='num'>{goodsPrice}</Text>
                            </View>
                            {
                                selectSkuId>0?<View className='ap'>
                                    <Text className='txt'>￥{goodsMarketPrice}</Text>
                                </View>:null
                            }
                            <View className='total'>
                                <Text className='txt'>{data && data.sold_count ? data.sold_count : 0}人已抢</Text>
                            </View>
                        </View>
                    </View>
                    <View className='sku_box'>
                        <View className='item' onClick={() => {
                            this.setState({
                                placeOrderShow: true
                            });
                        }}>
                            <View className='content'>
                                <Text className='title'>规格</Text>
                                <Text
                                    className='sku'>{skuName.length > 0 ? "已选择" : "选择"} {skuName.length > 0 ? skuName.join("/") : attrGroup.map((item) => item["name"]).join("/")}</Text>
                            </View>
                            <IconFont name='20_xiayiye' size={40} color='#9C9DA6'/>
                        </View>
                    </View>
                    {
                        deviceInfo.env != "h5" ? <View>
                            <import src='../../../../components/wxParse/wxParse.wxml'/>
                            {/* @ts-ignore */}
                            <template is="wxParse" data="{{wxParseData:article.nodes}}"/>
                        </View> : <View className='pic_txt_detail'><RichText
                            nodes={data && data.content ? data.content : ""}/></View>
                    }
                </ScrollView>
                <View className='product_bottom_bar'>
                    <View className='main'>
                        {
                            showOkButton ? null : (data && data.product_type && data.product_type == "customized" ? null :
                                <View className='cart'
                                      onClick={() => Taro.switchTab({url: '/pages/tabbar/cart/index'})}>
                                    <IconFont name="24_gouwuche" size={48} color="#707177"/>
                                    <Text className='txt'>购物车</Text>
                                </View>)
                        }
                        {
                            showOkButton ? <View className='ops'>
                                <Button className='red-ok-btn' onClick={() => {

                                    if (!userStore.isLogin) {
                                        userStore.showLoginModal = true;
                                        return;
                                    }
                                    const {buyTotal, sku, selectSkuId} = this.state;
                                    if (sku && sku.length == data.attrGroup.length && selectSkuId > 0 && buyTotal > 0) {
                                        this.setState({
                                            placeOrderShow: false
                                        });
                                        setTempDataContainer(this.tempDataContainerKey, {
                                            ...this.tempDataContainerData,
                                            buyTotal,
                                            sku,
                                            selectSkuId,
                                            isOk: true
                                        }, (is) => {
                                            if (is) {
                                                Taro.navigateBack();
                                            }
                                        })

                                    } else {
                                        this.setState({
                                            placeOrderShow: true
                                        });
                                    }
                                }}>确定</Button>
                            </View> : (data && data.product_type && data.product_type == "customized" ?
                                <View className='ops'>
                                    <Button className='red-ok-btn' onClick={() => {
                                        const {sku, data, selectSkuId} = this.state;
                                        console.log("当前类型：", data.tpl_product_type)
                                        if (!userStore.isLogin) {
                                            userStore.showLoginModal = true;
                                            return;
                                        }
                                        if (data.tpl_product_type == "photo") {
                                            if (sku == null && defalutSkuIds && defalutSkuIds.length > 0) {
                                                console.log(defalutSkuIds);
                                                if (data.attrGroup.length != data.attrItems.length) {
                                                    this.modalInit = false
                                                    this.setState({showPicSelector: true})
                                                    return;
                                                }
                                            }
                                        }
                                        if (sku != null && sku && sku.length == data.attrItems.length && selectSkuId > 0) {

                                            setTempDataContainer("product_preview_sku", {
                                                sku,
                                                selectSkuId
                                            }, (is) => {
                                                if (is) {
                                                    if (data.tpl_product_type == "phone") {
                                                        jumpToEditor({
                                                            cid: data.tpl_category_id,
                                                            tpl_id: 0
                                                        });
                                                    }
                                                    if (data.tpl_product_type == "photo") {
                                                        this.modalInit = false
                                                        this.setState({showPicSelector: true})
                                                    }
                                                } else {
                                                    Taro.showToast({
                                                        title: '服务器走丢啦,请稍后再试~',
                                                        icon: 'none',
                                                        duration: 1500
                                                    });
                                                }
                                            })
                                            // this.goUrl(url);
                                        } else {
                                            this.setState({
                                                placeOrderShow: true
                                            });
                                        }
                                    }}>立即制作</Button>
                                </View> : <View className='ops'>
                                    <Button className='add-cart-btn' onClick={this.onAddCart}>加入购物车</Button>
                                    <Button className='now-buy-btn' onClick={this.onNowBuy}>立即购买</Button>
                                </View>)
                        }
                    </View>
                </View>
                <PlaceOrder maxBuyNum={maxBuyNum}
                            productType={data && data.product_type ? data.product_type : ""}
                            defalutSelectIds={defalutSkuIds} data={data} showOkButton={showOkButton}
                            isShow={placeOrderShow} onClose={this.onPlaceOrderClose}
                            onBuyNumberChange={(n) => {
                                console.log(n)
                                this.setState({
                                    buyTotal: n,
                                    // defalutSkuIds: []
                                })
                            }} onAddCart={() => {
                    if (!userStore.isLogin) {
                        userStore.showLoginModal = true;
                        return;
                    }
                    const {sku, selectSkuId, data, buyTotal} = this.state;
                    // const {attrGroup} = data;
                    // console.log(sku,skuName,buyTotal)
                    if (sku.length == data.attrGroup.length && buyTotal > 0) {
                        Taro.showLoading({title: "加载中"})
                        api("app.cart/add", {
                            sku_id: selectSkuId,
                            user_tpl_id: 0,
                            quantity: buyTotal
                        }).then(() => {
                            Taro.hideLoading();
                            Taro.showToast({
                                title: "已添加到购物车!",
                                icon: "success",
                                duration: 2000
                            })
                        }).catch((e) => {
                            Taro.hideLoading();
                            Taro.showToast({
                                title: e,
                                icon: "none",
                                duration: 2000
                            })
                        })
                    } else {
                        Taro.showToast({
                            title: "请选择规格!",
                            icon: "none",
                            duration: 2000
                        });
                    }
                }} onNowBuy={() => {
                    if (!userStore.isLogin) {
                        userStore.showLoginModal = true;
                        return;
                    }
                    const {buyTotal, data, selectSkuId, sku} = this.state;
                    if (sku != null && sku.length == data.attrGroup.length && buyTotal > 0 && selectSkuId > 0) {
                        this.setState({
                            placeOrderShow: false
                        })
                        Taro.navigateTo({
                            url: `/pages/order/pages/template/confirm?skuid=${selectSkuId}&total=${buyTotal}`
                        })
                    } else {
                        Taro.showToast({
                            title: "请选择规格!",
                            icon: "none",
                            duration: 2000
                        });
                    }

                }} onSkuChange={(sku, id) => {
                    console.log("sku change", sku, id);
                    this.setState({
                        sku,
                        selectSkuId: parseInt(id + "")
                    })
                }} onOkButtonClick={() => this.onOkButtonClick()} onNowButtonClick={() => {
                    //立即制作
                    const {sku, data, selectSkuId} = this.state;
                    console.log("当前类型：", data.tpl_product_type)
                    if (!userStore.isLogin) {
                        userStore.showLoginModal = true;
                        return;
                    }
                    if (data.tpl_product_type == "photo") {
                        if (sku.length == data.attrGroup.length && selectSkuId > 0) {
                            console.log(defalutSkuIds);
                            if (data.attrGroup.length != data.attrItems.length) {
                                this.modalInit = false
                                this.setState({showPicSelector: true})
                                return;
                            }
                        }
                    }
                    if (sku != null && sku.length == data.attrGroup.length) {
                        // let url = ""

                        setTempDataContainer("product_preview_sku", {
                            sku,
                            selectSkuId
                        }, (is) => {
                            if (is) {
                                if (data.tpl_product_type == "phone") {
                                    jumpToEditor({
                                        cid: data.tpl_category_id,
                                        tpl_id: 0
                                    });
                                }
                                if (data.tpl_product_type == "photo") {
                                    this.modalInit = false
                                    this.setState({showPicSelector: true})
                                }
                            } else {
                                Taro.showToast({
                                    title: '服务器走丢啦,请稍后再试~',
                                    icon: 'none',
                                    duration: 1500
                                });
                            }
                        })
                        // this.goUrl(url);
                    } else {
                        Taro.showToast({
                            title: "请选择规格!",
                            icon: "none",
                            duration: 2000
                        });
                    }
                }} onNamesChange={(names) => {
                    this.setState({
                        skuName: names,
                    });
                }} onPriceChange={(price,market)=>{
                    console.log("goodsMarketPrice",price,market)
                    this.setState({
                        goodsPrice:price,
                        goodsMarketPrice:market
                    })
                }}/>
                {
                    showPicSelector
                        ? <View className="photo_picker_container">
                            <PhotosEle editSelect={showPicSelector} onClose={() => this.setState({showPicSelector: false})}
                                       onPhotoSelect={this.onPhotoSelect}/>
                        </View>
                        : null
                }
            </View>
        )
    }
}
