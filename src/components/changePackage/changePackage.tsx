import Taro from '@tarojs/taro'
import {Button, ScrollView, Text, View, Image} from '@tarojs/components'
import './changePackage.less'
import IconFont from '../iconfont';
import Checkboxs from '../checkbox/checkbox';


interface SetMealSelectorModalProps {
    // 显隐
    visible: boolean;
    // 当前套餐信息
    currentSetMeal: {[key: string]: any};
    // 所有套餐列表
    setMealData: any[];
    // 当前图片及数量的总数
    count: number;
    // 关闭回调
    onClose?: () => void;
    // 点击确定的回调
    onConfirm?: (current: {[key: string]: any}, index: number) => void;
    // 当套餐改变时的回调
    onChange?: (current: {[key: string]: any}, index: number) => void;
}

const SetMealSelectorModal: Taro.FC<SetMealSelectorModalProps> = props => {

    const {visible, currentSetMeal, setMealData = [], onChange, onClose, onConfirm, count} = props;

    const [current, setCurrent] = Taro.useState(currentSetMeal);
    const [modIndex, setIndex] = Taro.useState(0);
    const [data, setData] = Taro.useState([]);
    const [disableIdx, setDisableIdx] = Taro.useState(-1);

    Taro.useEffect(() => {
        // 检测是否禁用
        let arr = [];
        arr = setMealData.map(value => {
            return {
                ...value,
                disable: count > parseInt(value.value)
            }
        });
        setData([...arr])

    }, [setMealData])

    Taro.useEffect(() => {
        const idx = setMealData.findIndex(v => v.id == current.id);
        setIndex(idx)
    }, [])

    const _onChange = (item, idx) => {
        if (item.disable === true) {
            return
        }
        setCurrent({...item});
        setIndex(idx)
        onChange && onChange(item, idx)
    }

    const _onConfirm = () => {
        onConfirm && onConfirm(current, modIndex);
        onClose && onClose()
    }

    const onChangeTip = idx => {
        if (idx === disableIdx) {
            setDisableIdx(-1)
        } else {
            setDisableIdx(idx)
        }
    }

    return <View className='xy_float_modal'>
        <View className={visible ? 'float-layout float-layout--active' : 'float-layout'}>
            <View className='float-layout__overlay' />
            <View className='float-layout__container'>
                <View className='xy_modal_container'>

                    <View className='title_bar'>
                        <View className='title'>
                            <Text className='txt'>更换套餐</Text>
                        </View>
                        <View className='close' onClick={() => {
                            onClose && onClose()
                        }}>
                            <IconFont name='20_guanbi' size={40} color='#121314'/>
                        </View>
                    </View>

                    <View className="vote_list_container">
                        <ScrollView scrollY className='vote_list_scroll'>
                            <View className='more_vote_list'>
                                {
                                    data.map((item, index) => (
                                        <View className={`vote_item ${item.id == current.id ? "vote_item_active" : ""}`}
                                              key={index.toString()}
                                              onClick={() => _onChange(item, index)}>
                                            <View className='vote_left'>
                                                {item.disable
                                                    ? <Image src={require("../../source/disable.png")} className="disable_img" />
                                                    : <Checkboxs isChecked={item.id == current.id} />
                                                }
                                                <View className="vote_num_txt">
                                                    <Text className={`vote_offset ${item.disable ? "delete_line" : ""}`} style={{
                                                        color: item.disable ? "#9c9da6" : "#121314"
                                                    }}>
                                                        {item.value}张
                                                    </Text>
                                                </View>
                                                {
                                                    current.value == item.value ? <Text className="current_txt">当前套餐</Text> : null
                                                }
                                                {
                                                    item.disable
                                                        ? <View className="item_popover_info" onClick={() => onChangeTip(index)}>
                                                            <View className="pop_icon">
                                                                <Image src={require("../../source/waing.png")} className="i_pop_img" />
                                                            </View>
                                                            {
                                                                disableIdx === index
                                                                    ? <View className="pop_info">
                                                                        <Text className="txt">您上传的照片数量已超过{item.value}张!</Text>
                                                                    </View>
                                                                    : null
                                                            }
                                                        </View>
                                                        : null
                                                }
                                            </View>
                                            <View className='price'>
                                                <Text className='symbol'>￥</Text>
                                                <Text className='number'>{item.price}</Text>
                                            </View>
                                        </View>
                                    ))
                                }
                            </View>
                        </ScrollView>
                    </View>
                    <View className='vote_bottom_button'>
                        <Button className='red_change_button' onClick={_onConfirm}>确定更换</Button>
                    </View>
                </View>
            </View>
        </View>
    </View>
}
export default SetMealSelectorModal;
