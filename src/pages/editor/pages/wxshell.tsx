import Taro, {Component, Config} from '@tarojs/taro';
import {View, WebView} from '@tarojs/components';
import {AtActivityIndicator} from "taro-ui";
import './editor.less';
import './shell.less';
import {observable} from 'mobx';
import {observer} from '@tarojs/mobx';
import config from "../../../config";
import {debuglog, deviceInfo, getURLParamsStr, updateChannelCode, urlEncode} from "../../../utils/common";
import {api, getToken} from "../../../utils/net";
import dayjs from "dayjs"
import page from "../../../utils/ext";


class Store {
    @observable
    tool = 0;


    @observable
    isEdit = false;
}


@observer
@page({
    share:true
})
export default class Shell extends Component<{}, {
    size?: { width: string | number; height: string | number };
    data?: number;
    loadingTemplate?: boolean;
    textInfo: any;
    url: string
}> {

    config: Config = {
        navigationBarTitleText: '编辑中',
    }

    public store = new Store();

    private tplId: any = 0;

    constructor(p) {
        super(p);

        this.tplId = this.$router.params['tpl_id'] || 0;

        this.state = {
            loadingTemplate: true,
            textInfo: null,
            url: ""
        };
    }

    async componentDidShow() {
        const finishId = Taro.getApp().finishId;
        debuglog("finishId：", finishId)
        if (finishId) {
            try {
                const res = await api("editor.user_tpl/info", {id: finishId});
                debuglog("反查询的tpl_product_id：", res)
                this.tplId = res.tpl_product_id
            } catch (e) {

            }
        }
        this.setState({url: this.getUrl()})
    }


    back = () => {
        if (deviceInfo.env === "weapp") {
            Taro.getApp().finishId = null;
        }
        if (Taro.getCurrentPages().length > 1) {
            Taro.navigateBack();
        } else {
            if (process.env.TARO_ENV == "h5") {
                window.location.href = updateChannelCode("/");
            } else {
                Taro.switchTab({url: updateChannelCode("/pages/tabbar/index/index")});
            }
        }
    }


    getUrl = () => {
        const str = getURLParamsStr(urlEncode({
            ts: dayjs().valueOf(),  // 加上时间戳去处理小程序webview的缓存问题
            tok: getToken(),
            tpl_id: this.tplId,
            cid: this.$router.params.cid,
            hidden: "t",
            workid: Taro.getApp().finishId || "f"
        }))
        return updateChannelCode(process.env.NODE_ENV == 'production'
            ? `${config.weappUrl}/pages/editor/pages/shell?${str}`
            : `${config.h5Url}/pages/editor/pages/shell?${str}`)
    }


    render() {
        const {loadingTemplate, size, url} = this.state;

        return (
            <View className='editor-page'>
                <View className="editor" style={size ? {height: size.height} : undefined}>
                    <WebView src={url} />
                    {
                        loadingTemplate ?
                        <View className='loading'><AtActivityIndicator size={64} mode='center'/></View>
                        : null
                    }
                </View>
            </View>
        )
    }
}
