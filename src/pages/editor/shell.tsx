import Taro, {Component} from '@tarojs/taro';
import {Image, Text, View, WebView} from '@tarojs/components';
import {AtActivityIndicator} from "taro-ui";
import './editor.less';
import './shell.less';
import {api, getToken} from '../../utils/net';
import IconFont from '../../components/iconfont';
import {observable} from 'mobx';
import {observer} from '@tarojs/mobx';
import {deviceInfo} from "../../utils/common";
import moment from "moment";
import {ChangeAlpha, ChangeFontStyle, ChangeImage, ChangeText, SelectFont, ToolBar0} from "./esehll/shelltools";


let editorProxy: WindowProxy | null | undefined = null;

export const sendMessage: { (type: string, data: any): void } = (type, data) => {
    editorProxy && editorProxy.postMessage({from: "parent", type: type, data: data}, "*");
}

let rpcId = 0;
const rpcList = {}

export function callEditor(name, ...args) {
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


class Store {
    @observable
    tool = 0;


    @observable
    isEdit = false;
}


@observer
export default class Shell extends Component<{}, {
    size?: { width: string | number; height: string | number };
    data?: number;
    loadingTemplate?: boolean;
    textInfo: any
}> {

    public store = new Store();

    private tplId: any = 0;
    private docId: any = 0;

    constructor(p) {
        super(p);
        // console.log(this.$router.params);
        this.tplId = this.$router.params['tpl_id'] || 0;
        this.docId = this.$router.params['id'] || 0;

        this.state = {
            loadingTemplate: true,
            textInfo: null
        };
    }

    public editorProxy: WindowProxy | null | undefined = null;
    public defaultModel: any = null;

    getDefaultPhoneShell() {
        return new Promise<any>(async (resolve, reject) => {
            try {
                Taro.showLoading({title: "请稍候"});
                const res = await api("editor.phone_shell/default");
                Taro.setStorageSync("phone_model", {mod: res, time: moment().add(30, "minutes").valueOf()});
                Taro.hideLoading();
                resolve(res)
            } catch (e) {
                reject(e)
            }
        })

    }

    async componentDidMount() {
        if (deviceInfo.env === "h5") {
            // @ts-ignore
            this.editorProxy = document.querySelector<HTMLIFrameElement>(".editor_frame").contentWindow;
            editorProxy = this.editorProxy;
            window.addEventListener("message", this.onMsg);

            try {
                const modData = Taro.getStorageSync("phone_model");

                if (!modData.time || !modData.mod) {
                    this.defaultModel = await this.getDefaultPhoneShell();
                } else {
                    const isAfter = moment().isBefore(moment(modData.time));
                    if (!isAfter) {
                        this.defaultModel = await this.getDefaultPhoneShell();
                    } else {
                        this.defaultModel = modData.mod;
                    }
                }
            } catch (e) {

            }
            if (!this.defaultModel) {
                this.defaultModel = await this.getDefaultPhoneShell();

            }
        }

    }


    componentWillUnmount() {
        if (deviceInfo.env === "h5") {
            editorProxy = null;
            window.removeEventListener("message", this.onMsg);
        }
    }

    onLoad = async (_?: number) => {
        if (this.defaultModel) {
            const mod = this.defaultModel;
            sendMessage("phoneshell", {id: mod.id, mask: mod.mask});
        }

    }

    onLoadEmpty = async () => {
        if (!this.tplId && !this.docId) {
            try {

                const {doc} = Taro.getStorageSync("doc_draft");
                console.log(doc)
                if (doc) {
                    await callEditor("setDoc", doc);
                }
                // this.tplId = tplId;
            } catch (e) {

            }
        }
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
        console.log("msg", data);
        if (!data) {
            return;
        }
        if (data.from !== "editor") {
            return
        }
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
                this.onLoadEmpty()

                this.setState({
                    loadingTemplate: false
                });

                break;

            case "onload":
                console.log(5555555)
                this.setState({
                    loadingTemplate: false
                });
                this.onLoad(data.data);
                break;

            case "mainSize":
                // this.setEditorSize(data.data);
                break;

            case "selected":
                this.onSelected(data.data);
                break;
        }
    }

    onSelected = (item?: { id: any, type: "img" | "text" | "container" }) => {
        if (this.store.isEdit) {
            return;
        }
        if (!item) {
            this.store.tool = 0;
            return;
        }
        switch (item.type) {
            case "img":
                this.store.tool = 1;
                break;
            case "text":
                this.store.tool = 2;
                this.setState({textInfo: item})
                break;
        }
    }


    back = () => {
        if (Taro.getCurrentPages().length > 1) {
            Taro.navigateBack();
        } else {
            if (process.env.TARO_ENV == "h5") {
                window.location.href = "/";
            } else {
                Taro.reLaunch({url: "/pages/index"});
            }
        }
    }

    next = async () => {
        Taro.showLoading({
            title: "请稍候"
        });
        // await callEditor("saveDraft");
        const doc = await callEditor("getDoc");
        Taro.setStorageSync("doc_draft", {
            tplId: this.tplId,
            docId: this.docId,
            modelId: this.defaultModel.id,
            doc: doc
        });
        Taro.hideLoading();
        window.location.replace(`/pages/template/preview`);
    }


    changeImage = () => {
        this.store.tool = 4;
        this.store.isEdit = true;
    }

    onOk = () => {
        this.store.tool = 0;
        this.store.isEdit = false
    }

    cancelEdit = () => {
        this.store.tool = 0;
        this.store.isEdit = false;
    }

    changeTxt = () => {
        this.store.tool = 6;
        this.store.isEdit = true;
    }

    selectFont = () => {
        this.store.tool = 7;
        this.store.isEdit = true;
    }

    changeFontStyle = () => {
        this.store.tool = 8;
        this.store.isEdit = true;
    }

    // 水平翻转
    onFilpY = async () => {
        try {
            await callEditor("flipH");
        } catch (e) {
        }
    }

    // 垂直翻转
    onFilpX = async () => {
        try {
            await callEditor("flipV")
        } catch (e) {

        }
    }

    // alpha
    onChangeAlpha = () => {
        this.store.tool = 5;
        this.store.isEdit = true;
    }

    getUrl = () => {
        if (process.env.NODE_ENV == 'production') {
            if (deviceInfo.env === "h5") {
                return `/editor/mobile?token=${getToken()}&tpl_id=${this.tplId}&doc_id=${this.docId}&t=9998`
            } else {
                return `/editor/shell?tpl_id=${this.tplId}&cid=${this.$router.params.cid}`
            }
        } else {
            if (deviceInfo.env === "h5") {
                return `http://192.168.0.123:8080/editor/mobile?token=${getToken()}&tpl_id=${this.tplId}&doc_id=${this.docId}&t=9998`
            } else {
                return `http://192.168.0.123/editor/shell?tpl_id=${this.tplId}&cid=${this.$router.params.cid}`
            }
        }
    }

    renderShellview = () => {
        const {loadingTemplate, size, textInfo} = this.state;
        const {tool} = this.store;
        if (deviceInfo.env === "h5") {
            return <View className='editor-page'>
                <View className='header'>
                    <View onClick={this.back}>
                        <IconFont name='24_shangyiye' color='#000' size={48}/>
                    </View>
                    <View onClick={this.next} className='right'>下一步</View>
                </View>
                <View className="editor" style={size ? {height: size.height} : undefined}>
                    <WebView src={this.getUrl()}/>
                    {loadingTemplate ?
                        <View className='loading'><AtActivityIndicator size={64} mode='center'/></View> : null}
                </View>
            </View>
        }
        return <View className='editor-page'>
            <View className='header'>
                <View onClick={this.back}>
                    <IconFont name='24_shangyiye' color='#000' size={48}/>
                </View>
                <View onClick={this.next} className='right'>下一步</View>
            </View>
            <View className="editor" style={size ? {height: size.height} : undefined}>
                <iframe className="editor_frame" src={this.getUrl()}/>
                {loadingTemplate ?
                    <View className='loading'><AtActivityIndicator size={64} mode='center'/></View> : null}
            </View>
            {
                tool === 0
                    ? <ToolBar0 parent={this}/>
                    : tool === 1
                    ? <View className='tools'>
                        <View className='btn' onClick={this.changeImage}>
                            <IconFont name='24_bianjiqi_chongyin' size={48}/>
                            <Text className='txt'>换图</Text>
                        </View>
                        <View className='btn' onClick={this.onFilpY}>
                            <IconFont name='24_bianjiqi_shuipingfanzhuan' size={48}/>
                            <Text className='txt'>水平</Text>
                        </View>
                        <View className='btn' onClick={this.onFilpX}>
                            <IconFont name='24_bianjiqi_chuizhifanzhuan' size={48}/>
                            <Text className='txt'>垂直</Text>
                        </View>
                        <View className='btn' onClick={this.onChangeAlpha}>
                            <View className='icon'>
                                <Image className="icon_img" src={require("../../source/trans.png")}/>
                            </View>
                            <Text className='txt'>透明度</Text>
                        </View>
                    </View>
                    : tool === 2
                        ? <View className='tools'>
                            <View className='btn' onClick={this.changeTxt}>
                                <IconFont name='24_bianjiqi_huantu' size={48}/>
                                <Text className='txt'>编辑</Text>
                            </View>
                            <View className='btn' onClick={this.selectFont}>
                                <IconFont name='24_bianjiqi_ziti' size={48}/>
                                <Text className='txt'>字体</Text>
                            </View>
                            <View className='btn' onClick={this.changeFontStyle}>
                                <IconFont name='24_bianjiqi_yangshi' size={48}/>
                                <Text className='txt'>样式</Text>
                            </View>
                        </View>
                        : tool === 4
                            ? <ChangeImage
                                onClose={this.cancelEdit}
                                onOk={this.onOk}
                            />
                            : tool === 5
                                ? <ChangeAlpha onClose={this.cancelEdit} onOk={this.onOk}/>
                                : tool === 6
                                    ? <ChangeText onClose={this.cancelEdit} data={textInfo}
                                                  onOk={this.onOk}/>
                                    : tool === 7
                                        ? <SelectFont onClose={this.cancelEdit} onOk={this.onOk}/>
                                        : tool === 8
                                            ? <ChangeFontStyle onClose={this.cancelEdit} onOk={this.onOk}/>
                                            : null
            }
        </View>
    };

    renderToolsView = () => {
        const {textInfo} = this.state;
        const {tool} = this.store;
        if (tool === 0) {
            return <ToolBar0 parent={this}/>
        }
        if (tool === 1)  {
            return <View className='tools'>
                <View className='btn' onClick={this.changeImage}>
                    <IconFont name='24_bianjiqi_chongyin' size={48}/>
                    <Text className='txt'>换图</Text>
                </View>
                <View className='btn' onClick={this.onFilpY}>
                    <IconFont name='24_bianjiqi_shuipingfanzhuan' size={48}/>
                    <Text className='txt'>水平</Text>
                </View>
                <View className='btn' onClick={this.onFilpX}>
                    <IconFont name='24_bianjiqi_chuizhifanzhuan' size={48}/>
                    <Text className='txt'>垂直</Text>
                </View>
                <View className='btn' onClick={this.onChangeAlpha}>
                    <View className='icon'>
                        <Image className="icon_img" src={require("../../source/trans.png")}/>
                    </View>
                    <Text className='txt'>透明度</Text>
                </View>
            </View>
        }
        if (tool === 2) {
            return <View className='tools'>
                <View className='btn' onClick={this.changeTxt}>
                    <IconFont name='24_bianjiqi_huantu' size={48}/>
                    <Text className='txt'>编辑</Text>
                </View>
                <View className='btn' onClick={this.selectFont}>
                    <IconFont name='24_bianjiqi_ziti' size={48}/>
                    <Text className='txt'>字体</Text>
                </View>
                <View className='btn' onClick={this.changeFontStyle}>
                    <IconFont name='24_bianjiqi_yangshi' size={48}/>
                    <Text className='txt'>样式</Text>
                </View>
            </View>
        }
        if (tool === 4) {
            return <ChangeImage onClose={this.cancelEdit} onOk={this.onOk}/>
        }
        if (tool ===5) {
            return <ChangeAlpha onClose={this.cancelEdit} onOk={this.onOk}/>
        }
        if (tool === 6) {
            return <ChangeText onClose={this.cancelEdit} data={textInfo} onOk={this.onOk}/>
        }
        if (tool === 7) {
            return <SelectFont onClose={this.cancelEdit} onOk={this.onOk}/>
        }
        if (tool === 8) {
            return <ChangeFontStyle onClose={this.cancelEdit} onOk={this.onOk}/>
        }
    }


    render() {
        const {loadingTemplate, size} = this.state;
        return (
            <View className='editor-page'>
                <View className='header'>
                    <View onClick={this.back}>
                        <IconFont name='24_shangyiye' color='#000' size={48}/>
                    </View>
                    <View onClick={this.next} className='right'>下一步</View>
                </View>
                <View className="editor" style={size ? {height: size.height} : undefined}>
                    <iframe className="editor_frame" src={this.getUrl()}/>
                    {loadingTemplate ?
                        <View className='loading'><AtActivityIndicator size={64} mode='center'/></View> : null}
                </View>
                {this.renderToolsView()}
            </View>
        )
    }
}
