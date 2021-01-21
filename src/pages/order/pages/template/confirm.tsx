import Taro, {Component, Config} from '@tarojs/taro'
import {Button, Image, Input, ScrollView, Text, View} from '@tarojs/components'
import './confirm.less';
import IconFont from '../../../../components/iconfont';
import {api,options} from '../../../../utils/net'
import {templateStore} from '../../../../store/template';
import {userStore} from '../../../../store/user';
import {inject, observer} from '@tarojs/mobx';
import isEmpty from 'lodash/isEmpty';
import Counter from '../../../../components/counter/counter';
import FloatModal from '../../../../components/floatModal/FloatModal';
import Ticket from '../../../../components/ticket/Ticket';
import {
    addOrderConfimPreviewData, debuglog,
    deviceInfo,
    fixStatusBarHeight,
    getOrderConfimPreviewData,
    getTempDataContainer,
    isEmptyX,
    jumpUri,
    ossUrl,
    setTempDataContainer, updateChannelCode,
} from '../../../../utils/common';
import {Base64} from 'js-base64';
import PayWayModal from '../../../../components/payway/PayWayModal';
import AddBuy from '../../../../components/addbuy/addbuy';
import LoginModal from '../../../../components/login/loginModal';
import {observe} from 'mobx';
import photoStore from "../../../../store/photo";
import Fragment from '../../../../components/Fragment';
import page from '../../../../utils/ext'

@inject("userStore", "templateStore")
@observer
@page({
    share:true
})
export default class Confirm extends Component<any, {
    showTickedModal: boolean;
    showPayWayModal: boolean;

    data: any;
    tickets: Array<any>,
    ticketId: number | string | null,
    usedTicket: boolean,
    currentTicketOrderId: string,
    currentOrderTicketId: number,
    usedTickets: Array<any>
    order_sn: string;
    payStatus: number,
    orderid: string,
    centerPartyHeight: number;
    orderMessages:any
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
            centerPartyHeight: 500,
            orderMessages:{}
        }
    }

    // 是否从照片冲印跳转过来
    private isPhoto: boolean = false;
    private tempContainerKey = "";
    private initPayWayModal = false;
    componentDidMount() {
        if (process.env.TARO_ENV == "h5") {
            document.title = this.config.navigationBarTitleText || "确认订单";
        }
        if (userStore.isLogin) {
            setTempDataContainer("product_preview_sku",null);
        }
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
        if (userStore.isLogin) {
            this.initData();
        }
    }
    private unixOrder:any = ""
    initData = () => {
        Taro.showLoading({title: "加载中"});
        const {order}: any = this.$router.params;
        this.unixOrder = order;
        getOrderConfimPreviewData(this.unixOrder,async (resp,has)=>{
            if (has) {
                if (resp.orderid) {
                    this.checkOrder(resp.orderid);
                } else {
                    const {page, skuid, total}: any = resp;
                    this.isPhoto = page && page === "photo";
                    let params: any = {};
                    if (this.isPhoto) {
                        try {
                            await photoStore.getServerParams({setLocal: true});
                            params = JSON.parse(JSON.stringify(photoStore.photoProcessParams.changeUrlParams));
                            params = photoStore.photoProcessParams.changeUrlParams
                            Object.assign(params,resp)
                        } catch (e) {
                            debuglog("读取参数出错：", e)

                        }
                    } else {
                        params = resp
                    }
                    const {tplid, model, cartIds, parintImges}: any = params;
                    let data: any = {
                        sku_id: skuid,
                        quantity: total,
                        user_tpl_id: this.isPhoto ? -1 : (tplid?tplid:0),
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
                        data = {
                            ...data,
                            print_images: JSON.stringify(parintImges),
                            crop: params.crop
                        }
                    }
                    api("app.order_temp/add", data).then((res) => {
                        this.initPayWayModal = true;
                        Taro.getApp().finishId = null;
                        Taro.hideLoading();
                        if (resp && isEmptyX(resp.orderid)) {
                            Object.assign(resp,{
                                orderid:res.prepay_id,
                                disableAddressId:isEmptyX(res.address) && !isEmptyX(data["address_id"]) ? data["address_id"]:0
                            })
                        }

                        Object.assign(resp,{addressId:res.address && res.address.id?res.address.id:0});
                        addOrderConfimPreviewData(this.unixOrder,resp)
                        // this.filterUsedTicket(res.orders);
                        templateStore.address = res.data;
                        this.setState({
                            data: this.handleData(res),
                            orderid: res.prepay_id
                        });
                        this.autoSelectTicket(res);
                        if (parseInt(data["address_id"]+"") > 0 && !isEmptyX(data["address_id"]) && data["address_id"] == userStore.address.id && res.address == null && !res.delivery) {
                            Taro.showToast({
                                title:"默认收货地址无法配送,请重新选择",
                                icon:"none",
                                duration:2000
                            });
                        }
                    }).catch((e) => {
                        Taro.hideLoading();
                        Taro.showToast({
                            title: e,
                            icon: "none",
                            duration: 2000
                        });
                        setTimeout(() => {
                            if (Taro.getCurrentPages().length>0) {
                                Taro.navigateBack();
                            } else {
                                if (deviceInfo.env == "h5") {
                                    window.location.href = updateChannelCode("/pages/tabbar/index/index")
                                } else {
                                    Taro.switchTab({
                                        url: updateChannelCode('/pages/tabbar/index/index')
                                    });
                                }
                            }
                        }, 2000);
                    })
                }
            } else {
                Taro.hideLoading();
                Taro.showToast({
                    title:"订单已超时，请重新下单！",
                    icon:"none",
                    duration:1500
                });
                setTimeout(() => {
                    if (Taro.getCurrentPages().length>1) {
                        Taro.navigateBack();
                    } else {
                        jumpUri("/pages/tabbar/index/index",true)
                    }
                }, 1500);
            }

        })

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
                        if (isSelectItem.length == 1) {
                            console.log("选择的加购",product,isSelectItem)
                            product["checked"] = true;
                        }
                    }
                }
            }
        }
        return temp
    }

    componentDidShow() {
        const {order}: any = this.$router.params;
        this.unixOrder = order;
        if (isEmptyX(order)) {
            Taro.showToast({
                title:'参数错误，请稍后再试!',
                icon:'none',
                duration:1500
            });
            setTimeout(() => {
                if (Taro.getCurrentPages().length>1) {
                    Taro.navigateBack();
                } else {
                    jumpUri("/pages/tabbar/index/index",true)
                }
            }, 1500);
            return;
        }
        getOrderConfimPreviewData(this.unixOrder,async (resp,has)=>{
            if (has) {
                const {page} = resp;
                if (page) {
                    this.isPhoto = resp.page && resp.page === "photo";
                }
                const {data: {address}} = this.state;
                if (this.tempContainerKey != "") {
                    getTempDataContainer(this.tempContainerKey, (value) => {
                        if (value != null && value != undefined && value) {
                            const currentAddBuyItem = value.currentAddBuyItem
                            debuglog("加购回来的参数",value)
                            if (value.isOk) {
                                if (currentAddBuyItem.checked == false) {
                                    this.addBuyProduct(value.pre_order_id, value.product_id, value.selectSkuId, value.buyTotal);
                                }else{
                                    const temp = value.mainProduct.merge_products.filter((item)=>{
                                        return item.product.id == currentAddBuyItem.id
                                    })
                                    debuglog("temp",temp)
                                    this.delBuyProduct(value.prepay_id,value.pre_order_id,value.product_id,temp[0].id,()=>{
                                        this.addBuyProduct(value.pre_order_id, value.product_id, value.selectSkuId, value.buyTotal);
                                    });
                                }
                            }

                        }
                        setTempDataContainer(this.tempContainerKey,null);
                    })
                }
                if (!isEmpty(address) && !isEmpty(templateStore.address)) {
                    if (address.id == templateStore.address.id) {
                        return;
                    }
                }
                const {orderid} = resp;
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
                        Object.assign(resp,{addressId:res.address && res.address.id?res.address.id:0});
                        addOrderConfimPreviewData(this.unixOrder,resp)
                        this.filterUsedTicket(res.orders)
                        this.setState({
                            data: this.handleData(res)
                        })
                        if (res.address == null && !res.delivery) {
                            Taro.showToast({
                                title:"当前收货地址无法配送,请重新选择",
                                icon:"none",
                                duration:2000
                            });
                        }
                    }).catch((e) => {
                        debuglog(e);
                    })
                }
            } else {
                Taro.hideLoading();
                Taro.showToast({
                    title:"订单已超时，请重新下单！",
                    icon:"none",
                    duration:1500
                });
                setTimeout(() => {
                    if (Taro.getCurrentPages().length>1) {
                        Taro.navigateBack();
                    } else {
                        jumpUri("/pages/tabbar/index/index",true)
                    }

                }, 1500);
            }
        })
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
            this.initPayWayModal = true;
            this.filterUsedTicket(res.orders);
            templateStore.address = res.address;
            debuglog(res);
            this.setState({
                data: this.handleData(res),
                // showPayWayModal:isInfo?false:true
            });
        }).catch(e => {

            Taro.hideLoading();
            setTimeout(() => {
                Taro.getApp().tab = 1;
                if (deviceInfo.env == 'h5') {
                    window.history.replaceState(null, null, updateChannelCode('/pages/tabbar/me/me'));
                    window.location.href = updateChannelCode('/pages/tabbar/order/order?tab=1');
                }else{
                    Taro.switchTab({
                        url: updateChannelCode('/pages/tabbar/order/order?tab=1')
                    });
                }
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
    /**
     * 推荐选中优惠券
     * @param {*}
     * @return {*}
     */
    autoSelectTicket = (res) => {
        const {orders,prepay_id} = res;
        const used_Tickets = [];
        orders.forEach(element => {
            let tid = 0;
            if (isEmptyX(element.use_coupon) && !isEmptyX(element.usable_discounts) && element.usable_discounts.length>0) {
                const discounts:Array<any> = element.usable_discounts.filter(obj => !used_Tickets.some(obj1 => obj1.ticketId == obj.id && obj1.orderId != element.pre_order_id));
                const tmp = JSON.parse(JSON.stringify(discounts));
                tmp.sort((a,b)=>parseFloat(a.coupon.money)-parseFloat(b.coupon.money));
                if (tmp.length>0) {
                    if (tmp.length == 1) {
                        tid = tmp[0].id
                    } else {
                        if (parseFloat(tmp[0].coupon.money) == parseFloat(tmp[tmp.length - 1].coupon.money)) {
                            tmp.sort((a,b)=>parseInt(a.use_end_time)-parseInt(b.use_end_time));
                            if (parseInt(tmp[0].use_end_time) == parseInt(tmp[tmp.length - 1].use_end_time)) {
                                tmp.sort((a,b)=>parseInt(a.id)-parseInt(b.id));
                                tid = tmp[0].id
                            } else {
                                tid = tmp[0].id
                            }
                        } else {
                            tid = tmp[tmp.length - 1].id;
                        }
                    }
                }

            }
            if (parseInt(tid+"")>0) {
                const t = {
                    orderId: element.pre_order_id,
                    ticketId: tid
                }
                used_Tickets.push(t);

                this.useTicket(prepay_id,element.pre_order_id,tid);
            }
        });
        this.setState({
            usedTickets: used_Tickets
        }) 

    }
    onSubmitOrder = () => {
        // this.setState({
        //     showPayWayModal:true
        // })
        this.initPayWayModal = true;
        const {data,orderMessages} = this.state;
        // this.checkOrder(data.prepay_id,false);
        Taro.showLoading({title: '加载中...'})
        api('app.order/add', {
            prepay_id: data.prepay_id,
            remarks: isEmptyX(orderMessages)?"":JSON.stringify(orderMessages)
        }).then((res) => {
            debuglog("ccc",res);
            Taro.hideLoading();
            if (res.status > 0) {
                Taro.navigateTo({
                    url: updateChannelCode(`/pages/order/pages/template/success?status=${Base64.encodeURI(res.order_sn + "-" + "0")}&pay_order_sn=${res.order_sn}`)
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
                window.history.replaceState(null, null, updateChannelCode('/pages/tabbar/me/me'));
                Taro.getApp().tab = 1;
                if (deviceInfo.env == 'h5') {
                    window.location.href = updateChannelCode('/pages/tabbar/order/order?tab=1')
                } else {
                    Taro.switchTab({
                        url: updateChannelCode('/pages/tabbar/order/order?tab=1')
                    })
                }

            }, 2000);
            Taro.showToast({
                title: e,
                duration: 2000,
                icon: "none"
            });

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
                    Taro.switchTab({
                        url: updateChannelCode('/pages/tabbar/index/index')
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

    onResult = (res) => {
        debuglog("支付订单号码:",res.data)
        this.setState({
            showPayWayModal: false,
        });
        let title = '';
        Taro.getApp().tab = 1;
        let url = '/pages/tabbar/order/order?tab=1';
        debuglog("支付订单号码:",res.data)

        switch (res.code) {
            case 1:
                title = '支付成功';
                url = deviceInfo.env == 'h5' ? `/pages/order/pages/template/success?pay_order_sn=${res.data}` : `/pages/order/pages/template/success?status=${Base64.encodeURI(res.data + "-" + "0")}&pay_order_sn=${res.data}`;
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
            if (res.code == 2 || res.code == 0) {
                if (process.env.TARO_ENV == 'h5') {
                    window.location.href = updateChannelCode(url);
                } else {
                    Taro.switchTab({
                        url: updateChannelCode(url)
                    });
                }

            } else {
                Taro.navigateTo({
                    url: updateChannelCode(url)
                })
            }
        }, 2000);
    }
    private ticketOnChangeCallBack:(id:number,state:boolean)=>void = undefined;
    private onUseTicketCallBack:()=>void = undefined;
    //点击商品优惠券
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
        const { data } = this.state;
        const {prepay_id} = data;
        let currentSelectId = 0;
        //优惠券选中回调
        this.ticketOnChangeCallBack = (id:number,state:boolean)=> {
            const tmpcounts = discounts.map((item) => {
                item["checked"] = false;
                if (id == item.id) {
                    item["checked"] = !state;
                }
                return item;
            });
            if(!state){
                currentSelectId = id;
            }
            this.setState({
                tickets: tmpcounts,
                // ticketId: Number(tId)
            })
        }
        //优惠券列表确定按钮回调
        this.onUseTicketCallBack = () => {
            if(ticketId == currentSelectId){
                this.setState({
                    showTickedModal: false
                });
                return;
            }
            this.useTicket(prepay_id,item.pre_order_id,currentSelectId)
            this.setState({
                showTickedModal: false
            })
        }

        this.setState({
            showTickedModal: true,
            tickets: discounts
        })
    }
    useTicket = (prepay_id,pre_order_id,currentSelectId,successCallBack?:()=>void) => {
        Taro.showLoading({title: "加载中"});
        api("app.order_temp/coupon", {
            prepay_id: prepay_id,
            pre_order_id: pre_order_id,
            usercoupon_id: currentSelectId
        }).then((res) => {
            Taro.hideLoading();
            successCallBack && successCallBack();
            this.filterUsedTicket(res.orders);
            this.setState({
                data: this.handleData(res)
            });
        }).catch((e) => {
            Taro.hideLoading();
            setTimeout(() => {
                Taro.switchTab({
                    url: updateChannelCode('/pages/tabbar/index/index')
                })
            }, 2000);
            Taro.showToast({
                title: e,
                icon: "none",
                duration: 2000
            })
        })
    }

    getAddBuyProduct = () => {

    }
    onAddBuyItemDetailClick = (mainProduct, preOrderId, mainProductId, item) => {
        debuglog("onAddBuyItemDetailClick")
        const {data} = this.state;
        const subItem = mainProduct.merge_products.find((obj) => obj.product.id == item.id);
        console.log("当前选的——————————",subItem)
        setTempDataContainer(`${item.id}_${mainProductId}`, {
            prepay_id: data.prepay_id,
            pre_order_id: preOrderId,
            product_id: mainProductId,
            mainProduct: mainProduct,
            currentAddBuyItem: item,
            hasOldSku: item.sku != null,
            selectSku: subItem && subItem.sku ? subItem.sku : item.sku
        }, (is) => {
            this.tempContainerKey = `${item.id}_${mainProductId}`;
            if (is) {
                Taro.navigateTo({
                    url: updateChannelCode(`/pages/order/pages/product/detail?id=${item.id}&pid=${mainProductId}`)
                });
            }
        });
    }
    delBuyProduct = (prepay_id,pre_order_id,product_id,merge_product_id,callback?:()=>void) => {
        Taro.showLoading({title: "处理中..."})
        // const {data} = this.state;
        api("app.order_temp/delproduct", {
            prepay_id,
            pre_order_id,
            product_id,
            merge_product_id
        }).then((res) => {
            Taro.hideLoading();
            if (callback) {
                callback();
            } else {
                this.setState({
                    data: this.handleData(res)
                });
            }
        }).catch((e) => {
            debuglog("删除加购失败", e);
            Taro.hideLoading();
            Taro.showToast({
                title: "出了一点小问题，请稍后再试!",
                icon: "none",
                duration: 2000
            })
        })
    }
    onAddBuyItemClick = (mainProduct, preOrderId, mainProductId, item) => {
        const subItem = mainProduct.merge_products.find((obj) => obj.product.id == item.id)
        if (item.checked) {
            const {data} = this.state;
            this.delBuyProduct(data.prepay_id,preOrderId,mainProductId,subItem.id)
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
                    selectSku:subItem && subItem.sku ? subItem.sku : null,
                },(is)=>{
                    if (is) {
                        this.tempContainerKey = `${item.id}_${mainProductId}`;

                        Taro.navigateTo({
                            url: updateChannelCode(`/pages/order/pages/product/detail?id=${item.id}&pid=${mainProductId}`)
                        })
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
        debuglog(preOrderId, mainProductId, sku_id, quantity)
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
            debuglog("加购失败", e);
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
        const {showTickedModal, showPayWayModal, data, tickets, usedTickets, order_sn, centerPartyHeight,orderMessages} = this.state;
        const {address} = data;
        debuglog("data数据",data)
        // @ts-ignore
        return (
            <View className='confirm'>
                <LoginModal/>
                {/* @ts-ignore */}
                <View className='nav-bar' style={fixStatusBarHeight()}>
                    <View className='left' onClick={() => {
                        if (Taro.getCurrentPages().length>1) {
                            Taro.navigateBack();
                        } else {
                            jumpUri("/pages/tabbar/index/index",true)
                        }
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
                                url: updateChannelCode(`/pages/me/pages/me/address/index?order=${this.unixOrder}`)
                            })
                        }}>
                            {/* <Image src={require('../../../../source/addressBackground.png')} className='backimg'/> */}
                            <View className='c_address'>
                                <View className='icon'><IconFont name='20_dingwei' size={40} color='#FF4966'/></View>
                                <View className='info'>
                                    <View className='youi'>
                                        <Text className='name'>{address.contactor_name}</Text>
                                        <Text className='phone'>{address.phone}</Text>
                                    </View>
                                    <Text className='details'>{address.area_text+address.address}</Text>
                                </View>
                                <View className='right'><IconFont name='20_xiayiye' size={40} color='#9C9DA6'/></View>
                            </View>
                            <Image src={`${options.sourceUrl}appsource/address_part.png`} className='address_line'/>
                        </View> : <View className='address-part' onClick={() => {
                            Taro.navigateTo({
                                url: updateChannelCode(`/pages/me/pages/me/address/index?order=${this.unixOrder}`)
                            })
                        }}>
                            <Text className='title'>选择收货地址</Text>
                            <IconFont name='20_xiayiye' size={40} color='#9C9DA6'/>
                        </View>
                    }

                    {
                        data.orders && data.orders.map((item) => (
                            <Fragment key={item.pre_order_id}>
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
                                                    <View className='big' onClick={()=>{
                                                        Taro.previewImage({
                                                            current:product.product.thumb_image,
                                                            urls:[product.product.thumb_image]
                                                        })
                                                    }}><IconFont name='20_fangdayulan'
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
                                                        this.isPhoto ? <Text className='nums_right'>x{parseInt(product.quantity)>0?parseInt(product.quantity):1}</Text> :
                                                            <Counter num={parseInt(product.quantity)>0?parseInt(product.quantity):1}
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
                                                               src={`${options.sourceUrl}appsource/ygyp.svg`}/>
                                                        <Text
                                                            className='adv'>{item.merge_discount_rule.value}</Text>
                                                        {
                                                            parseInt(item.merge_discount_price + "") > 0 ? <Text
                                                                className='tip'>{`（已优惠${item.merge_discount_price}元）`}</Text> : null
                                                        }

                                                    </View>
                                                </View>
                                                <View className='add_buy_container'>
                                                    {
                                                        item.merge_products.map((addbuyItem) => (
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
                                                    <Text className='txt'>{item.merge_discount_rule.value}</Text>
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
                                <View className='goods-item'>
                                    <Text className='title'>留言</Text>
                                    <Input type='text' className='order_message' placeholder="给商家留言" placeholderClass="order_message_placeholder" onInput={({detail:{value}})=>{
                                        orderMessages[item.pre_order_id] = value;
                                        this.setState({
                                            orderMessages:orderMessages
                                        });
                                    }}/>
                                </View>
                            </Fragment>
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
                                                    onChange={() => {
                                                        this.ticketOnChangeCallBack(value.id,value.checked);
                                                    }} hasCheckBox>
                                                        {/* <View ></View> */}
                                                    </Ticket>
                                        ))
                                    }
                                </View>
                            </ScrollView>
                            <View className='yh_ops'>
                                <Button className='use-btn' onClick={() => {
                                    this.onUseTicketCallBack();
                                }}>确定</Button>
                            </View>
                        </FloatModal>
                        : null
                }
                {
                    this.initPayWayModal
                        ? <PayWayModal
                            isShow={showPayWayModal}
                            totalPrice={parseFloat(data.order_price + "") > 0 ? parseFloat(data.order_price + "").toFixed(2) : "0.00"}
                            order_sn={order_sn}
                            onResult={this.onResult}
                            onClose={() => {
                                this.setState({
                                    showPayWayModal: false
                                });
                                if (deviceInfo.env == 'h5') {
                                    window.history.replaceState(null, null, updateChannelCode('/pages/tabbar/me/me'));
                                }
                                Taro.getApp().tab = 1;
                                Taro.switchTab({
                                    url: updateChannelCode('/pages/tabbar/order/order?tab=1')
                                })
                            }}/>
                        : null
                }
            </View>
        )
    }
}


