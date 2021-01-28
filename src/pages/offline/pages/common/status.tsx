import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Button,ScrollView,Image } from '@tarojs/components'
import './status.less'
import IconFont from '../../../../components/iconfont';
import {userStore} from "../../../../store/user";
import { observer, inject } from '@tarojs/mobx'
// import TipModal from '../../../../components/tipmodal/TipModal'
import {
    addOrderConfimPreviewData,
    debuglog,
    deviceInfo,
    isEmptyX,
    jumpToPrivacy,
    setPageTitle,
    setTempDataContainer,
    updateChannelCode
} from '../../../../utils/common';
import { api } from '../../../../utils/net';
import Checkboxs from '../../../../components/checkbox/checkbox';
import LoginModal from '../../../../components/login/loginModal';
import {observe} from 'mobx';
import dayjs from 'dayjs';

@inject("userStore")
@observer
export default class Status extends Component<any,{
    centerPartyHeight:number;
    status_txt:string;
    wait_num:number;
    deviceSupportItems:Array<any>;
    allDeviceItems:Array<any>;
    currentSelectIndex:number;
    productInfo:any
}> {

    config: Config = {
        navigationBarTitleText: '打印服务',
        // backgroundColor:'#F5F6F9'
    }

    constructor(props){
        super(props);
        this.state = {
            centerPartyHeight:500,
            status_txt:"设备正常",
            wait_num:0,
            deviceSupportItems:[],
            allDeviceItems:[],
            currentSelectIndex:0,
            productInfo:null
        }
    }
    componentDidMount(){
        setPageTitle("打印服务")
        if(deviceInfo.env == 'h5'){
            document.title = this.config.navigationBarTitleText || "打印服务";
        }
        const {id} = this.$router.params;
        if (isEmptyX(id)) {
            Taro.showToast({title:"参数错误，请重新扫码！",icon:'none',duration:1500})
        }
        if (process.env.TARO_ENV != 'h5') {
            Taro.createSelectorQuery().select(".nav-bar").boundingClientRect((nav_rect)=>{
                Taro.createSelectorQuery().select(".status_bottom").boundingClientRect((bottom_rect)=>{
                    this.setState({
                        centerPartyHeight:Taro.getSystemInfoSync().windowHeight-nav_rect.height-bottom_rect.height
                    });
                }).exec();
            }).exec();
        }
        if (!isEmptyX(id)) {
            this.loadData();
        }
    }
    loadData = () => {
        const {id} = this.$router.params;
        Taro.showLoading({title:"加载中..."});
        api("device.terminal/status",{
            terminal_id:id
        }).then((res)=>{
            api("app.product/info",{
                id:49
            }).then((result)=>{
                Taro.hideLoading();
                const attrItems=result.attrItems.length>0?result.attrItems[0]:[];
                const skuItem = [];
                let current = 0;
                for (let index = 0; index < attrItems.length; index++) {
                    const element = attrItems[index];
                    const v = element.value.split(",");
                    const sku = v.length>0?v[0].split("#"):[];
                    const tt = sku.filter((s)=>res.peripheral_feature.indexOf(parseInt(s+""))>-1);
                    let is = false;
                    element["type"] = v.length>1?v[1]:"";
                    element["disable"] = true;
                    if (tt.length == sku.length) {
                        if (skuItem.length == 0) {
                            is = true;
                        }
                        element["disable"] = false
                        skuItem.push(element)
                    }
                    if (is) {
                        current = index;
                    }
                    element["checked"] = is;
                }
                this.setState({
                    status_txt:res.status_text,
                    wait_num:parseInt(res.queue_num+""),
                    deviceSupportItems:skuItem,
                    allDeviceItems:attrItems,
                    currentSelectIndex:current,
                    productInfo:result
                })
                debuglog(result,res)
            }).catch((err)=>{
                Taro.hideLoading();
                debuglog(err)
            })
        }).catch((e)=>{
            Taro.hideLoading();
            debuglog(e);
        });
    }
    onDeviceItemClick = (item) => {
        if (item.disable) {
            Taro.showToast({
                title:"当前设备不支持",
                icon:'none',
                duration:1500
            });
            return;
        }
        const {allDeviceItems} = this.state;
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
            currentSelectIndex:current
        })
    }

    onNextStep = () => {
        if (!userStore.isLogin) {
            userStore.showLoginModal = true;
            return;
        }
        const {allDeviceItems,currentSelectIndex,productInfo} = this.state;
        const {skus} = productInfo;
        const currentItem = allDeviceItems[currentSelectIndex];
        if (currentItem.type=="doc") {
            const currentSku = skus.find((obj)=>parseInt(obj.value+"")==parseInt(currentItem.id));
            const currentUnix = dayjs().unix()
            const {id} = this.$router.params;
            setTempDataContainer(currentUnix+"",{
                sku_id:currentSku.id,
                quantity:1,
                user_tpl_id:-2,
                terminal_id:id
            })
            Taro.navigateTo({
                url:updateChannelCode(`/pages/offline/pages/doc/origin?tp=${currentUnix}`)
            })
        }
    }


    render() {
        const {centerPartyHeight,status_txt,wait_num,allDeviceItems} = this.state;
        return (
            <View className='print_status'>
                <LoginModal isTabbar={false}/>
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
                <ScrollView scrollY enableFlex className='print_status_scroll' style={process.env.TARO_ENV != 'h5'?`height:${centerPartyHeight}px`:""}>
                    <View className='print_status_container'>
                        <View className='print_status_box'>
                            <View className='device_status'>
                                <Image src='https://cdn.playbox.yingoo.com/appsource/device_print.png' className='icon'/>
                                <Text className='txt'>{status_txt}</Text>
                            </View>
                            <View className='waiting_box'>
                                <View className='waiting'>
                                    <Text className='num'>{wait_num>0?wait_num:"无"}</Text>
                                    <Text className='wtip'>排队人数</Text>
                                </View>
                                <View className='time'>
                                    <Text className='ttop'>直接打印</Text>
                                    <Text className='ttip'>预计时间</Text>
                                </View>
                            </View>
                        </View>
                        <View className='status_item'>
                            {
                                allDeviceItems.map((item)=>(
                                    <View className='print_item' key={item.id} onClick={()=>this.onDeviceItemClick(item)}>
                                        <Text className='left_txt'>{item.name}</Text>
                                        <Checkboxs isChecked={item.checked} disabled unUse={item.disable} onCheckedClick={()=>this.onDeviceItemClick(item)}/>
                                    </View>
                                ))
                            }
                        </View>
                    </View>
                </ScrollView>
                <View className='status_bottom'>
                    <View className='boxs'>
                        <Button className='next_step_button' onClick={()=>this.onNextStep()}>下一步</Button>
                    </View>
                </View>
            </View>
        )
    }
}
