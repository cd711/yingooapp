
import Taro, {  } from '@tarojs/taro'
import { View, Text,Button,Swiper, SwiperItem,Image,ScrollView } from '@tarojs/components'
import './place.less'
import { AtFloatLayout } from "taro-ui"
import IconFont from '../../components/iconfont'
import Counter from '../../components/counter/counter'

// eslint-disable-next-line import/prefer-default-export
export const PlaceOrder: React.FC<any> = ({isShow,onClose,images,onButtonClose,onBuyNumberChange,onAddCart,onNowBuy}) => {

    return <View className='placeOrder'>
        <AtFloatLayout isOpened={isShow} onClose={onClose}>
            <View className='float-container'>
                <View className='swiper-images-warp'>
                    <Swiper
                        indicatorColor='#000000'
                        indicatorActiveColor='#FF4966'
                        circular
                        indicatorDots>
                            {
                                images && images.map((item,index)=>(
                                    <SwiperItem className='swiper-item' key={index}>
                                        <Image src={item} mode='aspectFill' className='pre-image' />
                                    </SwiperItem>
                                ))
                            }
                    </Swiper>
                    <View className='close' onClick={onButtonClose}>
                        <IconFont name='32_guanbi' size={64} color='#333' />
                    </View>
                </View>
                <View className='info-part'>
                    <Text className='name'>嘻哈拼接纯棉圆领运动短袖</Text>
                    <View className='price'>
                        <View className='folding'>
                            <Text className='sym'>¥</Text>
                            <Text className='n'>49</Text>
                        </View>
                        <Text className='actual'>￥99.9</Text>
                    </View>
                </View>
                <ScrollView scrollY className='scroll'>
                    <View className='param-part'>
                        <View className='param'>
                            <Text className='title'>尺寸</Text>
                            <View className='params'>
                                <View className='item active'>
                                    <Text className='txt'>220*220mm</Text>
                                </View>
                                <View className='item'>
                                    <Text className='txt'>220*220mm</Text>
                                </View>
                                <View className='item'>
                                    <Text className='txt'>220*220mm</Text>
                                </View>
                            </View>
                        </View>
                        <View className='param'>
                            <Text className='title'>相纸</Text>
                            <View className='params'>
                                <View className='item active'>
                                    <Text className='txt'>20g超感纸</Text>
                                </View>
                                <View className='item'>
                                    <Text className='txt'>30g超感纸</Text>
                                </View>
                            </View>
                        </View>
                        <View className='param'>
                            <Text className='title'>相纸</Text>
                            <View className='params'>
                                <View className='item active'>
                                    <Text className='txt'>20g超感纸</Text>
                                </View>
                                <View className='item'>
                                    <Text className='txt'>30g超感纸</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <View className='buy-number'>
                    <Text className='title'>购买数量</Text>
                    <Counter onCounterChange={onBuyNumberChange} />
                </View>
                <View className='ops'>
                    <Button className='add-cart-btn' onClick={onAddCart}>加入购物车</Button>
                    <Button className='now-buy-btn' onClick={onNowBuy}>立即购买</Button>
                </View>
            </View>
        </AtFloatLayout>
    </View>
}