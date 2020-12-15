import Taro, {Component, Config} from '@tarojs/taro';
import {View, WebView} from '@tarojs/components';
import {AtActivityIndicator} from "taro-ui";
import './editor.less';
import './shell.less';
import {observable} from 'mobx';
import {observer} from '@tarojs/mobx';
import config from "../../../config";
import {deviceInfo} from "../../../utils/common";
import {getToken} from "../../../utils/net";


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
            textInfo: null
        };
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

        window.location.replace(`/pages/template/preview`);
    }

    getUrl = () => {
        return process.env.NODE_ENV == 'production'
            ? `https://${config.weappUrl}/editor/shell?tpl_id=${this.tplId}&cid=${this.$router.params.cid}&hidden=t&token=${getToken()}`
            : `http://${config.h5Url}/editor/shell?tpl_id=${this.tplId}&cid=${this.$router.params.cid}&hidden=t&token=${getToken()}`
    }


    render() {
        const {loadingTemplate, size} = this.state;

        return (
            <View className='editor-page'>
                <View className='wx_editor-page_header'
                      style={{
                          marginTop: `${deviceInfo.menu.bottom}px`
                      }}
                >
                    <View onClick={this.next} className='right'>下一步</View>
                </View>
                <View className="editor" style={size ? {height: size.height} : undefined}>
                    <WebView src={this.getUrl()} onLoad={(e) => {
                        console.log("加载完成：", e)
                    }} />
                    {loadingTemplate ?
                        <View className='loading'><AtActivityIndicator size={64} mode='center'/></View> : null}
                </View>
            </View>
        )
    }
}
