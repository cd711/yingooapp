import { ComponentType } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image, Button, Input } from '@tarojs/components'
import './profile.less'
import IconFont from '../../components/iconfont';
// / npx iconfont-taro
import {userStore} from "../../store/user";
import { observer, inject } from '@tarojs/mobx'
import { AtNavBar,AtFloatLayout} from 'taro-ui'


@inject("userStore")
@observer
export default class Profile extends Component<any,{
    showNickName:boolean
}> {

    config: Config = {
        navigationBarTitleText: '设置',
        // backgroundColor:'#F5F6F9'
    }

    constructor(props){
        super(props);
        this.state = {
            showNickName:false
        }
    }

    componentWillMount() { }

    componentDidMount() { 
        // alert(Taro.getSystemInfoSync().statusBarHeight);
        console.log(Taro.getSystemInfoSync())
        
    }

    componentWillUnmount() { }

    componentDidShow() { }
    
    componentDidHide() { }

    handleClick = () => {}
    handleClose = () => {

    }
    // @ts-ignore
    render() {
        const {showNickName} = this.state;
        const {id,nickname,avatar} = userStore;
        const sex = userStore.sex
        return (
            <View className='profile'>
                <AtNavBar
                    onClickLeftIcon={()=>{
                        Taro.navigateBack();
                    }}
                    color='#121314'
                    title='个人信息'
                    border={false}
                    leftIconType={{
                        value:'chevron-left',
                        color:'#121314',
                        size:24
                    }}
                />
                <View className='base-info'>
                    <View className='item'>
                        {/* @ts-ignore */}
                        <Input type='file' accept="image/*;" className='upload' onChange={(e)=>{
                            console.log(e.detail.value)
                        }}/>
                        <Text className='title'>头像</Text>
                        <View className='right'>
                            
                            <Image className='img' src={avatar.length>0?avatar:require('../../source/defaultAvatar.png')} />
                            <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                        </View>
                    </View>
                    
                    <View className='item' onClick={()=>{
                        this.setState({
                            showNickName:true
                        })
                    }}>
                        <Text className='title'>昵称</Text>
                        <View className='right'>
                            <Text className='txt'>{nickname.length>0?nickname:""}</Text>
                            <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                        </View>
                    </View>

                    <View className='item'>
                        <Text className='title'>性别</Text>
                        <View className='right'>
                            <Text className='txt'>{sex}</Text>
                            <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                        </View>
                    </View>

                    <View className='item'>
                        <Text className='title'>生日</Text>
                        <View className='right'>
                            <Text className='txt'>1998/3/12</Text>
                            <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                        </View>
                    </View>

                    <View className='item'>
                        <Text className='title'>个人签名</Text>
                        <View className='right'>
                            <Text className='txt'>你要继续努力，万事皆可期待</Text>
                            <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                        </View>
                    </View>

                </View>
                <View className='er-item'>
                    <Text className='title'>我的二维码</Text>
                    <View className='right'>
                        <IconFont name='24_erweima' size={48} color='#9C9DA6' />
                        <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                    </View>
                </View>
                <View className='float-layout'>
                    <AtFloatLayout isOpened={showNickName} onClose={()=>{this.setState({showNickName:false})}}>
                        <View className='fixBox'>
                            <Input type='text' placeholder="3-10个字符，可由中英文、数字组成" className='input'/>
                            <View className='ops'>
                                <Text className='plce-text'>3-10个字符，可由中英文、数字组成</Text>
                                <Button className='ok'>确定</Button>
                            </View>
                        </View>
                    </AtFloatLayout>
                </View>

            </View>
        )
    }
}
