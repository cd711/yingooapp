import "./index.less";
import Taro from "@tarojs/taro";
import {View, Image} from "@tarojs/components";
import IconFont from "../iconfont";
import {deviceInfo} from "../../utils/common";

interface CurtainProps {
    src: string;
    onClose?: () => void;
    onCurtainClick?: () => void;
}
const Curtain: Taro.FC<CurtainProps> = props => {

    const {src, onClose, onCurtainClick} = props;

    return (
        <View className="curtain_container">
            <View className="curtain_main">
                <View className="curtain_img" onClick={onCurtainClick}>
                    <Image src={src} mode="widthFix" className="img" style={{
                        width: deviceInfo.windowWidth - 80
                    }} />
                </View>
                <View className="icon" onClick={onClose}>
                    <IconFont name="24_guanbi" color="#fff" size={80} />
                </View>
            </View>
           <View className="mask" />
        </View>
    )
}

export default Curtain
