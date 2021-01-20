
import Taro, {  } from '@tarojs/taro'
import { View, Text,Button,Image } from '@tarojs/components'
import './scanTipModal.less'
import { options } from '../../utils/net'

interface ScanTipModalProps {
    isShow: boolean;

}
const ScanTipModal: Taro.FC<ScanTipModalProps> = ({isShow,children}) => {

    return <View className={isShow?'TipModal TipModal_active':'TipModal'}>
        <View className='TipModal__overlay' />
        <View className='x_TipModal__container'>
            <View className='x_header'>
                <Image className='img' src={`${options.sourceUrl}appsource/scantip.png`} />
            </View>
            <View className='x_content'>
                {children ? children :null}
            </View>
            <View className='x_button'>
                <Button className='again_scan_button'>重新扫码</Button>
            </View>
        </View>
    </View>
}

export default ScanTipModal;
