import "./index.less";
import Taro from '@tarojs/taro';
import {View, Text, Image} from "@tarojs/components";

interface EmptyProps {
    content?: string | JSX.Element;
    button?: string | JSX.Element;
    onClick?: () => void;
    icon?: string;
}
const Empty: Taro.FC<EmptyProps> = (props) => {

    const {content, button, onClick, icon} = props;

    return (
        <View className="empty_container">
            <Image src={icon ? icon : require('../../source/empty/nullorder.png')} className='pic' />
            {
                content
                    ? typeof content === "string"
                        ? <Text className="txt">{content}</Text>
                        : content
                    : <Text className="txt">暂无作品</Text>
            }
            {
                button
                    ? <View className="empty_button" onClick={onClick}>
                        {
                            typeof button === "string"
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
