import "./index.less";
import Taro from '@tarojs/taro';
import {View, Text, Image} from "@tarojs/components";
import { options } from "../../utils/net";

interface EmptyProps {
    content?: string | JSX.Element;
    button?: string | JSX.Element;
    onClick?: () => void;
    icon?: string;
}
const Empty: Taro.FC<EmptyProps> = (props) => {

    const {content, button, onClick, icon} = props;
    function is_string(obj){
        if (obj) {
            return typeof obj === "string"
        }
        return false
        
    }
    return (
        <View className="empty_container">
            <Image src={icon ? icon : `${options.sourceUrl}appsource/empty/nullorder.png`} className='pic' />
            {
                content
                    ? is_string(content)
                        ? <Text className="txt">{content}</Text>
                        : content
                    : <Text className="txt">暂无作品</Text>
            }
            {
                button
                    ? <View className="empty_button" onClick={onClick}>
                        {
                            is_string(button)
                                ? <Text className="txt">{button}</Text>
                                : button
                        }
                    </View>
                    : null
            }
        </View>
    )
}

export default Empty
