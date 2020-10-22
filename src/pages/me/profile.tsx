import { ComponentType } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image, Button, Input,Picker } from '@tarojs/components'
import './profile.less'
import IconFont from '../../components/iconfont';
// / npx iconfont-taro
import {userStore} from "../../store/user";
import { observer, inject } from '@tarojs/mobx'
import { AtNavBar,AtFloatLayout} from 'taro-ui'
import { api,updateLocalUserInfo } from '../../utils/net';

const sexList = [
    '保密',
    '男',
    '女',
    '其它',
]

@inject("userStore")
@observer
export default class Profile extends Component<any,{
    showNickName:boolean;
    inputNickName:string;
    showBio:boolean;
    inputBio:string
}> {

    config: Config = {
        navigationBarTitleText: '设置',
        // backgroundColor:'#F5F6F9'
    }

    constructor(props){
        super(props);
        this.state = {
            showNickName:false,
            inputNickName:"",
            showBio:false,
            inputBio:""
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

    onOkFixNickName = () => {
        const {inputNickName} = this.state;
        if (inputNickName.length>=1 && inputNickName.length<7) {
            this.updateInfo({nickname:inputNickName}).then(()=>{
                userStore.nickname = inputNickName;
                Taro.showToast({
                    title:"昵称修改成功",
                    icon:"none",
                    duration:1500
                });
                this.setState({
                    showNickName:false
                });
                updateLocalUserInfo("nickname",inputNickName);
            });
        } else {
            Taro.showToast({
                title:"昵称需要1-6个字符组成",
                icon:"none",
                duration:1500
            });
        }
    }

    onGenderFix = ({detail:{value}}) => {
        // gender
        this.updateInfo({gender:value}).then(()=>{
            userStore.gender = value;
            Taro.showToast({
                title:"修改成功",
                icon:"none",
                duration:1500
            });
            updateLocalUserInfo("gender",value);
        });
    }

    onOkBio = () => {
        const {inputBio} = this.state;
        this.updateInfo({bio:inputBio}).then(()=>{
            userStore.bio = inputBio;
            Taro.showToast({
                title:"个性签名已更新",
                icon:"none",
                duration:1500
            });
            this.setState({
                showBio:false
            });
            updateLocalUserInfo("bio",inputBio);
        });
    }

    updateInfo = (data) => {
        return new Promise<any>(async (resolve, reject)=> {
            Taro.showLoading({title:"加载中..."})
            api("user/profile",data).then(()=>{
                Taro.hideLoading();
                resolve();
            }).catch((e)=>{
                Taro.hideLoading();
                Taro.showToast({
                    title:e,
                    icon:"none",
                    duration:2000
                })
                reject(e);
            })
        })

    }

    handleClick = () => {}
    handleClose = () => {

    }
    // @ts-ignore
    render() {
        const {showNickName,inputNickName,showBio,inputBio} = this.state;
        const {id,nickname,avatar,bio,gender} = userStore;
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
                            showNickName:true,
                            inputNickName:nickname
                        })
                    }}>
                        <Text className='title'>昵称</Text>
                        <View className='right'>
                            <Text className='txt'>{nickname.length>0?nickname:""}</Text>
                            <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                        </View>
                    </View>

                    <View className='picker-item'>
                        <Picker mode='selector' range={sexList} onChange={this.onGenderFix} value={gender}>
                            <View className='item'>
                                <Text className='title'>性别</Text>
                                <View className='right'>
                                    <Text className='txt'>{sex}</Text>
                                    <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                                </View>
                            </View>
                        </Picker>
                    </View>
                    <View className='picker-item'>
                        <Picker mode='date' onChange={(e)=>{
                            console.log(e)
                        }} start="1950-01-01" end="2020-01-01" value="2020-01-01">
                            <View className='item'>
                                <Text className='title'>生日</Text>
                                <View className='right'>
                                    <Text className='txt'>1998/3/12</Text>
                                    <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                                </View>
                            </View>
                        </Picker>
                    </View>

                    <View className='item' onClick={()=>{
                        this.setState({
                            showBio:true,
                            inputBio:bio
                        })
                    }}>
                        <Text className='title'>个人签名</Text>
                        <View className='right'>
                            <Text className='txt'>{bio.length>0?bio:"点击快写一个吧!"}</Text>
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
                {/* 昵称 */}
                <View className='float-layout'>
                    <AtFloatLayout isOpened={showNickName} onClose={()=>{this.setState({showNickName:false})}}>
                        <View className='fixBox'>
                            <Input type='text' placeholder="请输入昵称" className='input' value={inputNickName} onInput={({detail:{value}})=>{
                                this.setState({inputNickName:value});
                            }} maxLength={6}/>
                            <View className='ops'>
                                <Text className='plce-text'>1-6个字符，可由中英文、数字组成</Text>
                                <Button className='ok' onClick={this.onOkFixNickName.bind(this)}>确定</Button>
                            </View>
                        </View>
                    </AtFloatLayout>
                </View>
                {/* 个性签名 */}
                <View className='float-layout'>
                    <AtFloatLayout isOpened={showBio} onClose={()=>{this.setState({showBio:false})}}>
                        <View className='fixBox'>
                            <Input type='text' placeholder="请输入个性签名" className='input' value={inputBio} onInput={({detail:{value}})=>{
                                this.setState({inputBio:value});
                            }} maxLength={10}/>
                            <View className='ops'>
                                <Text className='plce-text'>个性签名在10个字符以内</Text>
                                <Button className='ok' onClick={this.onOkBio.bind(this)}>确定</Button>
                            </View>
                        </View>
                    </AtFloatLayout>
                </View>
            </View>
        )
    }
}
