
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Button } from '@tarojs/components'
import './TipModal.less'
import { AtModal, AtModalContent, AtModalAction } from 'taro-ui'

export const TipModal: React.FC<any> = ({isShow,tip,onCancel,onOK}) => {

    return <View className='TipModal'>
    <AtModal isOpened={isShow} closeOnClickOverlay={false}>
        <AtModalContent>
            <Text className='tip-txt'>{tip}</Text>
        </AtModalContent>
        <AtModalAction> 
            <Button onClick={onCancel}>不退出</Button> 
            <Button onClick={onOK}>退出</Button> 
        </AtModalAction>
    </AtModal>
</View>
}