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
    shareInfo,
    sleep, updateChannelCode,
    urlEncode,
    isEmptyX,
    jumpOrderConfimPreview, removeDuplicationForArr, debuglog, findPictureSizeForID, setPageTitle
} from '../../../../utils/common';
import {api} from '../../../../utils/net';
import './detail.less'
import PlaceOrder from '../../../../components/place/place';
import WxParse from '../../../../components/wxParse/wxParse';
import PhotosEle from "../../../../components/photos/photos";
import photoStore from "../../../../store/photo";
import LoginModal from '../../../../components/login/loginModal';
import {userStore} from "../../../../store/user";
import {inject, observer} from '@tarojs/mobx'
import {observe} from 'mobx';
import {PhotoParams} from "../../../../modal/modal";

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
    goodsMarketPrice:string;
    imageCount: number
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
            goodsMarketPrice:"0.00",
            imageCount: 10,
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
            debuglog("领取优惠券失败：", e)
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

    componentDidShow() {
        observe(userStore, "id", (change) => {
            if (change.newValue != change.oldValue && userStore.isLogin) {
                photoStore.setActionParamsToServer(getUserKey(), new PhotoParams())
            }
        })
        if (userStore.isLogin) {
            photoStore.setActionParamsToServer(getUserKey(), new PhotoParams())
        }

    }

    componentWillMount() {
        if (process.env.TARO_ENV == "h5") {
            document.title = this.config.navigationBarTitleText || "商品详情";
        }
        const {id, pid} = this.$router.params;
        if (id != "" && id != undefined && id != null && parseInt(id) > 0 && pid != "" && pid != undefined && pid != null) {
            this.setState({
                showOkButton: true
            });
        }
    }

    onShareAppMessage(){
        const {data} = this.state;
        if (data && data.id) {
            const {id, coupon, rid} = this.$router.params;
            let uri = "/pages/order/pages/product/detail?"
            if (!isEmptyX(id)) {
                uri = `${uri}id=${id}`
            } else {
                uri = `${uri}id=${data.id}`
            }
            if (!isEmptyX(coupon)) {
                uri = `${uri}&coupon=${coupon}`
            }
            if (!isEmptyX(rid)) {
                uri = `${uri}&rid=${rid}`
            }
            const share = {
                title:data.title || data.description,
                path:updateChannelCode(uri),
                imageUrl:""
            }
            if (!isEmptyX(data.share_title)) {
                share.title = data.share_title;
            }
            if (!isEmptyX(data.share_path)) {
                share.path = data.share_path;
            }
            if (!isEmptyX(data.share_image)) {
                share.imageUrl = data.share_image;
            }
            return share
        }
        return {
            title: shareInfo.title,
            path: shareInfo.link,
            imageUrl: shareInfo.imgUrl
        }
    }

    componentDidMount() {
        setPageTitle("商品详情")
        if (userStore.isLogin) {
            this.receiveCoupon()
            setTempDataContainer("product_preview_sku", null);
        }
        observe(userStore, "id", (change) => {
            if (change.newValue != change.oldValue && userStore.isLogin) {
                this.receiveCoupon()
                setTempDataContainer("product_preview_sku", null);
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
        if (id != "" && id != undefined && id != null && parseInt(id) > 0) {
            Taro.showLoading({title: '加载中...'})
            api("app.product/info", {
                id
            }).then((res) => {
                Taro.hideLoading();
                if (deviceInfo.env == "weapp") {
                    WxParse.wxParse('article', 'html', res.content, this.$scope, 0);
                }
                this.modalInit = true;
                res.attrGroup = res.attrGroup.filter((item,index) => {
                    if (item.special_show == "photonumber") {
                        res.attrItems.splice(index,1)
                    }
                    return item.special_show != "photonumber"
                })

                debuglog(res.attrGroup)
                if (pid != "" && pid != undefined && pid != null) {
                    //处理加购商品
                    getTempDataContainer(`${id}_${pid}`, (value) => {
                        if (value != null) {
                            debuglog(value);
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
                                debuglog(res.attrItems)
                            }
                            let select_ids = [];
                            if (value && value.selectSku) {
                                select_ids = value.selectSku.value_id.split(",");
                            }
                            let currentAddBuyGoods = [];
                            if (value.mainProduct) {
                                currentAddBuyGoods = value.mainProduct.merge_products.filter((item)=>item.product.id == res.id);
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
                                data: res,
                                buyTotal: currentAddBuyGoods.length == 1?parseInt(currentAddBuyGoods[0].quantity+""):1
                            });
                        }
                    })
                } else {
                    if (!notNull(rid)) {
                        this.getProductConfig(rid, (result) => {
                            // debuglog(result);
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

            }).catch((e) => {
                debuglog(e);
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
                            window.location.href = updateChannelCode('/pages/tabbar/index/index')
                        } else {
                            Taro.switchTab({
                                url: updateChannelCode('/pages/tabbar/index/index')
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
                        window.location.href = updateChannelCode('/pages/tabbar/index/index')
                    } else {
                        Taro.switchTab({
                            url: updateChannelCode('/pages/tabbar/index/index')
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
        if (sku && sku.length == data.attrGroup.length && selectSkuId>0 && buyTotal > 0) {
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
            window.location.href = updateChannelCode(url);
        } else {
            Taro.navigateTo({
                url: updateChannelCode(url)
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

        // 查询是否有套餐价
        const setMealIdx = data.attrGroup.findIndex(v => !notNull(v.special_show) && v.special_show === "setmeal");
        const sizeIdx = data.attrGroup.findIndex(v => !notNull(v.special_show) && v.special_show === "photosize");
        try {
            await photoStore.setActionParamsToServer(getUserKey(), {
                photo: {
                    path,
                    id: "",
                    sku: ""
                },
                usefulImages: removeDuplicationForArr({
                    newArr: ids.map((v, idx) => ({id: v, url: imgs[idx]})),
                    oldArr: photoStore.photoProcessParams.usefulImages
                }),
                pictureSize: findPictureSizeForID(sku, data.attrItems[sizeIdx])
            })
            Taro.hideLoading()
            const tmp = {
                id: data.id,
                cid: data.tpl_category_id,
                sku_id: sku.length>0 && selectSkuId == 0 ? sku.join(",") : selectSkuId,
                meal: "f"
            }
            if (sku) {
                if (sku.length>0 && selectSkuId == 0) {
                    // sku_id是残缺的子项ID
                    tmp["inc"] = "xxxx";
                }
            }
            if (sku != null) {
                tmp["detail"] = "t";
                // 如果是套餐价就带上meal参数并未 "t"
                if (setMealIdx > -1) {
                    tmp.meal = "t"
                }
            }
            const str = getURLParamsStr(urlEncode(tmp));
            Taro.navigateTo({
                url: updateChannelCode(`/pages/editor/pages/printing/change?${str}`)
            })

        } catch (e) {
            debuglog("存储临时数据出错：", e)
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

    onSetMealCount = count => {
        this.setState({imageCount: count || 10})
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
            imageCount,
            toastStatus,
        } = this.state;
        const image: Array<any> = data && data.image && data.image.length > 0 ? data.image : [];
        // const flag_text: Array<any> = data && !notNull(data.flag_text) ? data.flag_text : [];
        const tags_text: Array<any> = data && !notNull(data.tags_text) ? data.tags_text.slice(0, 4) : [];
        const attrGroup: Array<any> = data && !notNull(data.attrGroup) ? data.attrGroup : [];
        // debuglog()
        // @ts-ignore
        return (
            <View className='p_detail'>
                <View className='nav-bar' style={fixStatusBarHeight()}>
                    <View className='left' onClick={() => {
                        if (Taro.getCurrentPages().length > 1) {
                            Taro.navigateBack();
                        } else {
                            if (deviceInfo.env == 'h5') {
                                window.location.href = updateChannelCode('/pages/tabbar/index/index')
                            } else {
                                Taro.switchTab({
                                    url: updateChannelCode('/pages/tabbar/index/index')
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
                                                        //    debuglog("当前点击的图片",ossUrl(item, 3),index)
                                                           Taro.previewImage({
                                                               current: image[index],
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
                                {
                                    data && data.flag_text ? data.flag_text.map((obj,index)=>(
                                        <Image className='icon' src={obj.url} key={index+""}/>
                                    )):null
                                }
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
                                <Text className='num'>{data && data.price ? data.price:"0.00"}</Text>
                                {
                                   data && data.skus && data.skus.length>1? <Text className='start'>起</Text> :null
                                }
                            </View>
                            <View className='ap'>
                                <Text className='txt'>￥{data && data.market_price ? data.market_price:"0.00"}</Text>
                            </View>
                            <View className='total'>
                                <Text className='txt'>销量 {data && data.sold_count ? data.sold_count : 0}</Text>
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
                                      onClick={() => Taro.switchTab({url: updateChannelCode('/pages/tabbar/cart/index')})}>
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
                                        debuglog("当前类型：", data.tpl_product_type)
                                        if (!userStore.isLogin) {
                                            userStore.showLoginModal = true;
                                            return;
                                        }
                                        if (sku != null && sku && sku.length == data.attrItems.length) {

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
                            buyNumber={this.state.buyTotal}
                            productType={data && data.product_type ? data.product_type : ""}
                            defaultSelectIds={defalutSkuIds} data={data} showOkButton={showOkButton}
                            isShow={placeOrderShow} onClose={this.onPlaceOrderClose}
                            onSetMealCount={this.onSetMealCount}
                            onBuyNumberChange={(n) => {

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
                    // debuglog(sku,skuName,buyTotal)
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
                        jumpOrderConfimPreview({
                            skuid:selectSkuId,
                            total:buyTotal
                        })

                    } else {
                        Taro.showToast({
                            title: "请选择规格!",
                            icon: "none",
                            duration: 2000
                        });
                    }

                }} onSkuChange={(sku, id) => {
                    debuglog("sku change", sku, id);
                    let count = imageCount;
                    if (data && data.attrGroup && data.attrItems) {
                        const attrGroup:Array<any> = data.attrGroup;
                        const attrItems:Array<any> = data.attrItems;
                        const index = attrGroup.findIndex((obj)=>obj.special_show=="setmeal");
                        if (index>-1) {
                            const items:Array<any> = attrItems[index];
                            sku = sku.map((val)=>parseInt(val+""));
                            const it = items.find((obj)=>sku.indexOf(parseInt(obj.id))>-1);
                            if (it) {
                                count = parseInt(it.value);
                            }
                            
                        }
                    }
                    this.setState({
                        sku,
                        selectSkuId: parseInt(id + ""),
                        imageCount:count
                    })
                }} onOkButtonClick={() => this.onOkButtonClick()} onNowButtonClick={() => {
                    //立即制作
                    const {sku, data, selectSkuId} = this.state;
                    debuglog("当前类型：", data.tpl_product_type)
                    if (!userStore.isLogin) {
                        userStore.showLoginModal = true;
                        return;
                    }
                    if (sku != null && sku.length == data.attrGroup.length) {
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
                    debuglog("goodsMarketPrice",price,market)
                    this.setState({
                        goodsPrice:price,
                        goodsMarketPrice:market
                    })
                }}/>
                {
                    showPicSelector
                        ? <View className="photo_picker_container">
                            <PhotosEle editSelect={showPicSelector} onClose={() => this.setState({showPicSelector: false})}
                                       defaultSelect={photoStore.photoProcessParams.usefulImages}
                                       max={imageCount}
                                       onPhotoSelect={this.onPhotoSelect}/>
                        </View>
                        : null
                }
            </View>
        )
    }
}
