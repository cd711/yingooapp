import {RichText, View,Text, ScrollView} from "@tarojs/components";
import Taro, {Component, Config} from "@tarojs/taro";
import {AtNavBar} from "taro-ui";
import {api} from "../../../../utils/net";
import "./privacy.less";
import {debuglog, deviceInfo, setPageTitle,jumpUri} from "../../../../utils/common";
import page from "../../../../utils/ext";
import IconFont from "../../../../components/iconfont";

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
        setPageTitle(`${params.pageType && params.pageType === "privacy" ? "隐私政策" : "用户协议"}`)
        if (params.pageType) {
            api("app.about/info", {name: params.pageType}).then(privacyTxt => {
                this.setState({privacyTxt})
            }).catch(e => {
                debuglog("获取内容出错：", e)
            })
        }
    }

    render(): React.ReactNode {
        const {privacyTxt} = this.state;
        return (
            <View className="privacy_container">
                {/* <AtNavBar
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
                /> */}
                <View className='nav-bar'
                      style={process.env.TARO_ENV === 'h5' ? "" : `padding-top:${Taro.getSystemInfoSync().statusBarHeight}px;`}>
                    <View className='left' onClick={() => {
                        if (Taro.getCurrentPages().length>1) {
                            Taro.navigateBack();
                        } else {
                            jumpUri("/pages/tabbar/index/index",true);
                        }
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314'/>
                    </View>
                    <View className='center'>
                        <Text className='title'>{`${this.$router.params.pageType === "privacy" ? "隐私政策" : "用户协议"}`}</Text>
                    </View>
                </View>
                <ScrollView scrollY style={`height:${Taro.getSystemInfoSync().windowHeight-100}px`}>
                    <View className='privacy_container_content'>
                        <View className="txt">
                            <RichText nodes={privacyTxt} />
                        </View>
                    </View>
                </ScrollView>


            </View>
        )
    }
}

