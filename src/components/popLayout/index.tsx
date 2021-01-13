import "./index.less";
import Taro, {useEffect, useState} from "@tarojs/taro";
import {View, Image, Text} from "@tarojs/components";
import {AtFloatLayout} from "taro-ui";
import {notNull} from "../../utils/common";

export interface PopLayoutItemProps {
    title: string;
    key: number;
    value: any;
}
interface PopLayoutProps {
    visible: boolean;
    onClose?: () => void;
    data: Array<PopLayoutItemProps>;
    onClick?: (item: PopLayoutItemProps, index: number) => void;
    defaultActive?: number;
}
const PopLayout: Taro.FC<PopLayoutProps> = props => {

    const {visible, onClose, data = [], onClick, defaultActive} = props;

    const [selected, setSelected] = useState(-1);

    useEffect(() => {
        if (!notNull(defaultActive) && typeof defaultActive === "number") {
            console.log(defaultActive)
            setSelected(defaultActive)
        }
    }, [])

    const _onClick = (item, idx) => {
        if (idx === selected) {
            setSelected(-1)
        } else {
            setSelected(idx)
        }
        onClick && onClick(item, idx)
    }

    return (
        <View className="pop_layout_container">
            <AtFloatLayout isOpened={visible} onClose={onClose} className="pop_layout_modal">
                <View className="pop_layout_body">
                    <View className="pop_layout_main">
                        {data.map((value, index) => (
                            <View className="pop_layout_item" key={index.toString()} onClick={() => _onClick(value, index)}>
                                <Text className="name">{value.title}</Text>
                                {
                                    selected === index
                                        ? <Image src={require("../../source/gx.png")} className="selected_item" />
                                        : <View />
                                }
                            </View>
                        ))}
                    </View>
                </View>
            </AtFloatLayout>
        </View>
    )
}

export default PopLayout
