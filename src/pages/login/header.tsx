
import Taro, {  } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './index.less'
import IconFont from '../../components/iconfont';

const HeaderTop: React.FC<any> = ({rightText,url}) => {
    return <View className='tops'>
        <View className='close' onClick={()=>{
            Taro.switchTab({
                url:'/pages/index/index'
            });
        }}>
            <IconFont name='24_guanbi' size={48} color='#121314' />
        </View>
        <View className='acount-login' onClick={()=>{
            Taro.navigateTo({
                url:url
            })
        }}>
            <Text className='text'>{rightText}</Text>
            <IconFont name='16_xiayiye' size={48} color='#121314' />
        </View>
    </View>
}

export default HeaderTop;
