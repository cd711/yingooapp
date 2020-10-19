import React, { Component } from 'react'
import { View, Text,Input } from '@tarojs/components'
import './index.less'
import IconFont from '../../components/iconfont';

export const HeaderTop: React.FC<any> = ({rightText}) => {
    return <View className='top'>
        <View className='close'>
            <IconFont name='iconguanbi' size={48} color="#121314" />
        </View>
        <View className='acount-login'>
            <Text className='text'>{rightText}</Text>
            <IconFont name='iconxiayiye1' size={48} color="#9C9DA6" />
        </View>
    </View>
}
