
import Taro, {  } from '@tarojs/taro'
import { View, Image, Button } from '@tarojs/components'
import './finishModal.less'
import { options } from '../../../../utils/net'

interface TipModalProps {
    isShow: boolean;
    onOk:()=>void
}
const FinishModal: Taro.FC<TipModalProps> = ({isShow,onOk}) => {



    return <View className={isShow?'TipModal TipModal_active':'TipModal'}>
        <View className='TipModal__overlay' />
        <View className='TipModal__container'>
            <Image src={`${options.sourceUrl}appsource/printover.svg`}  className='TipModal__image'/>
            <View className='finish_modal_bottom'>
                <Button className='i_konw_button' onClick={()=>onOk && onOk()}>我知道了</Button>
            </View>
        </View>
    </View>
}

export default FinishModal;
