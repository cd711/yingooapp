
import Taro, {  } from '@tarojs/taro'
import { View, Text,Button } from '@tarojs/components'
import './TipModal.less'


const TipModal: Taro.FC<any> = ({isShow,tip,onCancel,onOK,cancelText,okText}) => {

    return <View className={isShow?'TipModal TipModal_active':'TipModal'}>
        <View className='TipModal__overlay'></View>
        <View className='TipModal__container'>
            <View className='TipModal__content'>
                <Text className='tip-txt'>{tip}</Text>
            </View>
            <View className='TipModal__footer'>
                <View className='TipModal__action'>
                    <Button onClick={onCancel}>{cancelText}</Button>
                    <Button onClick={onOK}>{okText}</Button>
                </View>
            </View>
        </View>
    </View>
}

export default TipModal;
