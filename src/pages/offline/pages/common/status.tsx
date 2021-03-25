import Taro, {Component, Config} from '@tarojs/taro'
import {Button, Image, ScrollView, Text, View} from '@tarojs/components'
import './status.less'
import IconFont from '../../../../components/iconfont';
import {userStore} from "../../../../store/user";
import {inject, observer} from '@tarojs/mobx'
import {
    debuglog,
    deviceInfo, getURLParamsStr, getUserKey,
    isEmptyX, jumpUri, removeDuplicationForArr,
    setPageTitle,
    setTempDataContainer,
    updateChannelCode, urlEncode
} from '../../../../utils/common';
import {api} from '../../../../utils/net';
import Checkboxs from '../../../../components/checkbox/checkbox';
import LoginModal from '../../../../components/login/loginModal';
import dayjs from 'dayjs';
import PhotosEle from "../../../../components/photos/photos";
import photoStore from "../../../../store/photo";
import OfflinePrint from '../../../../utils/offlinePrint';
import Navbar from '../../../../components/navbar';
import SelectPage from './selectpage';


interface PrintNum{
    pages: number;
    queue_num: number;
}

@inject("userStore")
@observer

export default class Status extends Component<any, {
    centerPartyHeight: number;
    status_txt: string;
    wait_num: number;
    deviceSupportItems: Array<any>;
    allDeviceItems: Array<any>;
    currentSelectIndex: number;
    productInfo: any;
    visible: boolean;
    deviceStatus:number;
    printType:string;
    currentPrintState:any;
    selectPageModalShow:boolean;
    slectCopyPage:number
}> {

    config: Config = {
        navigationBarTitleText: '打印服务',
    }

    constructor(props) {
        super(props);
        this.state = {
            centerPartyHeight: 500,
            status_txt: "设备正常",
            wait_num: 0,
            deviceSupportItems: [],
            allDeviceItems: [],
            currentSelectIndex: 0,
            productInfo: null,
            visible: false,
            deviceStatus:101,
            printType:"photo",
            currentPrintState:null,
            selectPageModalShow:false,
            slectCopyPage:1
        }
    }

    componentDidMount() {
        setPageTitle("打印服务")
        const {id,printtype} = this.$router.params;
        if (isEmptyX(id)) {
            Taro.showToast({title: "参数错误，请重新扫码！", icon: 'none', duration: 1500})
        }
        if (process.env.TARO_ENV != 'h5') {
            Taro.createSelectorQuery().select(".nav-bar").boundingClientRect((nav_rect) => {
                Taro.createSelectorQuery().select(".status_bottom").boundingClientRect((bottom_rect) => {
                    this.setState({
                        centerPartyHeight: Taro.getSystemInfoSync().windowHeight - nav_rect.height - bottom_rect.height
                    });
                }).exec();
            }).exec();
        }
        if (!isEmptyX(id)) {
            this.loadData(id,printtype);
        }
    }

    loadData = (id:string,printtype?:string) => {
        Taro.showLoading({title: "加载中..."});
        OfflinePrint.terminalStatus(id).then((res)=>{
            const status = res.status;
            OfflinePrint.product(66,res,printtype).then((product)=>{
                Taro.hideLoading();
                const tmp = {};
                for (const key in product.skuItem) {
                    const element = product.skuItem[key];
                    console.log("循环类型",element.type)
                    tmp[element.type]=element.type=="doc"?res.currentPrintDoc:(element.type=="copy"?res.currentCopyDoc:res.currentPrintPhoto);
                }
                if (status>=101 && status<109) {
                    //模拟数据
                    if (process.env.NODE_ENV !== 'production') {
                        product.attrItems.push({
                            id: 365,
                            name: "复印文档",
                            value: "101001#102002,copy,,2,1,2,120001,1",
                            value_text: "",
                            type: "copy"
                        })
                        tmp["copy"] = {
                            pages: 0,
                            queue_num: 0
                        }
                    }
                    this.setState({
                        status_txt: res.status_text,
                        wait_num: tmp[product.skuItem[product.current].type].queue_num,
                        deviceSupportItems: product.skuItem,
                        allDeviceItems: product.attrItems,
                        currentSelectIndex: product.current,
                        productInfo: product.info,
                        deviceStatus:res.status,
                        printType:product.skuItem[product.current].type,
                        currentPrintState:tmp
                    })
                } else {
                    this.setState({
                        status_txt: res.status_text,
                        wait_num: tmp[product.skuItem[product.current].type].queue_num,
                        deviceStatus:res.status,
                        printType:product.skuItem[product.current].type,
                        currentPrintState:tmp
                    })
                }
            }).catch((err)=>{
                Taro.hideLoading();
                Taro.showToast({
                    title: err,
                    icon: 'none',
                    duration: 1500
                });
            })
        }).catch((e)=>{
            Taro.hideLoading();
            Taro.showToast({
                title: e,
                icon: 'none',
                duration: 1500
            });
        })
    }
    onRescanQR = () => {
        const {printtype} = this.$router.params;
        OfflinePrint.scan(printtype).then((res)=>{
            if (res.params && res.params.id) {
                this.loadData(res.params.id,printtype);
            }
        }).catch(()=>{
            Taro.showToast({title:"无法识别当前二维码",icon:"none"})
        })
    }
    onDeviceItemClick = (item) => {
        if (item.disable) {
            Taro.showToast({
                title: "当前设备不支持",
                icon: 'none',
                duration: 1500
            });
            return;
        }
        const {allDeviceItems,currentPrintState} = this.state;
        let current = 0;
        for (let index = 0; index < allDeviceItems.length; index++) {
            const element = allDeviceItems[index];
            element.checked = false;
            if (item.id == element.id) {
                element.checked = true;
                current = index;
            }
        }       
        this.setState({
            allDeviceItems,
            currentSelectIndex: current,
            printType:allDeviceItems[current].type,
            wait_num:currentPrintState[allDeviceItems[current].type].queue_num
        })
    }

    onNextStep = async () => {
        if (!userStore.isLogin) {
            userStore.showLoginModal = true;
            return;
        }
        const {allDeviceItems, currentSelectIndex, productInfo} = this.state;
        const {skus} = productInfo;
        const currentItem = allDeviceItems[currentSelectIndex];
        const currentSku = skus.find((obj) => parseInt(obj.value + "") == parseInt(currentItem.id));
        const {id} = this.$router.params;
        if (currentItem.checked) {
            if (currentItem.type == "doc") {
                const currentUnix = dayjs().unix()
                setTempDataContainer(currentUnix + "", {
                    sku_id: currentSku.id,
                    quantity: 1,
                    user_tpl_id: -2,
                    terminal_id: id,
                    print_type: "doc"
                })
                Taro.navigateTo({
                    url: updateChannelCode(`/pages/offline/pages/doc/origin?tp=${currentUnix}`)
                })
            } else if (currentItem.type == "photo") {
                this.setState({visible: true})
            } else if (currentItem.type == "copy") {
                this.setState({selectPageModalShow:true})
            }
        } else {
            Taro.showToast({title:"未选择打印类型",icon:'none',duration:2000});
        }

    }

    onPhotoSelect = async ({ids, imgs, attrs}) => {

        try {
            const path = [];
            for (let i = 0; i < ids.length; i++) {
                path.push({
                    id: ids[i],
                    url: imgs[i],
                    attr: attrs[i],
                    edited: false,
                    doc: ""
                })
            }

            const {allDeviceItems, currentSelectIndex, productInfo} = this.state;
            const {skus} = productInfo;
            const currentItem = allDeviceItems[currentSelectIndex];
            debuglog("大小：", currentItem)
            const currentSku = skus.find((obj) => parseInt(obj.value + "") == parseInt(currentItem.id));
            const {id} = this.$router.params;
            const size = currentItem.value.split(",")[2];
            const str = getURLParamsStr(urlEncode({
                // 相框尺寸
                s: size,
                id: productInfo.id,
                user_tpl_id: -2,
                terminal_id: id,
                print_type: "photo",
                sku_id: currentSku.id,
                // 跳转到照片冲印列表需要使用的参数
                o: "t"
            }))

            await photoStore.setActionParamsToServer(getUserKey(), {
                photo: {
                    path,
                    id: "",
                    sku: ""
                },
                usefulImages: removeDuplicationForArr({
                    newArr: ids.map((v, idx) => ({id: v, url: imgs[idx]})),
                    oldArr: photoStore.photoProcessParams.usefulImages
                }),
                pictureSize: size || ""
            })
            Taro.navigateTo({
                url: updateChannelCode(`/pages/editor/pages/printing/change?${str}`)
            })
        } catch (e) {
            debuglog("选图后跳转出错：", e)
        }
    }


    render() {
        const {selectPageModalShow,centerPartyHeight, status_txt, wait_num, allDeviceItems, visible, productInfo,deviceStatus,currentPrintState,printType} = this.state;
        let waitNum = "直接打印"
        if (currentPrintState) {
            const pagen = parseInt(currentPrintState[printType].pages+"")>0 ?parseInt(currentPrintState[printType].queue_num+""):0;
            waitNum = pagen>0?(printType=="doc"?(pagen*10)+"秒":(pagen*20)+"秒"):"直接打印"
        }
        const {id} = this.$router.params;
        return (
            <View className='print_status'>
                <LoginModal isTabbar={false}/>
                <View className='nav-bar'
                      style={process.env.TARO_ENV === 'h5' ? "" : `padding-top:${Taro.getSystemInfoSync().statusBarHeight}px;`}>
                    <View className='left' onClick={() => {
                        if (Taro.getCurrentPages().length>1) {
                            Taro.navigateBack();
                        } else {
                            jumpUri("/pages/tabbar/index/index",true);
                        }
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314'/>
                    </View>
                    <View className='center'>
                        <Text className='title'>{this.config.navigationBarTitleText}</Text>
                    </View>
                </View>
                <ScrollView scrollY enableFlex className='print_status_scroll'
                            style={process.env.TARO_ENV != 'h5' ? `height:${centerPartyHeight}px` : ""}>
                    <View className='print_status_container'>
                        <View className='print_status_box'>
                            <View className='device_status'>
                                <Image src='https://cdn.playbox.yingoo.com/appsource/device_print.png'
                                       className='icon'/>
                                <Text className='txt'>{status_txt}</Text>
                            </View>
                            <View className='waiting_box'>
                                <View className='waiting'>
                                    <Text className='num'>{wait_num > 0 ? wait_num : "无"}</Text>
                                    <Text className='wtip'>排队人数</Text>
                                </View>
                                <View className='time'>
                                    <Text className='ttop'>{waitNum}</Text>
                                    <Text className='ttip'>预计时间</Text>
                                </View>
                            </View>
                        </View>
                        <View className='status_item'>
                            {
                                allDeviceItems.map((item) => (
                                    <View className='print_item' key={item.id}
                                          onClick={() => this.onDeviceItemClick(item)}>
                                        <Text className='left_txt'>{item.name}</Text>
                                        <Checkboxs isChecked={item.checked} disabled unUse={item.disable}
                                                   onCheckedClick={() => this.onDeviceItemClick(item)}/>
                                    </View>
                                ))
                            }
                        </View>
                    </View>
                </ScrollView>
                <View className='status_bottom'>
                    <View className='boxs'>
                        {
                            deviceStatus>=109?<Button className='re_scan_qrcode_button' onClick={()=>this.onRescanQR()}>重新扫码</Button>:<Button className='next_step_button' onClick={() => this.onNextStep()}>下一步</Button>
                        }
                    </View>
                </View>
                {
                    visible
                        ? <View className="photo_picker_container">
                            <PhotosEle
                                editSelect={visible}
                                onClose={() => this.setState({visible: false})}
                                onPhotoSelect={this.onPhotoSelect}
                                max={parseInt(productInfo.max)}
                            />
                        </View>
                        : null
                }
                <SelectPage isShow={selectPageModalShow} onClose={()=>{
                    this.setState({selectPageModalShow:false})
                }} onChange={(n)=>{
                    this.setState({
                        slectCopyPage:n
                    })
                }} onOkButton={()=>{
                    // api("device.terminal/order", {
                    //     pages:value.page,
                    //     number:1
                    // }).then((res) => { 
                    //     Taro.hideLoading();
                    //     // {
                    //     //     "pre_order_id": "89",
                    //     //     "pages": 83,
                    //     //     "number": 57,
                    //     //     "order_price": "18",
                    //     //     "maxprint": 96
                    //     //   }
                    //     setTempDataContainer(key,Object.assign(value,res.pre_order_id));
                    // }).catch((e)=>{
                    //     Taro.hideLoading();
                    //     Taro.showToast({
                    //         title:e,
                    //         icon:"none",
                    //         duration:2000
                    //     });
                    //     setTimeout(() => {
                    //         Taro.navigateBack();
                    //     }, 2000);
                    // })
                    this.setState({selectPageModalShow:false});
                    const currentUnix = dayjs().unix()
                    const key = "order_preview_"+currentUnix;
                    setTempDataContainer(key,{
                        pages:this.state.slectCopyPage,
                        tid:id,
                        pre_order_id:"pre_xxxx",
                        number:1,
                        maxprint:200,
                        order_price:"0.05"
                    },(ok)=>{
                        if (ok) {
                            Taro.navigateTo({
                                url:updateChannelCode(`/pages/offline/pages/common/order?t=${currentUnix}`)
                            })
                        }
                    });

                }}/>
            </View>
        )
    } 
}

