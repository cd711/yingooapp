import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Button,ScrollView,Image } from '@tarojs/components'
import './mydoc.less'
import IconFont from '../../../../components/iconfont';
import {userStore} from "../../../../store/user";
import { observer, inject } from '@tarojs/mobx'
// import TipModal from '../../../../components/tipmodal/TipModal'
import {
    debuglog,
    deviceInfo,
    documentConverPDF,
    getTempDataContainer,
    isEmptyX,
    jumpOrderConfimPreview,
    jumpToPrivacy,
    setPageTitle,
    updateChannelCode
} from '../../../../utils/common';
import Checkboxs from '../../../../components/checkbox/checkbox';
import { api, getToken, options } from '../../../../utils/net';
import dayjs from 'dayjs';
import { ITouchEvent } from '@tarojs/components/types/common';
import { intersection } from '../../../../utils/tool';

const uploadFileTypes = ["pdf","xls","doc","ppt","docx","xlsx","pptx"];
interface DocListData{
    id: number,
    url: string,
    imagetype: string,
    createtime:number,
    name:string,
    filesize:number,
    checked:boolean
}

@inject("userStore")
@observer
export default class Origin extends Component<any,{
    tipModalShow:boolean;
    centerPartyHeight:number;
    list:Array<DocListData>
}> {

    config: Config = {
        navigationBarTitleText: '我的文档',
        // backgroundColor:'#F5F6F9'
    }
    private onNowPrintButtonClick:(e:ITouchEvent)=>void
    constructor(props){
        super(props);
        this.state = {
            tipModalShow:false,
            centerPartyHeight:500,
            list:[],
        }
    }
    componentDidMount(){
        setPageTitle("我的文档")
        if(deviceInfo.env == 'h5'){
            document.title = this.config.navigationBarTitleText || "我的文档";
        }
        if (!userStore.isLogin) {
            if (deviceInfo.env == 'h5') {
                window.location.href = updateChannelCode("/pages/tabbar/index/index");
            } else {
                Taro.switchTab({
                    url: updateChannelCode('/pages/tabbar/index/index')
                })
            }
        }
        const {tp} = this.$router.params;
        if (isEmptyX(tp)) {
            Taro.navigateBack();
            return;
        }
        if (process.env.TARO_ENV != 'h5') {
            Taro.createSelectorQuery().select(".nav-bar").boundingClientRect((nav_rect)=>{
                Taro.createSelectorQuery().select(".doc_bottom").boundingClientRect((bottom_rect)=>{
                    this.setState({
                        centerPartyHeight:Taro.getSystemInfoSync().windowHeight-nav_rect.height-bottom_rect.height
                    });
                }).exec();
            }).exec();
        }
        this.getDocList();
    }

    getDocList = () => {
        Taro.showLoading({title:"加载中..."});
        api("app.profile/doc",{
            start:0,
            size:50,
            sort:"createtime",
            order:"desc"
        }).then((res)=>{
            Taro.hideLoading();
            res.list.map((item)=>{
                item["checked"] = false;
            })
            this.setState({
                list:res.list
            })
        }).catch(()=>{
            Taro.hideLoading();
            Taro.showToast({
                title:"请求失败，请稍后再试!",
                icon:"none",
                duration:2000
            });
            setTimeout(() => {
                Taro.navigateBack();
            }, 2000);
        })
    }

    onDocItemClick = (item:DocListData) => {
        const checked = item.checked;
        const {list} = this.state;
        list.map((value)=>{
            value.checked = false;
            if (value.id == item.id) {
                value.checked = !checked;
            }
        });
        this.onNowPrintButtonClick = (e) => {
            if (!checked) {
                debuglog(item);
                const {tp} = this.$router.params;
                Taro.showLoading({title:"正在转换文档"});
                documentConverPDF(item.id,(r)=>{
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
                        Taro.showToast({title: "文档转换失败，请重试！", icon: "none",duration:1500});
                    }
                })
            }
        }
        this.setState({
            list
        })
    }
    onSelectWechatFile = () => {
        Taro.chooseMessageFile({
            count:1,
            type:"file",
            success:(res)=>{
                if (intersection(res.tempFiles[0].name.split("."),uploadFileTypes).length==1) {
                    this.uploadFileFn(res.tempFiles[0].name,res.tempFiles[0].path,(value)=>{
                        debuglog(value);
                        this.getDocList();
                    })
                }
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
        const {centerPartyHeight,list} = this.state;
        const disable_button = list.filter((obj)=>obj.checked).length==0;
        return (
            <View className='doc_mydoc'>
                <View className='nav-bar' style={process.env.TARO_ENV === 'h5'?"":`padding-top:${Taro.getSystemInfoSync().statusBarHeight}px;`}>
                    <View className='left' onClick={() => {
                        Taro.navigateBack();
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314'/>
                    </View>
                    <View className='center'>
                        <Text className='title'>{this.config.navigationBarTitleText}</Text>
                    </View>
                </View>
                <ScrollView scrollY enableFlex className='doc_mydoc_scroll' style={process.env.TARO_ENV != 'h5'?`height:${centerPartyHeight}px`:""}>
                    <View className='my_doc_list'>
                        {
                            list.length>0?list.map((item)=>(
                                <View className='my_doc_item' key={item.id} onClick={()=>this.onDocItemClick(item)}>
                                    <Image src={`${options.sourceUrl}appsource/docicon/${item.imagetype}.png`} className='icon'/>
                                    <View className='center_party'>
                                        <Text className='name'>{item.name.length>0?item.name:`未命名.${item.imagetype}`}</Text>
                                        <View className='tas'>
                                            <Text className='time'>{dayjs.unix(item.createtime).format('YYYY-MM-DD HH:mm')}</Text>
                                            <View className='line'></View>
                                            <Text className="size">{(parseInt(item.filesize+"")/1024).toFixed(2)}KB</Text>
                                        </View>
                                    </View>
                                    <View className='right_party'>
                                        <Checkboxs isChecked={item.checked} disabled onCheckedClick={()=>this.onDocItemClick(item)}/>
                                    </View>
                                </View>
                            )):<View className='empty'>
                                <Image src={`${options.sourceUrl}appsource/empty/nophoto.png`} className='img'/>
                                <Text className='txt'>暂无素材</Text>
                                <Button className='btn' onClick={()=>this.onSelectWechatFile()}>上传素材</Button>
                            </View>
                        }
                    </View>
                </ScrollView>
                <View className='doc_bottom'>
                    <View className='boxs'>
                        <Button className={disable_button?'now_print_button now_print_button_disable':'now_print_button'} disabled={disable_button} onClick={this.onNowPrintButtonClick}>
                            <Text className='now_print'>立即打印</Text>
                        </Button>
                    </View>
                </View>
            </View>
        )
    }
}
