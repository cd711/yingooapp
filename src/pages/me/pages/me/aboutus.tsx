import {View, Text, Image, Button} from "@tarojs/components";
import Taro, {Component, Config} from "@tarojs/taro";
import {AtModal, AtModalContent, AtNavBar} from "taro-ui";
import IconFont from "../../../../components/iconfont";
import "./aboutus.less";
import copy from "copy-to-clipboard";
import {deviceInfo, jumpToPrivacy, setPageTitle,jumpUri} from "../../../../utils/common";
import page from "../../../../utils/ext";


@page({
    share:true
})
export default class Aboutus extends Component<any, any> {

    config: Config = {
        navigationBarTitleText: "关于映果",
    }

    constructor(props) {
        super(props);
        this.state = {
            visible: false
        }
    }


    componentDidMount() {
        setPageTitle("关于映果")
    }

    render(): React.ReactNode {
        const {visible} = this.state;
        return (
            <View className="about_us_container" style={deviceInfo.env === 'h5'?{height: window.screen.availHeight}:{flex:1}}>
                {/* <AtNavBar onClickLeftIcon={() => Taro.navigateBack()}
                    color='#121314' title="关于映果" border fixed
                      customStyle={{
                          paddingTop: deviceInfo.env === "weapp" ? deviceInfo.statusBarHeight + "px" : "0px"
                      }}
                    leftIconType={{value:'chevron-left', color:'#121314', size:24}}
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
                        <Text className='title'>关于映果</Text>
                    </View>
                </View>
                <View className="about_content">
                    <View className="logo">
                        <Image src={require("../../../../source/logo.png")} className="img" mode={deviceInfo.env !== "h5" ? "widthFix" : "scaleToFill"} />
                    </View>
                    <View className="action_row" onClick={() => this.setState({visible: true})}>
                        <Text className="txt">联系我们</Text>
                        <IconFont name="24_xiayiye" color="#999" size={40} />
                    </View>
                </View>
                <View className="avc">
                    <Text className="link" onClick={() => jumpToPrivacy(1)}>《映果用户协议》</Text>
                    <Text className="txt">和</Text>
                    <Text className="link" onClick={() => jumpToPrivacy(2)}>《映果隐私协议》</Text>
                    <Text className="o_txt">映果版权所有</Text>
                </View>
                {
                    visible
                        ? <AtModal isOpened={visible} onClose={() => this.setState({visible: false})}>
                            <AtModalContent>
                                <View className='service_content'>
                                    <View className='title'>
                                        <Text className='txt'>映果客服</Text>
                                    </View>
                                    <View className='line_item'>
                                        <Text className='name'>微信：</Text>
                                        <Text className='content'>Yingoo</Text>
                                    </View>
                                    <View className='line_item'>
                                        <Text className='name'>电话：</Text>
                                        <Text className='content'>15682138888</Text>
                                    </View>
                                    <View className='line_item last_item'>
                                        <Text className='name'>邮箱：</Text>
                                        <a href="mailto:service@yingoo.com"><Text className='content'>service@yingoo.com</Text></a>
                                    </View>
                                    <Button className='copy_wechat' onClick={()=>{
                                        copy('Yingoo');
                                        Taro.showToast({
                                            title:"复制成功",
                                            icon:'none',
                                            duration:1000
                                        })
                                    }}>复制微信号</Button>
                                </View>
                            </AtModalContent>
                        </AtModal>
                        : null
                }
            </View>
        )
    }
}
