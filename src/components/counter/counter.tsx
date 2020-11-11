
import Taro, { useEffect,useState } from '@tarojs/taro'
import { View, Text,Image } from '@tarojs/components'
import './counter.less'

const Counter: React.FC<any> = ({num,onCounterChange,onButtonClick}) => {
    const [number,setNumber] = useState(1);
    useEffect(()=>{
        if (onCounterChange) {
            onCounterChange(number);
        }
    },[number]);
    useEffect(()=>{
        if (num) {
            setNumber(num);
        }
    },[num])
    return  <View className='counter-fc'>
            <View className='reduce' onClick={(e)=>{
                e.stopPropagation();
                if (onButtonClick) {
                    onButtonClick(number>1?number-1:1);
                }
                number>1?setNumber(number-1):setNumber(1);
            }}>
                <Image src={require("../../source/reduce.png")} className='img' />
            </View>
            <Text className='num'>{number}</Text>
            <View className='add' onClick={(e)=>{
                 e.stopPropagation();
                if (onButtonClick) {
                    onButtonClick(number+1);
                }
                setNumber(number+1);
            }}>
                <Image src={require("../../source/add.png")} className='img' />
            </View>
        </View>
}
export default Counter;