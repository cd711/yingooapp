
import Taro, { useState,useEffect } from '@tarojs/taro'
import { View,Image,Text, Button } from '@tarojs/components'
import './addbuy.less'
import IconFont from '../iconfont';
import Checkboxs from '../checkbox/checkbox';
import Counter from '../counter/counter';


const AddBuy: Taro.FC<{

}> = ({}) => {


    return  <View className='xy_add_buy'>
            <Checkboxs isChecked={false} onChange={()=>{}}/>
            <Image className='pre_image' src ="" />

            <View className='xy_add_buy_center'>
                <View className='xy_p_title'>
                    <View className='xy_top'>
                        <Text className='xy_txt'>5寸轻奢北欧风相框</Text>
                    </View>
                    <View className='xy_detail'>
                        <Text className='xy_txt'>详情</Text>
                        <IconFont name='20_xiayiye' size={30} color='#009EE7'/>
                    </View>
                </View>
                <View className='xy_bottom'>
                    <View className='xy_price'>
                        <View className='dp'>
                            <Text className='smy'>￥</Text>
                            <Text className='num'>15.00</Text>
                        </View>
                        <View className='ap'>
                            <Text className='ac'>原价：</Text>
                            <Text className='n'>￥20.00</Text>
                        </View>
                    </View>
                    <Button className='add_buy_btn'>加购</Button>
                </View>
            </View>

            
            {/* <Counter num={1} /> */}
        </View>
}
export default AddBuy;
