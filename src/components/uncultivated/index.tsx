import "./index.less"
import Taro from "@tarojs/taro";
import {View, Image, Text} from "@tarojs/components";

interface UncultivatedProps {
    onClose?: () => void;
    title?: string;
    content?: string;
    visible: boolean;
}
const Uncultivated: Taro.FC<UncultivatedProps> = props => {

    const {onClose, content, title} = props;


    return(
        <View className="uncultivated_container">
            <View className="uncultivated_main">
                <View className="uncultivated_img">
                    <Image src={require("../../source/login.png")} className="unc_img"  />
                </View>
                <View className="uncultivated_info">
                    <Text className="h1">{title || "功能即将上线~"}</Text>
                    <View className="txt">{content || "线下打印服务测试中，让我们拭目以待吧"}</View>
                    <View className="close_btn" onClick={onClose}>
                        <Text className="txt">我知道了</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default Uncultivated
