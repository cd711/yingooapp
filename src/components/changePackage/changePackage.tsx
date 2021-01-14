import Taro from '@tarojs/taro'
import {Button, ScrollView, Text, View} from '@tarojs/components'
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
    // 关闭回调
    onClose?: () => void;
    // 点击确定的回调
    onConfirm?: (current: {[key: string]: any}, index: number) => void;
    // 当套餐改变时的回调
    onChange?: (current: {[key: string]: any}, index: number) => void;
}

const SetMealSelectorModal: Taro.FC<SetMealSelectorModalProps> = props => {

    const {visible, currentSetMeal, setMealData = [], onChange, onClose, onConfirm} = props;

    const [current, setCurrent] = Taro.useState(currentSetMeal);
    const [modIndex, setIndex] = Taro.useState(0);

    Taro.useEffect(() => {
        const idx = setMealData.findIndex(v => v.id == current.id);
        setIndex(idx)
    }, [])

    const _onChange = (item, idx) => {
        setCurrent({...item});
        setIndex(idx)
        onChange && onChange(item, idx)
    }

    const _onConfirm = () => {
        onConfirm && onConfirm(current, modIndex);
        onClose && onClose()
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
                        <View className="current_package">
                            <Text className='current_package_name'>当前套餐</Text>
                            <View className='current_package_right'>
                                <Text className='num'>{currentSetMeal.value || 0}张</Text>
                                <View className='price'>
                                    <Text className='symbol'>￥</Text>
                                    <Text className='number'>{currentSetMeal.price || 0}</Text>
                                </View>
                            </View>
                        </View>
                        <View className='more_vote_package'>
                            <Text className='txt'>更多优惠套餐</Text>
                        </View>
                        <ScrollView scrollY className='vote_list_scroll'>
                            <View className='more_vote_list'>
                                {
                                    setMealData.map((item, index) => (
                                        <View className={`vote_item ${item.id == current.id ? "vote_item_active" : ""}`}
                                              key={index.toString()}
                                              onClick={() => _onChange(item, index)}>
                                            <View className='vote_left'>
                                                <Checkboxs isChecked={item.id == current.id} />
                                                <Text className='vote_offset'>{item.value}张</Text>
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
