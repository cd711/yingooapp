import Taro, {Component, Config} from '@tarojs/taro';
import {View, WebView} from '@tarojs/components';
import './editor.less';
import './shell.less';
import {observable} from 'mobx';
import {observer} from '@tarojs/mobx';
import config from "../../config";
import {getURLParamsStr, urlEncode} from "../../utils/common";


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

    }


    getUrl = () => {
        const key = this.$router.params.key || null;
        if (!key) {
            Taro.showToast({title: "页面丢了，请重试", icon: "none"})
            return
        }
        const str = getURLParamsStr(urlEncode({
            ...this.routerParams,
            tpl_id: this.tplId,
            cid: this.routerParams.cid,
            hidden: "t",
            key: this.routerParams.key
        }))
        return process.env.NODE_ENV == 'production'
            ? `/editor/printedit?${str}`
            : `http://${config.h5Url}/editor/printedit?${str}`
    }

    render() {
        const {size } = this.state;

        return <View className='editor-page'>
            <View className="editor" style={size ? {height: size.height + "px"} : undefined}>
                <WebView src={this.getUrl()} onLoad={(e) => {
                    console.log("加载完成：", e)
                }} />
            </View>
        </View>
    }
}
