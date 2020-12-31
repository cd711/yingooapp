import "./index.less";
import Taro, {useEffect, useState} from "@tarojs/taro";
import {View, Text} from "@tarojs/components";
import {AtActivityIndicator} from "taro-ui";

interface RefreshProps {
    content?: string;
    visible: boolean;
}
const Refresh: Taro.FC<RefreshProps> = props => {

    const {content, visible} = props;

    const [status, setStatus] = useState(false);
    const [show, setShowStatus] = useState(false)

    useEffect(() => {
        if (visible) {
            setShowStatus(true);
            setTimeout(() => {
                setStatus(true)
            }, 400)
        } else {
            setStatus(false);
            setTimeout(() => {
                setShowStatus(false)
            }, 600)
        }
    }, [visible])

    return(
        <View className="refresh_container">
            {
                show
                    ? <View className={`refresh_main ${status ? "refresh_transition_anim" : ""}`}>
                        <AtActivityIndicator />
                        <Text className="txt">{content || "正在为您刷新..."}</Text>
                    </View>
                    : null
            }
        </View>
    )
}

export default Refresh
