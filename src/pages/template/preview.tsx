import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Image, Button } from '@tarojs/components'
import './preview.less';
import IconFont from '../../components/iconfont';
import { api, getToken } from '../../utils/net'

// import {templateStore} from '../../store/template';
import { observer, inject } from '@tarojs/mobx';
// import { AtLoadMore } from 'taro-ui';
import lodash from 'lodash';
// import moment from 'moment';
// import {ossUrl} from '../../utils/common'
import { PlaceOrder } from './place';
import {userStore} from "../../store/user";
import {AtModal} from "taro-ui";


const pics = [
    "https://i.ibb.co/sK68FQ0/c6a8dc33e8a84646b4cdc30f5cea391efc8a141c2bef0-UJ8-MBJ.jpg",
    "https://i.ibb.co/n6Ky6bV/cfff57e742254d16d383aa0e580ca03baa37099fed129-PZBbzk-fw1200.jpg",
    "https://i.ibb.co/sK68FQ0/c6a8dc33e8a84646b4cdc30f5cea391efc8a141c2bef0-UJ8-MBJ.jpg",
    "https://i.ibb.co/n6Ky6bV/cfff57e742254d16d383aa0e580ca03baa37099fed129-PZBbzk-fw1200.jpg",
    "https://i.ibb.co/sK68FQ0/c6a8dc33e8a84646b4cdc30f5cea391efc8a141c2bef0-UJ8-MBJ.jpg",
    "https://i.ibb.co/n6Ky6bV/cfff57e742254d16d383aa0e580ca03baa37099fed129-PZBbzk-fw1200.jpg",
]



let editorProxy: WindowProxy | null | undefined;

export const sendMessage: { (type: string, data: any): void } = (type, data) => {
    editorProxy && editorProxy.postMessage({ from: "parent", type: type, data: data }, "*");
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
export default class Preview extends Component<{}, {
    placeOrderShow: boolean;
    saveId:number;
    productInfo:any;
    buyTotal:number;
    sku:any;
    modalId:number;
    isOpened: boolean
}> {

    config: Config = {
        navigationBarTitleText: '预览'
    }

    constructor(props) {
        super(props);
        this.state = {
            placeOrderShow: false,
            saveId: 0,
            productInfo: {},
            buyTotal:0,
            sku:{},
            isOpened: false,
            modalId:0
        }
    }
    componentDidMount() {
        const {doc_id,workID} = this.$router.params;
        console.log(workID)
        if (parseInt(doc_id)>0) {
            this.setState({
                saveId:parseInt(doc_id)
            })
        }
        editorProxy = document.querySelector<HTMLIFrameElement>(".editor_frame").contentWindow;
        window.addEventListener("message", this.onMsg);
    }


    _res = (data) => {
        const { id, res, err } = data.data;
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

    onMsg: { (e: MessageEvent<any>): void } = async ({ data }) => {
        console.log("msg", data);
        if (!data) {
            return;
        }
        if (data.from == "editor") {
            switch (data.type) {
                case "_req":
                    const { id, fun, args } = data.data;

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
                    const { doc,docId,modelId } = Taro.getStorageSync("doc_draft");
                    const {doc_id} = this.$router.params;
                    window.history.replaceState(null,null,`/pages/template/preview?doc_id=${parseInt(doc_id+"")>0?doc_id:docId}`);
                    
                    this.setState({
                        saveId:parseInt(doc_id+"")>=0?doc_id:docId,
                        modalId:modelId
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

    onSave = (_,callback?:()=>void) => {
        const { doc } = Taro.getStorageSync("doc_draft");
        Taro.showLoading({title:"保存中"});
        api("editor.user_tpl/add",{
            doc: JSON.stringify(doc),

        }).then((res)=>{
            this.setState({
                saveId: res.id
            })
            Taro.hideLoading();
            window.history.replaceState(null,null,`/pages/template/preview?doc_id=${res.id}`)
            Taro.showToast({
                title:"保存成功",
                icon:"success",
                duration:2000
            })

            callback && callback();
            // console.log("api-----",res);
        }).catch((e)=>{
            Taro.hideLoading();
            console.log(e);
            Taro.showToast({
                title:e,
                icon:"none",
                duration:2000
            });
        })
    }
    getShellInfo = () => {
        api('app.product/info',{
            id:30
        }).then((res)=>{
            // console.log(res);
            this.setState({
                productInfo:res,
                placeOrderShow: true
            })
        })
    }
    onEditor = () => {
        const { saveId } = this.state;
        window.location.replace(`/editor/shell?id=${saveId}`);
    }

    onOrderIng = () => {
        const {saveId} = this.state;
        const {id} = userStore;
        if (!id) {
            this.setState({isOpened: true})
            return
        }
        if (parseInt(saveId+'')>0) {
            this.getShellInfo()
        } else {
            this.onSave(null,()=>{
                this.getShellInfo()
            });
        }
    }

    render() {
        const { placeOrderShow,saveId,productInfo, isOpened} = this.state;
        return (
            <View className='preview'>
                {
                    isOpened
                        ? <AtModal
                            className="modal_confirm_container"
                            isOpened={isOpened}
                            cancelText='取消'
                            confirmText='前往登录'
                            onCancel={() => this.setState({isOpened: false})}
                            onConfirm={() => window.location.replace(`/pages/login/index`)}
                            content='检测到您还未登录，请登录后操作!'
                        />
                        : null
                }
                <View className='nav-bar'>
                    <View className='left' onClick={() => {
                        if (saveId) {
                            window.location.replace(`/editor/shell?id=${saveId}`);
                        } else {
                            window.location.replace('/editor/shell');
                        }
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314' />
                    </View>
                    <View className='center'>
                        <Text className='title'>预览</Text>
                    </View>
                    <View className='right'>
                        <IconFont name='24_fenxiang' size={48} color='#121314' />
                    </View>
                </View>
                <View className='container'>
                     {/* eslint-disable-next-line react/forbid-elements */}
                    <iframe className="editor_frame" src={`http://192.168.0.166/editor/mobile?token=${getToken()}&tpl_id=0&readonly=1`} width="100%" height="100%"></iframe>
                </View>
                <View className='bottom'>
                    {
                        parseInt(saveId+"")>0?<View className='editor' onClick={this.onEditor}>
                            <IconFont name='24_qubianji' size={48} color='#707177' />
                            <Text className='txt'>编辑</Text>
                        </View>:<View className='editor' onClick={this.onSave}>
                            <IconFont name='24_qubaocun' size={48} color='#707177' />
                            <Text className='txt'>保存</Text>
                        </View>
                    }
                    <Button className='noworder' onClick={this.onOrderIng}>立即下单</Button>
                </View>
                <PlaceOrder data={productInfo} isShow={placeOrderShow} onClose={this.onPlaceOrderClose} onButtonClose={this.onPlaceOrderClose}
                onBuyNumberChange={(n) => {
                    this.setState({
                        buyTotal:n
                    })
                }} onAddCart={()=>{
                    const {buyTotal,sku,saveId,modalId} = this.state;
                    if (!lodash.isEmpty(sku) && Number(sku.id)>0) {
                        Taro.showLoading({title:"加载中"})
                        api("app.cart/add",{
                            sku_id:sku.id,
                            user_tpl_id:saveId,
                            phone_model_id:modalId,
                            quantity:buyTotal
                        }).then(()=>{
                            Taro.hideLoading();
                            Taro.showToast({
                                title:"已成功添加到购物车!",
                                icon:"success",
                                duration:2000
                            })
                        }).catch((e)=>{
                            Taro.hideLoading();
                            Taro.showToast({
                                title:e,
                                icon:"none",
                                duration:2000
                            })
                        })
                    } else {
                        Taro.showToast({
                            title:"请选择规格!",
                            icon:"none",
                            duration:2000
                        });
                    }
                }} onNowBuy={()=>{
                    const {buyTotal,sku,saveId,modalId} = this.state;
                    if (!lodash.isEmpty(sku) && Number(sku.id)>0) {
                        Taro.navigateTo({
                            url:`/pages/template/confirm?skuid=${sku.id}&total=${buyTotal}&tplid=${saveId}&model=${modalId}`
                        })
                    } else {
                        Taro.showToast({
                            title:"请选择规格!",
                            icon:"none",
                            duration:2000
                        });
                    }
                }} onSkuChange={(sku)=>{
                    this.setState({
                        sku:sku
                    })
                }} />
            </View>
        )
    }
}
