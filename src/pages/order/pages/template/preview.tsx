import Taro, {Component, Config} from '@tarojs/taro'
import {Button, Image, Text, View} from '@tarojs/components'
import './preview.less';
import IconFont from '../../../../components/iconfont';
import {api, getToken} from '../../../../utils/net'
import {inject, observer} from '@tarojs/mobx';
import isEmpty from 'lodash/isEmpty';
import PlaceOrder from '../../../../components/place/place';
import {userStore} from "../../../../store/user";
import {
    debuglog,
    deviceInfo,
    fixStatusBarHeight,
    getTempDataContainer,
    getURLParamsStr,
    jumpOrderConfimPreview,
    notNull, setPageTitle,
    updateChannelCode,
    urlEncode
} from '../../../../utils/common';
import LoginModal from '../../../../components/login/loginModal';
import page from '../../../../utils/ext'


let editorProxy: WindowProxy | null | undefined;

export const sendMessage: { (type: string, data: any): void } = (type, data) => {
    editorProxy && editorProxy.postMessage({from: "parent", type: type, data: data}, "*");
}

let rpcId = 0;
const rpcList = {}

function callEditor(name, ...args) {
    return new Promise((resolve, reject) => {
        rpcId++;
        const id = rpcId;
        rpcList[id] = [resolve, reject];
        sendMessage("_req", {
            id: rpcId,
            fun: name,
            args: args
        });
    });
}


@inject("templateStore")
@observer
@page({
    share: true
})
export default class Preview extends Component<any, {
    placeOrderShow: boolean;
    workId: number;
    productInfo: any;
    buyTotal: number;
    sku: any;
    modalId: number;
    isOpened: boolean,
    workInfo: any,
    doc: any,
    defalutSelectIds: Array<any>,
    selectSkuId: number
}> {

    config: Config = {
        navigationBarTitleText: '预览'
    }

    constructor(props) {
        super(props);
        this.state = {
            placeOrderShow: false,
            workId: 0,
            productInfo: {},
            buyTotal: 1,
            sku: {},
            isOpened: false,
            modalId: 0,
            workInfo: {},
            doc: {},
            defalutSelectIds: [],
            selectSkuId: 0
        }
    }

    componentDidMount() {
        setPageTitle("预览")
        // else {
        //     editorProxy = document.querySelector<HTMLIFrameElement>(".editor_frame").contentWindow;
        //     window.addEventListener("message", this.onMsg);
        // }
    }

    componentDidShow() {
        const {workid} = this.$router.params;
        if (workid && parseInt(workid) > 0) {
            this.getWorkInfo(workid);
            this.setState({
                workId: parseInt(workid)
            })
        }
        // if (userStore.isLogin) {
        //     setTempDataContainer("product_preview_sku", null);
        // }
    }

    getWorkInfo = (id) => {
        const par = this.$router;
        Taro.showLoading({title: "加载中..."});
        api("editor.user_tpl/info", {
            id
        }).then((res) => {
            Taro.hideLoading();
            console.log("预览页面作品信息",res);
            // this.initModalShow = true
            if (deviceInfo.env == 'h5') {
                const str = getURLParamsStr(urlEncode({
                    ...par.params,
                    workid: res.id,
                }))
                window.history.replaceState(null, null, updateChannelCode(`/pages/order/pages/template/preview?${str}`));
            }
            this.getShellInfo();
            this.setState({
                workInfo: res
            })
        }).catch((e) => {
            Taro.hideLoading();
            Taro.showToast({
                title: e,
                icon: 'none',
                duration: 1500
            });
            setTimeout(() => {
                Taro.switchTab({
                    url: updateChannelCode('/pages/tabbar/index/index')
                })
            }, 1500);
        })
    }

    _res = (data) => {
        const {id, res, err} = data.data;
        if (rpcList[id]) {
            const rpc = rpcList[id];
            delete rpcList[id];
            if (err) {
                rpc[1](err);
            } else {
                rpc[0](res);
            }
        }
    }


    onMsg: { (e: MessageEvent): void } = async ({data}) => {
        debuglog("msg", data);
        if (!data) {
            return;
        }
        if (data.from == "editor") {
            switch (data.type) {
                case "_req":
                    const {id, fun, args} = data.data;

                    if (this[`rpc_${fun}`]) {
                        try {
                            const res = await this[`rpc_${fun}`](...args)
                            sendMessage("_res", {
                                id,
                                res
                            });
                        } catch (err) {
                            sendMessage("_res", {
                                id,
                                err
                            });
                        }
                    } else {
                        sendMessage("_res", {
                            id,
                            err: "func not found"
                        });
                    }
                    return;

                case "_res":
                    this._res(data);
                    return;

                case "onLoadEmpty":
                    const {doc, docId, modelId} = Taro.getStorageSync("doc_draft");
                    // const {doc_id} = this.$router.params;
                    if (parseInt(docId + "") > 0) {
                        window.history.replaceState(null, null, updateChannelCode(`/pages/order/pages/template/preview?workid=${docId}`));
                    }
                    this.setState({
                        workId: parseInt(docId + "") >= 0 ? docId : 0,
                        modalId: modelId,
                        doc
                    });
                    callEditor("setDoc", doc);

                    // callEditor("loadDraft")
                    break;

                case "onload":

                case "mainSize":
                    // this.setEditorSize(data.data);
                    break;

                case "selected":
                    break;
            }
        }
    }


    onPlaceOrderClose = () => {
        this.setState({
            placeOrderShow: false
        });
    }

    onSave = (_, callback?: () => void) => {
        const {doc} = Taro.getStorageSync("doc_draft");
        Taro.showLoading({title: "保存中"});
        api("editor.user_tpl/add", {
            doc: JSON.stringify(doc),

        }).then((res) => {
            this.setState({
                workId: res.id
            })
            Taro.hideLoading();
            window.history.replaceState(null, null, updateChannelCode(`/pages/order/pages/template/preview?workid=${res.id}`))
            Taro.showToast({
                title: "保存成功",
                icon: "success",
                duration: 2000
            })

            callback && callback();
            // debuglog("api-----",res);
        }).catch((e) => {
            Taro.hideLoading();
            debuglog(e);
            Taro.showToast({
                title: e,
                icon: "none",
                duration: 2000
            });
        })
    }
    getShellInfo = () => {
        api('app.product/info', {
            id: 30
        }).then((res) => {
            getTempDataContainer("product_preview_sku", (val) => {

                if (val && val.sku.length > 0) {
                    let ids: Array<any> = val.sku;
                    ids = ids.map((item) => item + "")
                    res.attrItems = res.attrItems.map((item) => {
                        return item.filter((val) => {
                            return ids.indexOf(val.id + "") != -1
                        })
                    });
                    this.setState({
                        productInfo: res,
                        defalutSelectIds: ids
                    });
                } else {
                    this.setState({
                        productInfo: res
                    })
                }
            })


        })
    }
    onEditor = () => {
        const {workId, workInfo, doc} = this.state;
        debuglog(workId, workInfo)
        if (deviceInfo.env === "h5") {
            const str = getURLParamsStr(urlEncode({
                id: workInfo.id && workInfo.id || workId,
                cid: workInfo.category_id && workInfo.category_id || doc.cid,
                edited: "t"
            }))
            window.location.replace(updateChannelCode(`/pages/editor/pages/shell?${str}`));
        } else {
            Taro.getApp().finishId = workInfo.id && workInfo.id || workId;
            Taro.navigateBack()
        }
    }

    onOrderIng = () => {
        const {isLogin} = userStore;
        if (isLogin) {
            this.setState({
                placeOrderShow: true
            })
        } else {
            userStore.showLoginModal = true;
        }
    }

    getUrl = () => {
        return process.env.NODE_ENV == 'production'
            ? `/editor/mobile?token=${getToken()}&tpl_id=0&readonly=1`
            : `/editor/mobile?token=${getToken()}&tpl_id=0&readonly=1`
    }

    onBack = async () => {
        const {workId, workInfo, doc} = this.state;
        const {self} = this.$router.params;
        const workid = workInfo && workInfo.id ? workInfo.id : workId;

        if (!notNull(self) && self === "t") {
            Taro.navigateBack()
            return
        }
        let uri = '/pages/editor/pages/shell';
        if (workId) {
            const str = getURLParamsStr(urlEncode({
                id: workInfo.id && workInfo.id || workId,
                cid: workInfo.category_id && workInfo.category_id || doc.cid,
                edited: "t"
            }))
            uri = updateChannelCode(`/pages/editor/pages/shell?${str}`);
        }
        if (deviceInfo.env == 'h5') {
            window.location.replace(updateChannelCode(uri));
        } else {
            Taro.getApp().finishId = workid;
            Taro.navigateBack()
        }
    }

    render() {
        const {placeOrderShow, workId, productInfo, workInfo, defalutSelectIds} = this.state;
        const workid = workInfo && workInfo.id ? workInfo.id : workId;

        return (
            <View className='preview'>
                <LoginModal isTabbar={false} />
                <View className='nav-bar' style={fixStatusBarHeight()}>
                    <View className='left' onClick={this.onBack}>
                        <IconFont name='24_shangyiye' size={48} color='#121314'/>
                    </View>
                    <View className='center'>
                        <Text className='title'>预览</Text>
                    </View>
                </View>
                <View className='container'>
                    {
                        workid
                            ? <Image src={workInfo.thumb_image} style="width:230px;height: 478.664px;"/>
                            : <iframe className="editor_frame" src={this.getUrl()} width="100%" height="100%"/>
                    }
                </View>
                <View className='bottom'>
                    {
                        parseInt(workId + "") > 0 || parseInt(workid + "") > 0
                            ? <View className='editor' onClick={this.onEditor}>
                                <IconFont name='24_qubianji' size={48} color='#707177'/>
                                <Text className='txt'>编辑</Text>
                            </View>
                            : <View className='editor' onClick={this.onSave}>
                                <IconFont name='24_qubaocun' size={48} color='#707177'/>
                                <Text className='txt'>保存</Text>
                            </View>
                    }
                    <Button className='noworder' onClick={this.onOrderIng}>立即下单</Button>
                </View>
                <PlaceOrder data={productInfo} isShow={placeOrderShow} defaultSelectIds={defalutSelectIds}
                            onClose={this.onPlaceOrderClose}
                            onBuyNumberChange={(n) => {
                                this.setState({
                                    buyTotal: n
                                })
                            }} onAddCart={() => {
                    const {buyTotal, sku, workId, modalId, selectSkuId} = this.state;
                    if (!isEmpty(sku) && Number(selectSkuId) > 0) {
                        Taro.showLoading({title: "加载中"})
                        api("app.cart/add", {
                            sku_id: selectSkuId,
                            user_tpl_id: workId,
                            phone_model_id: workInfo.phone_model_id,
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
                    const {buyTotal, sku, workId, modalId, selectSkuId} = this.state;
                    if (!isEmpty(sku) && Number(selectSkuId) > 0) {
                        // this.initModalShow = false;
                        this.setState({
                            placeOrderShow: false
                        })
                        jumpOrderConfimPreview({
                            skuid: selectSkuId,
                            total: buyTotal,
                            tplid: workId,
                            model: workInfo.phone_model_id
                        })
                    } else {
                        Taro.showToast({
                            title: "请选择规格!",
                            icon: "none",
                            duration: 2000
                        });
                    }
                }} onSkuChange={(sku, id) => {
                    this.setState({
                        sku: sku,
                        selectSkuId: parseInt(id + "")
                    })
                }}/>
            </View>
        )
    }
}
