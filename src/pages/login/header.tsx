
import Taro, {  } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './index.less'
import IconFont from '../../components/iconfont';
import { convertClassName, deviceInfo, fixStatusBarHeight } from '../../utils/common';

const HeaderTop: Taro.FC<any> = ({rightText,url}) => {
    // @ts-ignore
    return <View className={convertClassName("tops")} style={deviceInfo.env === 'h5'?`padding-top:${Taro.pxTransform(40)}`:fixStatusBarHeight()}>
        <View className={convertClassName('close')} onClick={()=>{
            if (Taro.getCurrentPages().length==1) {
                Taro.reLaunch({
                    url:'/pages/index/index'
                });
            }else{
                Taro.navigateBack();
            }

        }}>
            <IconFont name='24_guanbi' size={48} color='#121314' />
        </View>
        {
            process.env.TARO_ENV === 'h5'?<View className={convertClassName('acount-login')} onClick={()=>{
                Taro.navigateTo({
                    url:url
                })
            }}>
                <Text className={convertClassName('text')}>{rightText}</Text>
                <IconFont name='16_xiayiye' size={48} color='#121314' />
            </View>:null
        }
    </View>
}

export default HeaderTop;
