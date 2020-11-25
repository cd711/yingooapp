import Taro, {useState, useEffect} from "@tarojs/taro";
import {View, Text} from "@tarojs/components";
import IconFont from "../iconfont";
import "./login.less"
import {is_weixin} from "../../utils/common";

interface LoginProps {
    onClose?: () => void;
    onOk?: () => void;
    // 第三方登录点击
    onThirdPartyAuth?: (type: string) => void;
    showClose?: boolean;
    loginTxt?: string
}
const Login: Taro.FC<LoginProps> = props => {

    const {onOk, onClose, onThirdPartyAuth,
        showClose = true,
        loginTxt = "手机号登录"
    } = props;

    const [visible, setVisible] = useState(false);

    useEffect(() => {
        Taro.hideTabBar()
        setVisible(true)
    }, [])

    const didClose = () => {
        onClose && onClose();
        Taro.showTabBar()
    }

    const privacyView = type => {
        didClose()
        Taro.navigateTo({url: `/pages/me/privacy?pageType=${type}`})
    }

    const _onClose = () => {
        setVisible(false)
        setTimeout(() => {
            didClose()
        }, 200)
    }

    return (
        <View className={`un_login_model ${visible ? "animtion_un_login_model" : ""}`}>
            <View className={`login_model_main ${visible ? "animtion_login_model" : ""}`}>
                <View className="head">
                    <Text className="h2">登录后体验全面功能</Text>
                    {showClose ? <View className="close" onClick={_onClose}><IconFont name="24_guanbi" size={40} /></View> : null}
                </View>
                <View className="login_btn">
                    <View className="btn_lo" onClick={onOk}>
                        <Text className="txt">{loginTxt}</Text>
                    </View>
                </View>
                <View className="oth"><Text className="exp">其他方式</Text></View>
                <View className="other_login_way">
                    {
                        is_weixin()?null:<View className="item" onClick={() => onThirdPartyAuth("qq")}>
                            <IconFont name="24_QQ-Color" size={48}/><Text className="name">QQ登录</Text>
                        </View>
                    }
                    {
                        is_weixin()
                            ? <View className="item" onClick={() => {
                                onThirdPartyAuth && onThirdPartyAuth("wechat");
                                // @ts-ignore
                                const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${common_config.wxappid}&redirect_uri=${encodeURIComponent(window.location.href)}&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect`;
                                window.location.href = url;
                            }}>
                                <IconFont name="24_weixin-Color" size={48}/><Text className="name">微信登录</Text>
                            </View>
                            : null
                    }
                </View>
                <View className="priv_item">
                    <Text className="txt">登录即同意<Text className="link" onClick={() => privacyView("user_agreement")}>《映果用户协议》</Text>和<Text className="link" onClick={() => privacyView("privacy")}>《映果隐私协议》</Text></Text>
                </View>
            </View>
        </View>
    )
}

// const Login: Taro.FC<LoginProps> = props => {
//
//     const {onOk, onClose,
//         showClose = true
//     } = props;
//
//     return (
//         <View className="un_login_model">
//             <View className="model_main">
//                 <Image src={require("../../source/login.png")} className="login_bg" />
//                 <View className="model_info_main">
//                     <Text className="h2">您还未登录</Text>
//                     <Text className="txt">请先登录/注册再进行此操作</Text>
//                     <View className="btn" onClick={onOk}><Text className="lo_txt">登录</Text></View>
//                 </View>
//             </View>
//             {showClose ? <View className="close" onClick={onClose}><IconFont name="16_qingkong" size={72} /></View> : null}
//         </View>
//     )
// }

export default Login
