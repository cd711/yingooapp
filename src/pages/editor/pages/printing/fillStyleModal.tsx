import "./index.less";
import Taro  from "@tarojs/taro";
import {View, Text, Image} from "@tarojs/components";
import {options} from "../../../../utils/net";

interface FillStyleModalProps {
    onClose?: () => void;
}
const FillStyleModal: Taro.FC<FillStyleModalProps> = props => {
    const {onClose} = props;
    return (
        <View className="fill_style_modal_container">
            <View className="fill_style_modal_main">
                <Text className="title">默认采用了裁剪图片，可根据实际情况调整图片显示方式</Text>
                <View className="style_exp_main">
                    <View className="item">
                        <Image src={`${options.sourceUrl}appsource/bai.png`} className="exp_img"/>
                        <Text className="exp_txt">留白</Text>
                    </View>
                    <View className="item">
                        <Image src={`${options.sourceUrl}appsource/tianchong.png`} className="exp_img"/>
                        <Text className="exp_txt">裁剪</Text>
                    </View>
                </View>
                <View className="close_btn" onClick={onClose}>
                    <Text className="txt">我知道了</Text>
                </View>
            </View>
        </View>
    )
}

export default FillStyleModal
