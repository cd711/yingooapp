
import Taro, {  } from '@tarojs/taro'
import { View, Text,Button } from '@tarojs/components'
import './TipModal.less'

interface TipModalProps {
    isShow: boolean;
    title?: string;
    tip?: string;
    onCancel?: () => void;
    onOK?: () => void;
    cancelText?: string;
    okText?: string
}
const TipModal: Taro.FC<TipModalProps> = ({isShow,tip,title, onCancel,onOK,cancelText,okText}) => {

    const _onOk = () => {
        onOK && onOK();
        onCancel && onCancel();
    }

    return <View className={isShow?'TipModal TipModal_active':'TipModal'}>
        <View className='TipModal__overlay' />
        <View className='TipModal__container'>
            <View className='TipModal__content'>
                {title ? <Text className="title">{title}</Text> : null}
                <Text className='tip-txt' style={{
                    fontSize: title ? "14px" : "16px",
                    padding: title ? "0 24px" : "0",
                    color: title ? "#9c9da6" : "#121314",
                    textAlign: title ? "center" : "left"
                }}>{tip}</Text>
            </View>
            <View className='TipModal__footer'>
                <View className='TipModal__action'>
                    <Button onClick={onCancel}>{cancelText || "取消"}</Button>
                    <Button onClick={_onOk}>{okText || "确定"}</Button>
                </View>
            </View>
        </View>
    </View>
}

export default TipModal;
