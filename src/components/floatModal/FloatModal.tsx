
import Taro, { useState,useEffect } from '@tarojs/taro'
import { View,Text } from '@tarojs/components'
import './FloatModal.less'
import { AtFloatLayout } from "taro-ui"
import IconFont from '../iconfont';

// let n = 0;

const FloatModal: Taro.FC<any> = ({title,isShow,onClose,children}) => {
    const [isOpened,setIsOpened] = useState(false);

    useEffect(()=>{
        if (isOpened != isShow) {
            setIsOpened(isShow)
        }
    },[isShow]);
    // useEffect(()=>{
    //     if (isOpened) {
    //         n += 1;
    //     }
    //     if (!isOpened && n > 0) {
    //         n = 0;
    //         onClose && onClose();
    //     }
    // },[isOpened])

    return  <View className='xy_float_modal'>
            <View className={isOpened?'float-layout float-layout--active':'float-layout'}>
                <View className='float-layout__overlay'></View>
                <View className='float-layout__container'>
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
                </View>
            </View>
        </View>
}
export default FloatModal;
