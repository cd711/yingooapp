
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Button } from '@tarojs/components'
import './TipModal.less'
import { AtModal, AtModalContent, AtModalAction } from 'taro-ui'

export const TipModal: React.FC<any> = ({isShow,tip,onCancel,onOK,cancelText,okText}) => {

    return <View className='TipModal'>
    <AtModal isOpened={isShow} closeOnClickOverlay={false}>
        <AtModalContent>
            <Text className='tip-txt'>{tip}</Text>
        </AtModalContent>
        <AtModalAction> 
            <Button onClick={onCancel}>{cancelText}</Button> 
            <Button onClick={onOK}>{okText}</Button> 
        </AtModalAction>
    </AtModal>
</View>
}