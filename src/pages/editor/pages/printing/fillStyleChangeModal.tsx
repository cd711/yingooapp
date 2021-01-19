import "./index.less";
import Taro, {useState, useEffect} from "@tarojs/taro";
import {View, Image, Text} from "@tarojs/components";
import IconFont from "../../../../components/iconfont";
import {notNull} from "../../../../utils/common";
import {options} from "../../../../utils/net";

interface FillStyleChangeProps {
    onClose?: () => void;
    visible: boolean;
    defaultFill?: {style: "fill" | "allowBlank", exclude: boolean};
    onConfirm?: (style: "allowBlank" | "fill", exclude: boolean) => void;
}
const FillStyleChange: Taro.FC<FillStyleChangeProps> = props => {

    const {onClose, visible, onConfirm, defaultFill} = props;
    const data = [
        {key: 1, name: "留白相纸", value: "allowBlank", icon: `${options.sourceUrl}appsource/bai.png`},
        {key: 2, name: "填充相纸", value: "fill", icon: `${options.sourceUrl}appsource/tianchong.png`},
    ];

    const [current, setCurrent] = useState<"allowBlank" | "fill">("fill");
    const [exclude, setExclude] = useState(false);

    useEffect(() => {
        if (!notNull(defaultFill)) {
            setCurrent(defaultFill.style);
            setExclude(defaultFill.exclude)
        }
    }, [])

    const changeStyle = val => {
        setCurrent(val)
    }

    const _onConfirm = () => {
        onConfirm && onConfirm(current, exclude)
    }

    return (
        <View className='xy_float_modal'>
            <View className={visible ? 'float-layout float-layout--active' : 'float-layout'}>
                <View className='float-layout__overlay' />
                <View className='float-layout__container'>
                    <View className='xy_modal_container'>
                        <View className='title_bar'>
                            <View />
                            <View className='title'>
                                <Text className='txt'>更换显示方式</Text>
                            </View>
                            <View className='close' onClick={onClose}>
                                <IconFont name='20_guanbi' size={40} color='#121314'/>
                            </View>
                        </View>
                        <View className="fill_style_change_container">
                            <View className="head">
                                <View className="left">
                                    <Text className="txt">选择图片的显示方式</Text>
                                </View>
                                <View className="right" onClick={() => setExclude(!exclude)}>
                                    <IconFont name={exclude ? "22_yixuanzhong" : "22_touming-weixuanzhong"} size={32} />
                                    <Text className="txt">排除已编辑的照片</Text>
                                </View>
                            </View>
                            <View className="change_items">
                                <View className="item">
                                    <Image src={require("../../../../source/yuantu.png")} className="item_img" />
                                    <Text className="v_txt">原图</Text>
                                </View>
                                {
                                    data.map((value, index) => (
                                        <View className="item" key={index.toString()} onClick={() => changeStyle(value.value)}>
                                            <Image src={value.icon} className="item_img" />
                                            <View className="act_bottom">
                                                <IconFont name={current === value.value ? "22_yixuanzhong" : "22_touming-weixuanzhong"} size={44} />
                                                <Text className="txt">{value.name}</Text>
                                            </View>
                                        </View>
                                    ))
                                }
                            </View>
                            <View className="close_btn" onClick={_onConfirm}>
                                <Text className="txt">确定更换</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default FillStyleChange
