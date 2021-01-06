import {RichText, View} from "@tarojs/components";
import Taro, {Component, Config} from "@tarojs/taro";
import {AtNavBar} from "taro-ui";
import {api} from "../../../../utils/net";
import "./privacy.less";
import {deviceInfo} from "../../../../utils/common";
import page from "../../../../utils/ext";

interface PrivacyState{
    privacyTxt: string
}
@page({
    share: true
})
export default class Privacy extends Component<any, PrivacyState> {
    config: Config = {
        navigationBarTitleText: `${this.$router.params.pageType === "privacy" ? "隐私政策" : "用户协议"}`,
    }

    constructor() {
        super();
        this.state = {
            privacyTxt: ""
        }
    }

    componentDidMount() {
        const {params} = this.$router;
        if (params.pageType) {
            api("app.about/info", {name: params.pageType}).then(privacyTxt => {
                this.setState({privacyTxt})
            }).catch(e => {
                console.log("获取内容出错：", e)
            })
        }
    }

    render(): React.ReactNode {
        const {privacyTxt} = this.state;
        return (
            <View className="privacy_container">
                <AtNavBar
                    onClickLeftIcon={()=>{
                        Taro.navigateBack();
                    }}
                    color='#121314'
                    title={`${this.$router.params.pageType === "privacy" ? "隐私政策" : "用户协议"}`}
                    border
                    fixed
                    customStyle={{
                        paddingTop: deviceInfo.env === "weapp" ? deviceInfo.statusBarHeight + "px" : "0px"
                    }}
                    leftIconType={{
                        value:'chevron-left',
                        color:'#121314',
                        size:24
                    }}
                />
                <View className="txt" style={{
                    paddingTop: `${deviceInfo.statusBarHeight}px`
                }}>
                    <RichText nodes={privacyTxt} />
                </View>
            </View>
        )
    }
}

