import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Button,ScrollView,Image } from '@tarojs/components'
import './mydoc.less'
import IconFont from '../../../../components/iconfont';
import {userStore} from "../../../../store/user";
import { observer, inject } from '@tarojs/mobx'
// import TipModal from '../../../../components/tipmodal/TipModal'
import {debuglog, deviceInfo, jumpToPrivacy, updateChannelCode} from '../../../../utils/common';
import Checkboxs from '../../../../components/checkbox/checkbox';


@inject("userStore")
@observer
export default class Origin extends Component<any,{
    tipModalShow:boolean;
    centerPartyHeight:number;
}> {

    config: Config = {
        navigationBarTitleText: '我的文档',
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
        if (process.env.TARO_ENV != 'h5') {
            Taro.createSelectorQuery().select(".nav-bar").boundingClientRect((nav_rect)=>{
                Taro.createSelectorQuery().select(".doc_bottom").boundingClientRect((bottom_rect)=>{
                    this.setState({
                        centerPartyHeight:Taro.getSystemInfoSync().windowHeight-nav_rect.height-bottom_rect.height
                    });
                }).exec();
            }).exec();
        }
    }


    render() {
        const {centerPartyHeight} = this.state;
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
                        
                        <View className='my_doc_item'>
                            <Image src={require("../../source/word.png")} className='icon'/>
                            <View className='center_party'>
                                <Text className='name'>映果操作指南.docx</Text>
                                <View className='tas'>
                                    <Text className='time'>12-08 15:33</Text>
                                    <View className='line'></View>
                                    <Text className="size">35.5KB</Text>
                                </View>
                            </View>
                            <View className='right_party'>
                                <Checkboxs isChecked/>
                            </View>
                        </View>

                        <View className='my_doc_item'>
                            <Image src={require("../../source/word.png")} className='icon'/>
                            <View className='center_party'>
                                <Text className='name'>映果操作指南.docx</Text>
                                <View className='tas'>
                                    <Text className='time'>12-08 15:33</Text>
                                    <View className='line'></View>
                                    <Text className="size">35.5KB</Text>
                                </View>
                            </View>
                            <View className='right_party'>
                                <Checkboxs isChecked/>
                            </View>
                        </View>

                    </View>
                </ScrollView>
                <View className='doc_bottom'>
                    <View className='boxs'>
                        <Button className='now_print_button'>
                            <Image className='icon' src={require("../../source/print.png")} />
                            <Text className='now_print'>立即打印</Text>
                        </Button>
                    </View>
                </View>
            </View>
        )
    }
}
