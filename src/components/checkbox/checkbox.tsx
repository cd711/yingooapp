
import Taro, {  } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './checkbox.less'
import IconFont from '../iconfont';


const Checkbox: React.FC<any> = ({}) => {
    // const [number,setNumber] = useState(1);
    // useEffect(()=>{
    //     onCounterChange(number)
    // },[number])
    return  <View className='xy-checkbox'>
            <IconFont name='22_touming-weixuanzhong' size={44} />
        </View>
}
export default Checkbox;