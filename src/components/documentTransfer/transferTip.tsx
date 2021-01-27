import "./index.less";
import Taro from "@tarojs/taro";
import {View, Text} from "@tarojs/components";

interface TransferTipProps {
    total: number;
    onClose?: () => void;
}
const TransferTip: Taro.FC<TransferTipProps> = props => {

    const {total, onClose} = props;

    return (
        <View className="transfer_tip_container">
            <View className="transfer_tip_main">
                <Text className="h1">温馨提示</Text>
                <Text className="info">
                    您素材库中剩余允许存储的照片仅剩余{total}张，请调整本次要上传的照片数量后上传
                </Text>
                <View className="btn" onClick={onClose}>
                    <Text className="txt">我知道了</Text>
                </View>
            </View>
        </View>
    )
}

export default TransferTip
