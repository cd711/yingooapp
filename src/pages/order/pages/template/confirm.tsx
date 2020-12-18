import Taro, {Component, Config} from '@tarojs/taro'
import {Button, Image, ScrollView, Text, View} from '@tarojs/components'
import './confirm.less';
import IconFont from '../../../../components/iconfont';
import {api} from '../../../../utils/net'
import {templateStore} from '../../../../store/template';
import {userStore} from '../../../../store/user';
import {inject, observer} from '@tarojs/mobx';
import isEmpty from 'lodash/isEmpty';
import Counter from '../../../../components/counter/counter';
import FloatModal from '../../../../components/floatModal/FloatModal';
import Ticket from '../../../../components/ticket/Ticket';
import {
    deviceInfo,
    fixStatusBarHeight,
    getTempDataContainer,
    notNull,
    ossUrl,
    setTempDataContainer,
} from '../../../../utils/common';
import {Base64} from 'js-base64';
import PayWayModal from '../../../../components/payway/PayWayModal';
import AddBuy from '../../../../components/addbuy/addbuy';
import LoginModal from '../../../../components/login/loginModal';
import {observe} from 'mobx';
import photoStore from "../../../../store/photo";

@inject("userStore", "templateStore")
@observer
export default class Confirm extends Component<any, {
    showTickedModal: boolean;
    showPayWayModal: boolean;

    data: any;
    tickets: [],
    ticketId: number | string | null,
    usedTicket: boolean,
    currentTicketOrderId: string,
    currentOrderTicketId: number,
    usedTickets: Array<any>
    order_sn: string;
    payStatus: number,
    orderid: string,
    centerPartyHeight: number
}> {

    config: Config = {
        navigationBarTitleText: '确认订单'
    }

    constructor(props) {
        super(props);
        this.state = {
            showTickedModal: false,
            showPayWayModal: false,
            order_sn: "",
            data: {},
            tickets: [],
            ticketId: null,
            usedTicket: false,
            currentTicketOrderId: "",
            currentOrderTicketId: 0,
            usedTickets: [],
            payStatus: 0,
            orderid: "",
            centerPartyHeight: 500
        }
    }

    // 是否从照片冲印跳转过来
    private isPhoto: boolean = false;
    private tempContainerKey = "";

    componentDidMount() {
        if (process.env.TARO_ENV != 'h5') {
            Taro.createSelectorQuery().select(".nav-bar").boundingClientRect((nav_rect) => {
                Taro.createSelectorQuery().select(".bottom").boundingClientRect((status_react) => {
                    this.setState({
                        centerPartyHeight: Taro.getSystemInfoSync().windowHeight - nav_rect.height - status_react.height
                    });
                }).exec();
            }).exec();
        }

        observe(userStore, "id", (change) => {
            if (change.newValue != change.oldValue) {
                this.initData();
            }
        });

        this.initData();

    }

    initData = async () => {

        const {page, skuid, total}: any = this.$router.params;

        this.isPhoto = page && page === "photo";

        let params = {};
        if (this.isPhoto) {
            try {
                await photoStore.getServerParams({setLocal: true});
                console.log(photoStore.photoProcessParams.changeUrlParams)
                params = photoStore.photoProcessParams.changeUrlParams
            } catch (e) {
                console.log("读取参数出错：", e)

            }
        } else {
            params = this.$router.params
        }
        console.log("得到的参数：", params)
        const {tplid, model, orderid, cartIds, parintImges}: any = params;

        if (orderid) {
            this.checkOrder(orderid);
        } else {

            let data: any = {
                sku_id: skuid,
                quantity: total,
                user_tpl_id: this.isPhoto ? -1 : tplid,
            };
            if (!this.isPhoto) {
                data = {
                    ...data,
                    phone_model_id: model ? model : 336
                }
            }
            if (cartIds) {
                data = {
                    cart_ids: Base64.decode(cartIds)
                }
            }
            if (!isEmpty(userStore.address)) {
                templateStore.address = userStore.address;
                data["address_id"] = userStore.address.id;
            }

            if (this.isPhoto && parintImges) {
                data = {...data, print_images: JSON.stringify(parintImges)}
            }

            console.log("组合的数据：", data)

            Taro.showLoading({title: "加载中"});
            api("app.order_temp/add", data).then((res) => {
                Taro.hideLoading();
                if (deviceInfo.env == 'h5') {
                    window.history.replaceState(null, null, `/pages/order/pages/template/confirm?orderid=${res.prepay_id}`);
                }
                this.filterUsedTicket(res.orders);
                this.setState({
                    data: this.handleData(res),
                    orderid: res.prepay_id
                });
            }).catch((e) => {
                Taro.hideLoading();
                Taro.showToast({
                    title: e,
                    icon: "none",
                    duration: 2000
                })
            })
        }
    }
    handleData = (res: any) => {
        const temp = res;
        if (temp && temp.orders) {
            const orders = temp.orders;
            for (const iterator of orders) {
                if (iterator.products.length == 1) {
                    for (const product of iterator.merge_products) {
                        product["checked"] = false;
                        const isSelectItem: Array<any> = iterator.products.filter((obj) => obj.merge_products.some((ibj) => ibj.product.id == product.id));
                        console.log("select_add_product", isSelectItem);
                        if (isSelectItem.length == 1) {
                            product["checked"] = true;
                        }
                    }
                }
            }
        }
        return temp
    }

    componentDidShow() {
        console.log("componentDidShow")
        const {data: {address}} = this.state;
        if (this.tempContainerKey != "") {
            getTempDataContainer(this.tempContainerKey, (value) => {
                if (value != null && value.isOk) {
                    this.addBuyProduct(value.pre_order_id, value.product_id, value.sku.id, value.buyTotal);
                }
            })
        }
        if (!isEmpty(address) && !isEmpty(templateStore.address)) {
            console.log("a");
            if (address.id == templateStore.address.id) {
                console.log("B");
                return;
            }
        }
        const {orderid} = this.$router.params;
        let prepay_id = orderid;
        if (!orderid) {
            prepay_id = this.state.orderid;
        }
        if (!isEmpty(templateStore.address) && prepay_id) {
            Taro.showLoading({title: "加载中"});
            api("app.order_temp/address", {
                prepay_id: prepay_id,
                address_id: templateStore.address.id
            }).then((res) => {
                Taro.hideLoading();
                this.filterUsedTicket(res.orders)
                this.setState({
                    data: this.handleData(res)
                })
            }).catch((e) => {
                console.log(e);
            })
        }
    }

    checkOrder = (id) => {
        Taro.showLoading({title: "加载中"});
        const url = "app.order_temp/info";
        // if (isInfo) {
        //     url = "app.order_temp/info";
        // }
        api(url, {
            prepay_id: id
        }).then((res) => {
            Taro.hideLoading();
            this.filterUsedTicket(res.orders);
            templateStore.address = res.address;
            console.log(res);
            this.setState({
                data: this.handleData(res),
                // showPayWayModal:isInfo?false:true
            });
        }).catch(e => {

            Taro.hideLoading();
            setTimeout(() => {
                window.history.replaceState(null, null, '/pages/tabbar/me/me');
                Taro.getApp().tab = 1;
                Taro.navigateTo({
                    url: '/pages/tabbar/order/order?tab=1'
                })
            }, 2000);
            Taro.showToast({
                title: e,
                duration: 2000,
                icon: "none"
            });
        })
    }

    filterUsedTicket = (orders) => {
        const temp = [];
        for (const iterator of orders) {
            if (iterator.use_coupon) {
                const t = {
                    orderId: iterator.pre_order_id,
                    ticketId: iterator.use_coupon.id
                }
                temp.push(t);
            }
        }
        this.setState({
            usedTickets: temp
        })
    }

    onSubmitOrder = () => {
        // this.setState({
        //     showPayWayModal:true
        // })
        const {data} = this.state;
        // this.checkOrder(data.prepay_id,false);
        Taro.showLoading({title: '加载中...'})
        api('app.order/add', {
            prepay_id: data.prepay_id,
            remarks: ""
        }).then((res) => {
            // console.log(res);
            Taro.hideLoading();
            if (res.status > 0) {
                Taro.navigateTo({
                    url: `/pages/order/pages/template/success?status=${Base64.encodeURI(res.order_sn + "-" + "0")}`
                });
                return;
            }
            this.setState({
                order_sn: res.order_sn,
                showPayWayModal: true,
                payStatus:res.status
            });
        }).catch((e) => {
            Taro.hideLoading();
            setTimeout(() => {
                window.history.replaceState(null, null, '/pages/tabbar/me/me');
                Taro.getApp().tab = 1;
                Taro.navigateTo({
                    url: '/pages/tabbar/order/order?tab=1'
                })
            }, 2000);
            Taro.showToast({
                title: e,
                duration: 2000,
                icon: "none"
            });

        })

    }

    // 选择优惠券
    onSelectTicket = (tickets, tId) => {
        console.log(tickets, tId)
        const discounts = tickets.map((item) => {
            item["checked"] = false;
            if (tId == item.id) {
                item["checked"] = true;
            }
            return item;
        });
        this.setState({
            tickets: discounts,
            ticketId: Number(tId)
        })
    }

    //计数器更改
    onCounterChange = (num, payid, orderid, product) => {
        if (parseInt(product.quantity) != num) {
            Taro.showLoading({title: "加载中"})
            api("app.order_temp/quantity", {
                prepay_id: payid,
                pre_order_id: orderid,
                product_id: product.id,
                quantity: num
            }).then((res) => {
                Taro.hideLoading();
                this.filterUsedTicket(res.orders)
                this.setState({
                    data: this.handleData(res)
                })
            }).catch((e) => {
                Taro.hideLoading();
                setTimeout(() => {
                    Taro.reLaunch({
                        url: '/pages/tabbar/index/index'
                    })
                }, 2000);
                Taro.showToast({
                    title: e,
                    icon: "none",
                    duration: 2000
                })
            })
        }
    }
    onTicketUsed = (payId) => {
        const {ticketId, currentTicketOrderId} = this.state;
        if (!notNull(ticketId) && Number(ticketId) > 0) {
            Taro.showLoading({title: "加载中"});
            api("app.order_temp/coupon", {
                prepay_id: payId,
                pre_order_id: currentTicketOrderId,
                usercoupon_id: ticketId
            }).then((res) => {
                Taro.hideLoading();
                this.filterUsedTicket(res.orders);
                this.setState({
                    data: this.handleData(res)
                });
            }).catch((e) => {
                Taro.hideLoading();
                setTimeout(() => {
                    Taro.reLaunch({
                        url: '/pages/tabbar/index/index'
                    })
                }, 2000);
                Taro.showToast({
                    title: e,
                    icon: "none",
                    duration: 2000
                })
            })
            this.setState({
                showTickedModal: false,
                usedTicket: true,
                currentTicketOrderId: "",
                currentOrderTicketId: 0
            });
        }

        this.setState({
            showTickedModal: false,
            currentTicketOrderId: "",
            currentOrderTicketId: 0
        })
    }
    onResult = (res) => {
        this.setState({
            showPayWayModal: false,
        });
        let title = '';
        Taro.getApp().tab = 1;
        let url = '/pages/tabbar/order/order?tab=1';
        switch (res.code) {
            case 1:
                title = '支付成功';
                url = deviceInfo.env == 'h5' ? `/pages/order/pages/template/success?way=${res.way}&price=${res.total}` : `/pages/order/pages/template/success?status=${Base64.encodeURI(res.data + "-" + "0")}&pay_order_sn=${res.data}`;
                break;
            case 2:
                url = '/pages/tabbar/order/order?tab=1';
                break;
            default:
                title = res.data;
                break;
        }
        if (title.length > 0) {
            Taro.showToast({
                title,
                icon: 'none',
                duration: 2000
            });
        }
        setTimeout(() => {
            if (res.code == 2) {
                Taro.switchTab({
                    url
                });
            } else {
                Taro.navigateTo({
                    url
                })
            }

        }, 2000);
    }
    onGoodsItemClick = (item, usedTickets) => {
        let discounts = item.usable_discounts.filter(obj => !usedTickets.some(obj1 => obj1.ticketId == obj.id && obj1.orderId != item.pre_order_id));
        if (discounts == 0) {
            return;
        }
        const ticketId = item.use_coupon ? item.use_coupon.id : 0
        discounts = discounts.map((item) => {
            item["checked"] = false;
            if (ticketId == item.id) {
                item["checked"] = true;
            }
            return item;
        })
        this.setState({
            showTickedModal: true,
            tickets: discounts,
            currentTicketOrderId: item.pre_order_id,
            currentOrderTicketId: ticketId
        })
    }
    getAddBuyProduct = () => {

    }
    onAddBuyItemDetailClick = (mainProduct, preOrderId, mainProductId, item) => {
        console.log("onAddBuyItemDetailClick")
        const {data} = this.state;
        const subItem = mainProduct.merge_products.find((obj) => obj.product.id == item.id)
        setTempDataContainer(`${item.id}_${mainProductId}`, {
            prepay_id: data.prepay_id,
            pre_order_id: preOrderId,
            product_id: mainProductId,
            mainProduct: mainProduct,
            currentAddBuyItem: item,
            hasOldSku: item.sku != null,
            selectSku: subItem && subItem.sku ? subItem.sku : null
        }, (is) => {
            this.tempContainerKey = `${item.id}_${mainProductId}`;
            if (is) {
                Taro.navigateTo({
                    url: `/pages/order/pages/product/detail?id=${item.id}&pid=${mainProductId}`
                });
            }
        });
    }
    onAddBuyItemClick = (mainProduct, preOrderId, mainProductId, item) => {
        const subItem = mainProduct.merge_products.find((obj) => obj.product.id == item.id)
        if (item.checked) {

            Taro.showLoading({title: "处理中..."})
            const {data} = this.state;
            api("app.order_temp/delproduct", {
                prepay_id: data.prepay_id,
                pre_order_id: preOrderId,
                product_id: mainProductId,
                merge_product_id: subItem.id
            }).then((res) => {
                Taro.hideLoading();
                this.setState({
                    data: this.handleData(res)
                })
            }).catch((e) => {
                console.log("删除加购失败", e);
                Taro.hideLoading();
                Taro.showToast({
                    title: "出了一点小问题，请稍后再试!",
                    icon: "none",
                    duration: 2000
                })
            })
        } else {
            if (item.sku == null || item.sku == "") {
                const {data} = this.state;
                setTempDataContainer(`${item.id}_${mainProductId}`,{
                    prepay_id:data.prepay_id,
                    pre_order_id:preOrderId,
                    product_id:mainProductId,
                    mainProduct:mainProduct,
                    currentAddBuyItem:item,
                    hasOldSku:item.sku != null ?true:false,
                    selectSku:subItem && subItem.sku ? subItem.sku : null
                },(is)=>{
                    if (is) {
                        this.tempContainerKey = `${item.id}_${mainProductId}`;
                        Taro.navigateTo({
                            url: `/pages/order/pages/product/detail?id=${item.id}&pid=${mainProductId}`
                        });
                    }
                });

            } else {
                this.addBuyProduct(preOrderId, mainProductId, item.sku.id, 1);
                // {
                //     prepay_id:data.prepay_id,
                //     pre_order_id:preOrderId,
                //     product_id:mainProductId,
                //     sku_id:item.sku.id,
                //     quantity:1
                // }
            }
        }
    }
    addBuyProduct = (preOrderId, mainProductId, sku_id, quantity) => {
        console.log(preOrderId, mainProductId, sku_id, quantity)
        Taro.showLoading({title: "处理中..."})
        const {data} = this.state;
        api("app.order_temp/product", {
            prepay_id: data.prepay_id,
            pre_order_id: preOrderId,
            product_id: mainProductId,
            sku_id,
            quantity
        }).then((res) => {
            Taro.hideLoading();
            this.setState({
                data: this.handleData(res)
            })
        }).catch((e) => {
            console.log("加购失败", e);
            Taro.hideLoading();
            Taro.showToast({
                title: "出了一点小问题，请稍后再试!",
                icon: "none",
                duration: 2000
            })
        })
    }
    onAddBuyItemCounterChange = (total, mainProduct, preOrderId, item) => {
        const subItem = mainProduct.merge_products.find((obj) => obj.product.id == item.id);
        const {data} = this.state;
        this.onCounterChange(total, data.prepay_id, preOrderId, subItem);
    }

    render() {
        const {showTickedModal, showPayWayModal, data, tickets, usedTickets, order_sn, centerPartyHeight} = this.state;
        const {address} = templateStore;
        // @ts-ignore
        return (
            <View className='confirm'>
                <LoginModal/>
                {/* @ts-ignore */}
                <View className='nav-bar' style={fixStatusBarHeight()}>
                    <View className='left' onClick={() => {
                        Taro.navigateBack();
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314'/>
                    </View>
                    <View className='center'>
                        <Text className='title'>确认订单</Text>
                    </View>
                </View>
                <ScrollView enableFlex scrollY
                            style={deviceInfo.env === 'h5' ? "flex:1" : `height:${centerPartyHeight}px`}>
                    {
                        address ? <View className='address-part-has' onClick={() => {
                            Taro.navigateTo({
                                url: `/pages/me/pages/me/address/index?t=select&id=${address.id}`
                            })
                        }}>
                            <Image src={require('../../../../source/addressBackground.png')} className='backimg'/>
                            <View className='address'>
                                <View className='icon'><IconFont name='20_dingwei' size={40} color='#FF4966'/></View>
                                <View className='info'>
                                    <View className='youi'>
                                        <Text className='name'>{address.contactor_name}</Text>
                                        <Text className='phone'>{address.phone}</Text>
                                    </View>
                                    <Text className='details'>{address.address}</Text>
                                </View>
                                <View className='right'><IconFont name='20_xiayiye' size={40} color='#9C9DA6'/></View>
                            </View>
                        </View> : <View className='address-part' onClick={() => {
                            Taro.navigateTo({
                                url: '/pages/me/pages/me/address/index?t=select'
                            })
                        }}>
                            <Text className='title'>选择收货地址</Text>
                            <IconFont name='20_xiayiye' size={40} color='#9C9DA6'/>
                        </View>
                    }

                    {
                        data.orders && data.orders.map((item) => (
                            <View key={item.pre_order_id}>
                                <View className='goods-info'>
                                    <View className='title'>
                                        <Text className='txt'>商品信息</Text>
                                        {/* <IconFont name='20_xiayiye' size={40} color='#9C9DA6'/> */}
                                    </View>
                                    {
                                        item.products.map((product) => (
                                            <View className='info' key={product.id}>
                                                <View className='pre-image'>
                                                    <Image src={ossUrl(product.product.thumb_image, 0)} className='img'
                                                           mode='aspectFill'/>
                                                    <View className='big'><IconFont name='20_fangdayulan'
                                                                                    size={40}/></View>
                                                </View>
                                                <View className='center'>
                                                    <Text className='name'>{product.product.title}</Text>
                                                    <Text className='params'>规格：{product.sku.value.join("/")}</Text>
                                                </View>
                                                <View className='right'>
                                                    <View className='price'>
                                                        <Text className='sym'>¥</Text>
                                                        <Text className='num'>{product.price}</Text>
                                                    </View>
                                                    {
                                                        this.isPhoto ? <Text>{parseInt(product.quantity)}</Text> :
                                                            <Counter num={parseInt(product.quantity)}
                                                                     onButtonClick={(e) => {
                                                                         this.onCounterChange(e, data.prepay_id, item.pre_order_id, product);
                                                                     }}/>
                                                    }

                                                </View>
                                            </View>
                                        ))
                                    }
                                    {
                                        item.products.length == 1 && item.merge_products.length > 0 ?
                                            <View className='add_buy'>
                                                <View className='add_buy_title'>
                                                    <View className='line'>
                                                        <Image className='ygyp'
                                                               src={require("../../../../source/ygyp.svg")}/>
                                                        <Text
                                                            className='adv'>{item.merge_discount_list[item.merge_discount_rule]}</Text>
                                                        {
                                                            parseInt(item.merge_discount_price + "") > 0 ? <Text
                                                                className='tip'>{`（已优惠${item.merge_discount_price}元）`}</Text> : null
                                                        }

                                                    </View>
                                                </View>
                                                <View className='add_buy_container'>
                                                    {
                                                        item.merge_products.map((addbuyItem, index) => (
                                                            <AddBuy key={addbuyItem.id} mainProducts={item.products[0]}
                                                                    product={addbuyItem} isChecked={addbuyItem.checked}
                                                                    onItemClick={() => this.onAddBuyItemClick(item.products[0], item.pre_order_id, item.products[0].id, addbuyItem)}
                                                                    onCounterChange={(n) => this.onAddBuyItemCounterChange(n, item.products[0], item.pre_order_id, addbuyItem)}
                                                                    onDetailClick={() => this.onAddBuyItemDetailClick(item.products[0], item.pre_order_id, item.products[0].id, addbuyItem)}/>
                                                        ))
                                                    }
                                                </View>
                                            </View> : null
                                    }
                                </View>
                                <View className='product_price'>
                                    <View className='goods-item'>
                                        <Text className='title'>商品金额</Text>
                                        <View className='price'>
                                            <Text className='sym'>¥</Text>
                                            <Text className='num'>{item.products_price}</Text>
                                        </View>
                                    </View>
                                    {
                                        parseInt(item.merge_discount_price + "") > 0 ?
                                            <View className="add_buy_discount">
                                                <View className='add_buy_name'>
                                                    <Text className='txt'>加购减免</Text>
                                                </View>
                                                <View className='price'>
                                                    <Text className='sym'>-¥</Text>
                                                    <Text className='num'>{item.merge_discount_price}</Text>
                                                </View>
                                            </View> : null
                                    }

                                </View>
                                <View className='goods-item' onClick={() => this.onGoodsItemClick(item, usedTickets)}>
                                    <Text className='title'>优惠券</Text>
                                    {
                                        item.use_coupon
                                            ? <View className='right'>
                                                <View className='tt'>
                                                    <Text className='n'>
                                                        {/* @ts-ignore */}
                                                        - ￥{item.use_coupon.coupon.money}
                                                    </Text>
                                                </View>
                                                <IconFont name='20_xiayiye' size={40} color='#9C9DA6'/>
                                            </View> : (item.usable_discounts.filter(obj => !usedTickets.some(obj1 => obj1.ticketId == obj.id && obj1.orderId != item.pre_order_id)).length == 0
                                            ? <View className='right'>
                                                <Text className='txt'>无优惠券可用</Text>
                                                <IconFont name='20_xiayiye' size={40} color='#9C9DA6'/>
                                            </View>
                                            : <View className='right'>
                                                <View className='tt'>
                                                    <Text className='has'>有</Text>
                                                    <Text
                                                        className='n'>{item.usable_discounts.filter(obj => !usedTickets.some(obj1 => obj1.ticketId == obj.id && obj1.orderId != item.pre_order_id)).length}</Text>
                                                    <Text>张优惠券可用</Text>
                                                </View>
                                                <IconFont name='20_xiayiye' size={40} color='#9C9DA6'/>
                                            </View>)
                                    }
                                </View>
                                {/* <View className='goods-item'>
                                <Text className='title'>积分</Text>
                                <View className='right'>
                                    <Text className='txt'>无积分可用</Text>
                                </View>
                            </View> */}
                                <View className='goods-item'>
                                    <Text className='title'>运费</Text>
                                    <View className='price'>
                                        <Text className='sym'>¥</Text>
                                        <Text
                                            className='num'>{parseFloat(item.delivery_price + "") > 0 ? parseFloat(item.delivery_price + "").toFixed(2) : "00.00"}</Text>
                                    </View>
                                </View>
                                <View className='goods-item'>
                                    <Text className='title'>小计</Text>
                                    <View className='price red'>
                                        <Text className='sym'>¥</Text>
                                        <Text
                                            className='num'>{parseFloat(item.order_price + "") > 0 ? parseFloat(item.order_price + "").toFixed(2) : "00.00"}</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    }
                </ScrollView>
                <View className='bottom'>
                    <View className='main'>
                        <View className='left'>
                            <Text className='title'>合计：</Text>
                            <View className='price'>
                                <Text className='sym'>¥</Text>
                                <Text
                                    className='num'>{parseFloat(data.order_price + "") > 0 ? parseFloat(data.order_price + "").toFixed(2) : "00.00"}</Text>
                            </View>
                        </View>
                        {
                            address ? <Button className='submit-order-btn submit-order-active'
                                              onClick={this.onSubmitOrder}>提交订单</Button> :
                                <Button className='submit-order-btn' onClick={() => {
                                    Taro.showToast({
                                        title: '请选择地址!',
                                        icon: 'none',
                                        duration: 1500
                                    })
                                }}>提交订单</Button>
                        }
                    </View>
                </View>
                {
                    showTickedModal
                        ? <FloatModal title='优惠卷' isShow={showTickedModal}
                                      onClose={() => this.setState({showTickedModal: false})}>
                            <ScrollView scrollY>
                                <View className='yhlist'>
                                    {
                                        tickets.map((value: any, index) => (
                                            <Ticket key={index + ""}
                                                    isSelected={value.checked}
                                                    ticket={value.coupon}
                                                    onChange={() => this.onSelectTicket(tickets, value.id)}/>
                                        ))
                                    }
                                </View>
                            </ScrollView>
                            <View className='yh_ops'>
                                <Button className='use-btn' onClick={() => {
                                    this.onTicketUsed(data.prepay_id)
                                }}>使用</Button>
                            </View>
                        </FloatModal>
                        : null
                }
                <PayWayModal
                    isShow={showPayWayModal}
                    totalPrice={parseFloat(data.order_price + "") > 0 ? parseFloat(data.order_price + "").toFixed(2) : "0.00"}
                    order_sn={order_sn}
                    onResult={this.onResult}
                    onClose={() => {
                        this.setState({
                            showPayWayModal: false
                        });
                        if (deviceInfo.env == 'h5') {
                            window.history.replaceState(null, null, '/pages/tabbar/me/me');
                        }
                        Taro.getApp().tab = 1;
                        Taro.switchTab({
                            url: '/pages/tabbar/order/order?tab=1'
                        })
                    }}/>
            </View>
        )
    }
}


