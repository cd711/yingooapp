import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Swiper, SwiperItem,ScrollView,Image,Button } from '@tarojs/components'
import IconFont from '../../../../components/iconfont';
import { deviceInfo,fixStatusBarHeight, notNull, ossUrl } from '../../../../utils/common';
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
    onCollected = () => {
        
    }
    onAddCart= () => {

    }
    onNowBuy = () => {

    }
    render() {
        const {data,currentPreImageIndex} = this.state;
        const image:Array<any> = data && data.image && data.image.length>0?data.image:[];
        const flag_text:Array<any> = data && !notNull(data.flag_text) ? data.flag_text:[];
        const tags_text:Array<any> = data && !notNull(data.tags_text) ? data.tags_text.slice(0,4):[];
        const attrGroup:Array<any> = data && !notNull(data.attrGroup) ? data.attrGroup:[];
        console.log()
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
                            {
                                flag_text.map((item,index)=>(
                                    <View className='hot' key={index+""}>
                                        <Image className='icon' src={require("../../../../source/hot.png")} />
                                        <Text className='rx'>{item}</Text>
                                    </View>
                                ))
                            }
                        </View>

                        <View className='tags'>
                            {
                                tags_text.map((item)=>(
                                    <View className='item' key={item.id}>
                                        <Text className='txt'>{item.name}</Text>
                                    </View>
                                ))
                            }
                        </View>
                        
                        <View className='price_line'>
                            <View className='dp'>
                                <Text className='smy'>￥</Text>
                                <Text className='num'>{data.price || "0.00"}</Text>
                            </View>
                            <View className='ap'>
                                <Text className='txt'>￥{data.market_price || "0.00"}</Text>
                            </View>
                            <View className='total'>
                                <Text className='txt'>{data.sold_count || 0}人已抢</Text>
                            </View>
                        </View>
                    </View>
                    <View className='sku_box'>
                        <View className='item'>
                            <View className='content'>
                                <Text className='title'>规格</Text>
                                <Text className='sku'>选择 {attrGroup.map((item)=>item["name"]).join("")}</Text>
                            </View>
                            <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                        </View>
                    </View>
                </ScrollView>
                <View className='product_bottom_bar'>
                    <View className='cart' onClick={()=>Taro.switchTab({url:'/pages/tabbar/cart/index'})}>
                        <IconFont name={'24_gouwuche'} size={48} color={'#707177'} />
                        <Text className='txt'>购物车</Text>
                    </View>
                    <View className='ops'>
                        <Button className='add-cart-btn' onClick={this.onAddCart}>加入购物车</Button>
                        <Button className='now-buy-btn' onClick={this.onNowBuy}>立即购买</Button>
                    </View>
                </View>

            </View>
        )
    }
}
