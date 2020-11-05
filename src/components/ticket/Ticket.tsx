
import Taro, { useEffect,useState } from '@tarojs/taro'
import { View, Text,Image } from '@tarojs/components'
import './Ticket.less';
import IconFont from '../iconfont';
import Checkbox from '../checkbox/checkbox';

const Ticket: React.FC<any> = ({isNew,isSelected,onChange}) => {
    const [isChecked,setIsChecked] = useState(false);

    useEffect(()=>{
        setIsChecked(isSelected)
    },[isSelected])

    return  <View className='xy_ticket' onClick={()=>{
                setIsChecked(!isChecked)
            }}>
        <Image src={isNew?require("../../source/ticket/newticket.png"):require("../../source/ticket/ticket.png")} className='bg' />
        <View className='content-part'>
            <View className='left-part'>
                <View className='price'>
                    <Text className='left'>¥</Text>
                    <Text className='right'>99</Text>
                </View>
                <Text className='ky'>满99可用</Text>
            </View>
            <View className='right-part'>
                <Text className='name'>TUP手机壳免费定店</Text>
                <Text className='time'>2020.10.01 -2020.10.08</Text>
                <View className='apply'>
                    <Text className='txt'>适用于全部手机型号</Text>
                    <IconFont name='16_xiangxiazhankai' size={32} color='#9C9DA6' />
                </View>
            </View>
            <Checkbox className='checkbox' isChecked={isChecked} onChange={onChange} />
        </View>
    </View>
}
export default Ticket;