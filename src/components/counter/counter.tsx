import Taro, {useEffect, useState} from '@tarojs/taro'
import {Image, Text, View} from '@tarojs/components'
import './counter.less'
import {notNull} from "../../utils/common";

interface CounterProps {
    num?: number;
    onCounterChange?: (count: number) => void;
    onButtonClick?: (count: number) => void;
    max?: number
    disabled?: boolean
}
const Counter: Taro.FC<CounterProps> = ({num, onCounterChange, onButtonClick, max, disabled = false}) => {
    const [number, setNumber] = useState<number>(1);

    useEffect(() => {
        if (onCounterChange) {
            onCounterChange(number);
        }
    }, [number]);

    useEffect(() => {
        if (!notNull(num)) {
            setNumber(num);
        }
    }, [num])

    return <View className='counter-fc'>
        <View className='reduce' onClick={(e) => {
            e.stopPropagation();
            if (onButtonClick) {
                onButtonClick(number > 1 ? number - 1 : 1);
            }
            number > 1 ? setNumber(number - 1) : setNumber(1);
        }}>
            <Image src={number>1?require("../../source/reduceActive.png"):require("../../source/reduce.png")} className='img'/>
        </View>
        <Text className='num'>{number}</Text>
        <View className='add' onClick={(e) => {
            if (!notNull(max) && num >= max) {
                return
            }
            e.stopPropagation();
            if (disabled) {
                onButtonClick && onButtonClick(number + 1)
                return;
            }
            if (onButtonClick) {
                onButtonClick(number + 1);
            }
            setNumber(number + 1);
        }}>
            <Image src={require("../../source/add.png")} className='img'/>
        </View>
    </View>
}
export default Counter;
