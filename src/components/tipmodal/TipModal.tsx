
import Taro, {  } from '@tarojs/taro'
import { View, Text,Button } from '@tarojs/components'
import './TipModal.less'

interface TipModalProps {
    isShow: boolean;
    tip?: string;
    onCancel?: () => void;
    onOK?: () => void;
    cancelText?: string;
    okText?: string
}
const TipModal: Taro.FC<TipModalProps> = ({isShow,tip,onCancel,onOK,cancelText,okText}) => {

    return <View className={isShow?'TipModal TipModal_active':'TipModal'}>
        <View className='TipModal__overlay'></View>
        <View className='TipModal__container'>
            <View className='TipModal__content'>
                <Text className='tip-txt'>{tip}</Text>
            </View>
            <View className='TipModal__footer'>
                <View className='TipModal__action'>
                    <Button onClick={onCancel}>{cancelText || "取消"}</Button>
                    <Button onClick={onOK}>{okText || "确定"}</Button>
                </View>
            </View>
        </View>
    </View>
}

export default TipModal;
