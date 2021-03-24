import Taro, { useState } from '@tarojs/taro';
import {  PickerView, View,PickerViewColumn, Button,Text } from '@tarojs/components';
import "./selectpage.less";
import FloatModal from '../../../../components/floatModal/FloatModal';

const pages = [];
for (let index = 0; index < 50; index++) {
    pages.push(index)
    
}
const SelectPage: Taro.FC<{
    isShow:boolean;
    onClose:()=>void;
    onChange:(number)=>void;
    onOkButton:()=>void
}> = ({isShow,onClose,onChange,onOkButton}) => {

    return (
        <View className='x_select_pick'>
            <FloatModal title="请选择文档页数" isShow={isShow} onClose={onClose}>
                <View className='x_select_bd'>
                    <View className='x_select'>

                    </View>
                    <PickerView indicatorStyle='height: 48px;' style='width: 100%;' value={pages} onChange={(e)=>{
                        // @ts-ignore
                        const page = e.target.value[0];
                        onChange && onChange(page+1);
                    }}>
                        <PickerViewColumn>
                            {
                                pages.map((item,index)=>(
                                    <View className="x_select_item" key={index+""}>{item+1}页</View>
                                ))
                            }
                        </PickerViewColumn>
                    </PickerView>
                </View>
                <View className='x_select_bottom'>
                    <Button className='okButton' onClick={()=>{
                        console.log("aaaaaa")
                        onOkButton && onOkButton()
                    }}>
                        <Text className='okButtonTxt'>确定</Text>
                    </Button>
                </View>
            </FloatModal>
        </View>
    )
}

export default SelectPage;
