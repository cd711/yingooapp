import {View, Text, Image} from "@tarojs/components";
import Taro, {Component, Config} from "@tarojs/taro";
import {AtNavBar} from "taro-ui";
import IconFont from "../../components/iconfont";
import "./aboutus.less";

export default class Aboutus extends Component<any, any> {

    config: Config = {
        navigationBarTitleText: "关于映果",
    }

    render(): React.ReactNode {
        return (
            <View className="about_us_container" style={{height: window.screen.availHeight}}>
                <AtNavBar onClickLeftIcon={() => Taro.navigateBack()}
                    color='#121314' title="关于映果" border fixed
                    leftIconType={{value:'chevron-left', color:'#121314', size:24}}
                />
                <View className="about_content">
                    <View className="logo">
                        <Image src={require("../../source/logo.png")} className="img" />
                    </View>
                    <View className="action_row">
                        <Text className="txt">联系我们</Text>
                        <IconFont name="24_xiayiye" color="#999" size={40} />
                    </View>
                </View>
                <View className="avc">
                    <Text className="link" onClick={() => Taro.navigateTo({url: "/pages/me/privacy?pageType=user_agreement"})}>《映果用户协议》</Text>
                    <Text className="txt">和</Text>
                    <Text className="link" onClick={() => Taro.navigateTo({url: "/pages/me/privacy?pageType=privacy"})}>《映果隐私协议》</Text>
                    <Text className="o_txt">映果版权所有</Text>
                </View>
            </View>
        )
    }
}
