
import Taro, { useEffect,useState } from '@tarojs/taro'
import { View, Text,Image } from '@tarojs/components'
import './Ticket.less';
import IconFont from '../iconfont';
import Checkboxs from '../checkbox/checkbox';
import moment from "moment";
import { convertClassName } from '../../utils/common';

const Ticket: Taro.FC<any> = ({isNew, hasCheckBox = false,isSelected, onChange, ticket,children}) => {
    const [showDes,setShowDes] = useState(false)
    useEffect(() => {
        // console.log(ticket)

    }, [])


    useEffect(() => {
        // console.log(isSelected)
    }, [isSelected])


    const onSelect = () => {
        onChange && onChange(ticket)
    }

    return  <View className='xy_ticket' onClick={onSelect}>
        <Image src={isNew?require("../../source/ticket/newticket.png"):require("../../source/ticket/ticket.png")} className='bg' />
        <View className='content-part'>
            <View className='left-part'>
                <View className='price'>
                    <Text className='left'>¥</Text>
                    <Text className='right'>{ticket.money}</Text>
                </View>
                <Text className='ky'>满{ticket.order_min_amount}可用</Text>
            </View>
            <View className='right-part'>
                <Text className='name'>{ticket.name}</Text>
                <Text className='time'>
                    {ticket && ticket.use_start_time?`${moment.unix(ticket.use_start_time).format("YYYY-MM-DD")} - ${moment.unix(ticket.use_end_time).format("YYYY-MM-DD")}`:""}
                </Text>
                <View className='apply' onClick={(e)=>{
                    e.stopPropagation();
                    // console.log(ticket.remark)
                    if (ticket.description) {
                        setShowDes(!showDes)
                    }
                }}>
                    <Text className='txt'>{ticket.desc}</Text>
                    <IconFont name='16_xiangxiazhankai' size={32} color='#9C9DA6' />
                </View>
            </View>
            {
                hasCheckBox ? <View className='checkbox'><Checkboxs isChecked={isSelected} disabled /></View> : null
            }
            {
                children ? children : null
            }

        </View>
        {
            showDes?<View className='remark_box'>
                <Text className='ticket_remark'>{ticket.description}</Text>
            </View>:null
        }
    </View>
}
export default Ticket;
