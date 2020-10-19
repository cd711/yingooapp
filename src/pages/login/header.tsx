import { ComponentType } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input } from '@tarojs/components'
import './index.less'
import IconFont from '../../components/iconfont';

export const HeaderTop: React.FC<any> = ({rightText}) => {
    return <View className='top'>
        <View className='close'>
            <IconFont name='guanbi' size={24} color="#121314" />
        </View>
        <View className='acount-login'>
            <Text className='text'>{rightText}</Text>
            <IconFont name='xiayiye1' size={24} color="#9C9DA6" />
        </View>
    </View>
}
