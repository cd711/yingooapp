
import Taro, { useEffect, useState } from '@tarojs/taro'
import { View, Text,Button,Swiper, SwiperItem,Image,ScrollView } from '@tarojs/components'
import './place.less'
import { AtFloatLayout } from "taro-ui"
import IconFont from '../../components/iconfont'
import Counter from '../../components/counter/counter'
import Fragment from '../../components/Fragment'

// eslint-disable-next-line import/prefer-default-export
export const PlaceOrder: React.FC<any> = ({data,isShow,onClose,images,onButtonClose,onBuyNumberChange,onAddCart,onNowBuy}) => {
    const [itemActive,setItemActive] = useState([])
    const [tags,setTags] = useState([]);
    const [hasSkus,setHasSkus] = useState("")
    const onItemSelect = (idx,itemId,tagId) => {
        const items = itemActive;
        items[idx] = `${itemId},${tagId}`
        setItemActive(items);
        let temp = "";
        const skus = data.skus;
        for (const iterator of skus) {
            if (iterator.value.indexOf(tagId) != -1) {
                if (iterator.stock>0) {
                    temp += `${iterator.value},`
                }
            }
        }
        setHasSkus(temp);
        

        console.log(itemId,tagId,temp)
    }
    useEffect(()=>{
        if (data && data.attrItems) {
            setTags(data.attrItems)
        }
    },[data])

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
                    <Text className='name'>{data.title}</Text>
                    <View className='price'>
                        <View className='folding'>
                            <Text className='sym'>¥</Text>
                            <Text className='n'>{data.price}</Text>
                        </View>
                        <Text className='actual'>￥{data.market_price}</Text>
                    </View>
                </View>
                <ScrollView scrollY className='scroll'>
                    <View className='param-part'>
                        {
                            data && data.attrGroup && data.attrGroup.map((item,index)=>(
                            <View className='param' key={item.id}>
                                <Text className='title'>{item.name}</Text>
                                <View className='params'>
                                    {/* <View className='item active'>
                                        <Text className='txt'>220*220mm</Text>
                                    </View> */}
                                    {
                                        tags && tags[index] && tags[index].map((tag)=>(
                                            <Fragment key={tag.id}>
                                                    <View className={itemActive[index]==`${item.id},${tag.id}`?'item active':'item'} onClick={()=>{
                                                        onItemSelect(index,item.id,tag.id)
                                                    }}>
                                                        <Text className='txt'>{tag.name}</Text>
                                                    </View>
                                            </Fragment>
 
                                        ))
                                    }
                                </View>
                            </View>
                            ))
                        }
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