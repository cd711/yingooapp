import { ComponentType } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './index.less'

export default class Template extends Component {
  config: Config = {
    navigationBarTitleText: '首页'
  }
  componentWillMount () { }

  componentDidMount () {
    
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  render () {
    return (
      <View className='template'>
        <Text>模板主页</Text>
      </View>
    )
  }
}
