
import Taro, { useEffect,useState } from '@tarojs/taro'
import { View, Text,Image } from '@tarojs/components'
import './counter.less'


export const Counter: React.FC<any> = ({onCounterChange}) => {
    const [number,setNumber] = useState(1);
    useEffect(()=>{
        onCounterChange(number)
    },[number])
    return  <View className='counter-fc'>
            <View className='reduce' onClick={()=>{
                number>1?setNumber(number-1):setNumber(1)
            }}>
                <Image src={require("../../source/reduce.png")} className='img'/>
            </View>
            <Text className='num'>{number}</Text>
            <View className="add" onClick={()=>{
                setNumber(number+1)
            }}>
                <Image src={require("../../source/add.png")} className='img'/>
            </View>
        </View>
}