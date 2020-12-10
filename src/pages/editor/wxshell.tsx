import Taro, {Component} from '@tarojs/taro';
import {View, WebView} from '@tarojs/components';
import {AtActivityIndicator} from "taro-ui";
import './editor.less';
import './shell.less';
import {getToken} from '../../utils/net';
import IconFont from '../../components/iconfont';
import {observable} from 'mobx';
import {observer} from '@tarojs/mobx';
import {deviceInfo} from "../../utils/common";


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

        this.tplId = this.$router.params['tpl_id'] || 0;
        this.docId = this.$router.params['id'] || 0;

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
                    <WebView src={this.getUrl()}/>
                    {loadingTemplate ?
                        <View className='loading'><AtActivityIndicator size={64} mode='center'/></View> : null}
                </View>
            </View>
        )
    }
}
