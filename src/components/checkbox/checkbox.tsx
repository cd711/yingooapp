
import Taro, { useEffect,useState } from '@tarojs/taro'
import { View, Text,Image } from '@tarojs/components'
import './checkbox.less'
import IconFont from '../iconfont';


export const Checkbox: React.FC<any> = ({onCounterChange}) => {
    // const [number,setNumber] = useState(1);
    // useEffect(()=>{
    //     onCounterChange(number)
    // },[number])
    return  <View className='xy-checkbox'>
            <IconFont name='22_touming-weixuanzhong' size={44} />
        </View>
}