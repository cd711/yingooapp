import Taro from '@tarojs/taro';
import { View,Image,Text, Button } from '@tarojs/components';
import "./operation.less";
import FloatModal from '../../../../components/floatModal/FloatModal';


const OperationTip: Taro.FC<{
    isShow:boolean;
    onClose:()=>void;
    onOkButton:()=>void
}> = ({isShow,onClose,onOkButton}) => {

    return (
        <View className='x_operation_container'>
            <FloatModal title="操作提示" isShow={isShow} onClose={onClose}>
                <View className='x_operation_box'>
                    <Image src={require("../../source/copytip.png")} className='x_operation_img'/>
                    <Text className='x_operation_tip'>将所需复印的文件放到打印机上，然后点击打印</Text>
                    <Text className='x_operation_war'>（复印面朝下）</Text>
                    <View className='x_operation_button'>
                        <Button className='x_op' onClick={onOkButton}>
                            <Text>我知道了</Text>
                        </Button>
                    </View>
                </View>
            </FloatModal>
        </View>
    )
}

export default OperationTip;