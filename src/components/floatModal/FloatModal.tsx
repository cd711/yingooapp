
import Taro, { useState,useEffect } from '@tarojs/taro'
import { View,Text } from '@tarojs/components'
import './FloatModal.less'
import { AtFloatLayout } from "taro-ui"
import IconFont from '../iconfont';

const FloatModal: Taro.FC<any> = ({title,isShow,onClose,children}) => {
    const [isOpened,setIsOpened] = useState(false);

    useEffect(()=>{
        if (isOpened != isShow) {
            setIsOpened(isShow)
        }
    },[isShow]);

    return  <View className='xy_float_modal'>
            <AtFloatLayout isOpened={isOpened} onClose={onClose}>
                <View className='xy_modal_container'>
                    <View className='title_bar'>
                        {
                            title && title.length>0?<View className='title'>
                                <Text className='txt'>{title}</Text>
                            </View>:null
                        }
                        <View className='close' onClick={()=>{
                            setIsOpened(false)
                            onClose && onClose()
                        }}>
                            <IconFont name='20_guanbi' size={40} color='#121314' />
                        </View>
                    </View>
                    {children?children:null}
                </View>
            </AtFloatLayout>
        </View>
}
export default FloatModal;
