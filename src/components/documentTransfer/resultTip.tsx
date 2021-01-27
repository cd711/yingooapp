import "./index.less";
import Taro from "@tarojs/taro";
import {View, Text, Image} from "@tarojs/components";
import {options} from "../../utils/net";

interface ResultTipProps {
    result: {uploading: number, succeed: number, failed: number};
    // 1:使用已上传的图片, 2: 继续加图, 3: 点击关闭
    onClose?: (type: 1 | 2 | 3) => void;
}
const ResultTip: Taro.FC<ResultTipProps> = props => {

    const {result, onClose} = props;

    const _onClose = (type) => {
        onClose && onClose(type)
    }

    return (
        <View className="result_tip_container">
            <View className="result_tip_main">
                <Text className="h2">上传结果</Text>
                <View className="ext_info">
                    <Text className="txt">已成功上传</Text>
                    <Text className="blue">{result.succeed}</Text>
                    <Text className="txt">张照片，失败</Text>
                    <Text className="red">{result.failed}</Text>
                    <Text className="txt">张</Text>
                </View>
                <View className="sub_btn" onClick={() => _onClose(1)}>
                    <Text className="txt">使用已上传照片</Text>
                </View>
                <Text className="continue" onClick={() => _onClose(2)}>继续加图</Text>
            </View>
            <View className="close_btn" onClick={() => _onClose(3)}>
                <Image src={`${options.sourceUrl}appsource/guanb.png`} className="close_btn" mode="aspectFit" />
            </View>
        </View>
    )
}

export default ResultTip
