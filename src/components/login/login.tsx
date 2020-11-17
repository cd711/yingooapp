import Taro from "@tarojs/taro";
import {View, Text, Image} from "@tarojs/components";
import IconFont from "../iconfont";
import "./login.less"

interface LoginProps {
    onClose?: () => void;
    onOk?: () => void;
    showClose?: boolean;
}
const Login: React.FC<LoginProps> = props => {

    const {onOk, onClose,
        showClose = true
    } = props;

    return (
        <View className="un_login_model">
            <View className="model_main">
                <Image src={require("../../source/login.png")} className="login_bg" />
                <View className="model_info_main">
                    <Text className="h2">您还未登录</Text>
                    <Text className="txt">请先登录/注册再进行此操作</Text>
                    <View className="btn" onClick={onOk}><Text className="lo_txt">登录</Text></View>
                </View>
            </View>
            {showClose ? <View className="close" onClick={onClose}><IconFont name="16_qingkong" size={72} /></View> : null}
        </View>
    )
}

export default Login
