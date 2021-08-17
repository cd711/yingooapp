import Taro, {Component, Config} from '@tarojs/taro';
import {View, WebView} from '@tarojs/components';
import './editor.less';
import {observable} from 'mobx';
import {observer} from '@tarojs/mobx';
import config from "../../../config";
import {getURLParamsStr, setPageTitle, updateChannelCode, urlEncode} from "../../../utils/common";
import {getToken} from "../../../utils/net";
import dayjs from "dayjs";
import page from "../../../utils/ext";


class Store {
    @observable
    tool = 0;

    @observable
    isEdit = false;
}


interface PrintEditState {
    size?: { width: string | number; height: string | number };
    data?: number;
    textInfo: any
}
@observer
@page({
    share:true
})
export default class PrintEdit extends Component<any, PrintEditState> {

    public store = new Store();

    private tplId: any = 0;
    private routerParams = this.$router.params;

    constructor(p) {
        super(p);

        this.tplId = this.routerParams['tpl_id'] || 0;

        this.state = {
            textInfo: null
        };
    }

    config: Config = {
        navigationBarTitleText: '编辑中',
    }

    componentDidMount() {
        setPageTitle("编辑中")
    }

    getUrl = () => {
        const str = getURLParamsStr(urlEncode({
            ts: dayjs().valueOf(),  // 加上时间戳去处理小程序webview的缓存问题
            ...this.routerParams,
            tpl_id: this.tplId,
            cid: this.routerParams.cid,
            hidden: "t",
            key: this.routerParams.key,
            tok: getToken(),
        }))
        return updateChannelCode(process.env.NODE_ENV == 'production'
            ? `${config.weappUrl}/pages/editor/pages/printedit?${str}`
            : `${config.h5Url}/pages/editor/pages/printedit?${str}`)
    }

    render() {
        const {size } = this.state;

        return <View className='editor-page'>
            <View className="editor" style={size ? {height: size.height + "px"} : undefined}>
                <WebView src={this.getUrl()} />
            </View>
        </View>
    }
}
