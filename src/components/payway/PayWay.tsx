import Taro, { useEffect,useState } from '@tarojs/taro'
import { View, Text,Button } from '@tarojs/components'
import './PayWayModal.less';
import IconFont from '../iconfont';
import Checkboxs from '../checkbox/checkbox';


const PayWay: Taro.FC<any> = ({isCheck,icon,name,onPress}) => {
    const [isSelect,setIsSelect] = useState(false);
    useEffect(()=>{
        if (isCheck != isSelect) {
            setIsSelect(isCheck);
        }
    },[isCheck])
    return  <View className={isSelect?'xy_pay_way_item xy_pay_way_item_active':'xy_pay_way_item'} onClick={()=>{
                setIsSelect(true);
                onPress && onPress()
            }}>
            <View className='name'>
                <IconFont name={icon} size={64} />
                <Text className='txt'>{name}</Text>
            </View>
            <Checkboxs isChecked={isSelect} disabled />
        </View>
}

export default PayWay;