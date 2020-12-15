import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Swiper, SwiperItem,ScrollView,Image } from '@tarojs/components'
import IconFont from '../../../../components/iconfont';
import { deviceInfo,fixStatusBarHeight, ossUrl } from '../../../../utils/common';
import {api} from '../../../../utils/net';
import './detail.less'

export default class Login extends Component<{},{
    data:any,
    currentPreImageIndex:number
}> {

    config: Config = {
        navigationBarTitleText: '商品详情'
    }

    constructor(props: any){
        super(props);
        this.state = {
            data:null,
            currentPreImageIndex:0
        }
    }
    componentDidMount(){
        const {id} = this.$router.params;
        api("app.product/info",{
            id
        }).then((res)=>{
            console.log(res);
            this.setState({
                data:res,
            })
        }).catch((e)=>{
            console.log(e);
        })
    }

    onSwiperChange = ({detail:{current}}) => {
        this.setState({
            currentPreImageIndex:current
        })
    }
    render() {
        const {data,currentPreImageIndex} = this.state;
        const image:Array<any> = data && data.image && data.image.length>0?data.image:[];
        return (
            <View className='p_detail'>
                {/* @ts-ignore */}
                <View className='nav-bar' style={fixStatusBarHeight()}>
                    <View className='left' onClick={() => {
                        Taro.navigateBack();
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314'/>
                    </View>
                    <View className='center'>
                        <Text className='title'>{this.config.navigationBarTitleText || '商品详情'}</Text>
                    </View>
                </View>
                <ScrollView scrollY className="p_detail_scroll">
                    <View className='pre_image_swiper'>
                        <Swiper indicatorDots={false}
                                className="pre_swiper"
                                style={`width:${deviceInfo.windowWidth}px;height:${deviceInfo.windowWidth}px`}
                                onChange={this.onSwiperChange}
                                current={currentPreImageIndex}>
                            {
                                image.map((item,index)=>(
                                    <SwiperItem key={index+""}>
                                        <Image lazyLoad src={ossUrl(item,2)} style={`width:${deviceInfo.windowWidth}px;height:${deviceInfo.windowWidth}px`}/>
                                    </SwiperItem>
                                ))
                            }
                        </Swiper>
                        <View className="indicator">
                            <Text className='txt'>{`${currentPreImageIndex+1}/${image.length}`}</Text>
                        </View>                     
                    </View>
                    <View className="product_info">
                        <View className='title'>
                            <Text className='txt'>{data.title}</Text>
                            <View className='hot'>
                                <Image className='icon' src={require("../../../../source/hot.png")} />
                                <Text className='rx'>热销</Text>
                            </View>
                        </View>

                        <View className='tags'>
                            <View className='item'>
                                <Text className='txt'>可加塑封</Text>
                            </View>
                            <View className='item'>
                                <Text className='txt'>皮革</Text>
                            </View>
                        </View>
                        
                        <View className='price_line'>
                            <View className='dp'>
                                <Text className='smy'>￥</Text>
                                <Text className='num'>49</Text>
                            </View>
                            <View className='ap'>
                                <Text className='txt'>￥99.9</Text>
                            </View>
                            <View className='total'>
                                <Text className='txt'>43人已抢</Text>
                            </View>
                        </View>
                    </View>
                    <View className='sku_box'>
                        <View className='item'>
                            <View className='content'>
                                <Text className='title'>规格</Text>
                                <Text className='sku'>选择 XXX</Text>
                            </View>
                            <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                        </View>
                    </View>
                </ScrollView>
            </View>
        )
    }
}
