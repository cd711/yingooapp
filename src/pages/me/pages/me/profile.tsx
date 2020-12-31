import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image, Button, Input,Picker } from '@tarojs/components'
import './profile.less'
import IconFont from '../../../../components/iconfont';
import {userStore} from "../../../../store/user";
import { observer, inject } from '@tarojs/mobx'
import {AtFloatLayout} from 'taro-ui'
import { api,updateLocalUserInfo } from '../../../../utils/net';
import moment from "moment";
import UploadFile from "../../../../components/Upload/Upload";
import { fixStatusBarHeight } from '../../../../utils/common';

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
        navigationBarTitleText: '个人信息',
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


    componentDidMount() {
        console.log(Taro.getSystemInfoSync())

    }

    updateInfo = (data) => {
        return new Promise<void>(async (resolve, reject)=> {
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

    onDateChange = e => {
        console.log(e.detail.value)
        const birthday = e.detail.value;
        this.updateInfo({birthday}).then(() => {
            userStore.birthday = birthday;
            Taro.showToast({
                title: "更新成功",
                icon: "none"
            });
            updateLocalUserInfo("birthday", birthday)
        })
    }

    uploadAvatar = data => {
        const avatar = data.cdnUrl;
        this.updateInfo({avatar}).then(() =>{
            userStore.avatar = avatar;
            Taro.showToast({
                title: "更新成功",
                icon: "none"
            });
            updateLocalUserInfo("avatar", avatar)
        })
    }


    render() {
        const {showNickName,inputNickName,showBio,inputBio} = this.state;
        const {nickname,avatar,bio,gender, birthday} = userStore;
        const sex = userStore.sex
        return (
            <View className='profile'>
                {/* @ts-ignore */}
                <View className='nav-bar' style={fixStatusBarHeight()}>
                    <View className='left' onClick={() => {
                        Taro.navigateBack();
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314'/>
                    </View>
                    <View className='center'>
                        <Text className='title'>{this.config.navigationBarTitleText}</Text>
                    </View>
                </View>
                <View className='base-info'>
                    <UploadFile uploadType="image" extraType={1} onChange={this.uploadAvatar}>
                        <View className='item'>
                            <Text className='title'>头像</Text>
                            <View className='right'>
                                <Image className='img' mode="aspectFill" src={avatar.length>0?avatar:require('../../../../source/defaultAvatar.png')} />
                                <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                            </View>
                        </View>
                    </UploadFile>

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
                        <Picker mode='date' onChange={this.onDateChange} start='1950-01-01' end={moment().format("YYYY-MM-DD")} value={birthday}>
                            <View className='item'>
                                <Text className='title'>生日</Text>
                                <View className='right'>
                                    <Text className='txt'>{birthday}</Text>
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
                {/*<View className='er-item'>*/}
                {/*    <Text className='title'>我的二维码</Text>*/}
                {/*    <View className='right'>*/}
                {/*        <IconFont name='24_erweima' size={48} color='#9C9DA6' />*/}
                {/*        <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />*/}
                {/*    </View>*/}
                {/*</View>*/}
                {/* 昵称 */}
                <View className='float-layout'>
                    <AtFloatLayout isOpened={showNickName} onClose={()=>{this.setState({showNickName:false})}}>
                        <View className='fixBox'>
                            <Input type='text' placeholder='请输入昵称' className='input' value={inputNickName} onInput={({detail:{value}})=>{
                                this.setState({inputNickName:value});
                            }} maxLength={6} />
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
                            <Input type='text' placeholder='请输入个性签名' className='input' value={inputBio} onInput={({detail:{value}})=>{
                                this.setState({inputBio:value});
                            }} maxLength={10} />
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
