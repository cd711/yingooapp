import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Button,ScrollView,Image } from '@tarojs/components'
import './origin.less'
import IconFont from '../../../../components/iconfont';
import {userStore} from "../../../../store/user";
import { observer, inject } from '@tarojs/mobx'
// import TipModal from '../../../../components/tipmodal/TipModal'
import {
    debuglog,
    deviceInfo,
    getTempDataContainer,
    jumpToPrivacy,
    jumpUri,
    updateChannelCode,
    documentConverPDF,
    isEmptyX,
    jumpOrderConfimPreview,
    setPageTitle
} from '../../../../utils/common';
import ScanTipModal from '../../../../components/scanTipModal/scantipmodal';
import { options,getToken } from '../../../../utils/net';


@inject("userStore")
@observer
export default class Origin extends Component<any,{
    tipModalShow:boolean;
    centerPartyHeight:number;

}> {

    config: Config = {
        navigationBarTitleText: '选择来源',
        // backgroundColor:'#F5F6F9'
    }

    constructor(props){
        super(props);
        this.state = {
            tipModalShow:false,
            centerPartyHeight:500,

        }
    }
    componentDidMount(){
        setPageTitle("选择来源")
        if(deviceInfo.env == 'h5'){
            document.title = this.config.navigationBarTitleText || "选择来源";
        }
        const {tp} = this.$router.params;
        if (!userStore.isLogin || isEmptyX(tp)) {
            Taro.navigateBack();
            return;
        }
        debuglog(this.$router.params);


        // if (process.env.TARO_ENV != 'h5') {
        //     Taro.createSelectorQuery().select(".nav-bar").boundingClientRect((nav_rect)=>{
        //         this.setState({
        //             centerPartyHeight:Taro.getSystemInfoSync().windowHeight-nav_rect.height
        //         });
        //     }).exec();
        // }
    }

    onSelectWechatFile = () => {
        Taro.chooseMessageFile({
            count:1,
            type:"file",
            success:(res)=>{
                debuglog(res);
                // console.log(res.tempFiles[0].path);

                this.uploadFileFn(res.tempFiles[0].name,res.tempFiles[0].path,(value)=>{
                    debuglog(value);
                    const {tp} = this.$router.params;
                    Taro.showLoading({title:"正在转换文档"});
                    documentConverPDF(value.id,(r)=>{
                        if (r != null && r && r.length >0) {
                            Taro.hideLoading();
                            debuglog(r);
                            Taro.showLoading({title:"正在初始化"});
                            getTempDataContainer(tp,(value)=>{
                                if (value != null) {
                                    const print_images = [];
                                    for (let index = 0; index < r.length; index++) {
                                        const element = r[index];
                                        print_images.push({
                                            url:element.file_url,
                                            num:element.page
                                        })
                                    }
                                    Object.assign(value,{
                                        print_images
                                    });
                                    Taro.hideLoading();
                                    jumpOrderConfimPreview(value);
                                } else {
                                    Taro.hideLoading();
                                    Taro.showToast({title: "初始化失败，请重试！", icon: "none",duration:1500});
                                    Taro.navigateBack();
                                }
                            })
                        } else {
                            Taro.hideLoading();
                            Taro.showToast({title: "文档转换失败，请重试！", icon: "none",duration:1800});
                            setTimeout(() => {
                                Taro.navigateTo({
                                    url:updateChannelCode(`/pages/offline/pages/doc/mydoc?tp=${tp}`)
                                })
                            }, 1810);
                        }
                    })
                })
            }
        })
    }
    uploadFileFn(name:string,path: string,callback?:(value:any)=>void) {
        let url = options.apiUrl + "common/upload";
        if (getToken()) {
            url += (url.indexOf("?") > -1 ? "&" : "?") + "token=" + getToken();
        }
        Taro.showLoading({title: "上传中..."});
        debuglog("路径",path)
        const upload = Taro.uploadFile({
            url,
            filePath: path,
            name: 'file',
            header: {
                "Access-Control-Allow-Origin": "*"
            },
            formData: {
                'type': 6,
                'name':name
            },
            success: res => {
                Taro.hideLoading();
                const jsonRes = JSON.parse(res.data)
                // console.log(jsonRes);
                if (jsonRes.code === 1) {
                    Taro.showToast({title: "上传成功", icon: "none"})
                    callback && callback(jsonRes.data);
                } else {
                    Taro.showToast({title: "上传失败", icon: "none"})
                }
            },
            fail: err => {
                debuglog("UploadFile文件上传出错：", err)
                Taro.hideLoading();
                Taro.showToast({title: "上传失败", icon: "none"})
            }
        });

        // upload.progress(res => {
        //     // 上传进度、 已上传的数据长度、 文件总长度
        //     onProgress && onProgress(res.progress, res.totalBytesSent, res.totalBytesExpectedToSend, 0)
        // })
    }
    render() {
        const {} = this.state;
        // const {id,nickname} = userStore;

        return (
            <View className='doc_origin'>
                <View className='nav-bar' style={process.env.TARO_ENV === 'h5'?"":`padding-top:${Taro.getSystemInfoSync().statusBarHeight}px;`}>
                    <View className='left' onClick={() => {
                        if (Taro.getCurrentPages().length>1) {
                            Taro.navigateBack();
                        } else {
                            jumpUri('/pages/tabbar/index/index')
                        }
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314'/>
                    </View>
                    <View className='center'>
                        <Text className='title'>{this.config.navigationBarTitleText}</Text>
                    </View>
                </View>
                <View className='origin_title'>
                    <Text className='txt'>请选择上传方式</Text>
                </View>
                <View className='origin_way_list'>
                    <View className='origin_way_item origin_way_item_green' onClick={()=>this.onSelectWechatFile()}>
                        <View className='box'>
                            <Text className='wechat_chat'>微信聊天</Text>
                            <Text className='from_chat'>从微信聊天中上传</Text>
                            <View className='push_right'>
                                <Image className='icon' src={require("../../source/right.png")} />
                            </View>
                        </View>
                        <Image className='t_wechat' src={require("../../source/t_wechat.png")} />
                        <Image className='b_wechat' src={require("../../source/wechat_chat.png")} />
                    </View>
                    <View className='origin_way_item origin_way_item_orange' onClick={()=>{
                        const {tp} = this.$router.params;
                        Taro.navigateTo({
                            url:updateChannelCode(`/pages/offline/pages/doc/mydoc?tp=${tp}`)
                        })
                    }}>
                        <View className='box'>
                            <Text className='wechat_chat'>我的文档</Text>
                            <Text className='from_chat'>从我的文档库中选择</Text>
                            <View className='push_right'>
                                <Image className='icon' src={require("../../source/right.png")} />
                            </View>
                        </View>
                        <Image className='t_wechat' src={require("../../source/t_doc.png")} />
                        <Image className='b_wechat' src={require("../../source/doc.png")} />
                    </View>
                </View>

                <ScanTipModal isShow={false}>
                    <View className='ScanTipModal_title'>
                        <Text className='txt'>设备状态不正常</Text>
                    </View>
                </ScanTipModal>

            </View>
        )
    }
}
