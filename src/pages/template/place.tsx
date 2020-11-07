
import Taro, { useEffect, useState } from '@tarojs/taro'
import { View, Text,Button,Swiper, SwiperItem,Image,ScrollView } from '@tarojs/components'
import './place.less'
import { AtFloatLayout } from "taro-ui"
import IconFont from '../../components/iconfont'
import Counter from '../../components/counter/counter'
import Fragment from '../../components/Fragment'


// eslint-disable-next-line import/prefer-default-export
export const PlaceOrder: React.FC<any> = ({data,isShow,onClose,onButtonClose,onBuyNumberChange,onSkuChange,onAddCart,onNowBuy}) => {
    const [itemActive,setItemActive] = useState([])
    const [tags,setTags] = useState([]);
    const [price,setPrice] = useState(0);
    const [marketPrice,setMarketPrice] = useState(0);
    const [selectSku,setSelectSku] = useState({});
    const [imgs,setImgs] = useState([]);
    const onItemSelect = (idx,itemId,tagId) => {
        const items = itemActive;
        items[idx] = tagId;
        setItemActive(items);
        let temp = "";
        const skus = data.skus.filter(item=>item.value.indexOf(tagId) != -1);
        const sku = [];
        let overskus = '';
        for (let index = 0; index < skus.length; index++) {
            const iterator = skus[index];
            if (iterator.stock>0) {
                temp += temp.length>0?`${iterator.value}`:`,${iterator.value}`
            } else {
                overskus += overskus.length>0?`${iterator.value}`:`,${iterator.value}`
            }
        }
        const t = [];
        for (let index = 0; index < data.attrGroup.length; index++) {
            sku.push(items[index]?`${items[index]}`:"");
            if (index != idx) {
                tags[index]=tags[index].map((item)=>{
                    item["over"]=false;
                    if (overskus.indexOf(item.id)!=-1) {
                        item["over"] = true;
                    }
                    return item;
                });
                const tt = tags[index].filter(item=>overskus.indexOf(item.id)!=-1||temp.indexOf(item.id)!=-1);
                t.push(tt)
            } else {
                t.push(tags[index])
            }
        }
        
        if (sku.length==data.attrGroup.length) {
            
            const sk = sku.join(",");
            const a = data.skus.filter(item=>item.value == sk)[0];
            const imgs = data.imgs.filter(item=>item.value == sk)[0];
            setImgs(imgs && imgs.image && imgs.image.length>0?imgs.image:data.image)
            // console.log(imgs.image);
            if (a) {
                setPrice(a.price);
                setMarketPrice(a.market_price);
                setSelectSku(a);
            }
        }
        setTags(t);
    }
    useEffect(()=>{
        if (data) {
            data.attrItems && setTags(data.attrItems);
            data.price && setPrice(data.price);
            data.market_price && setMarketPrice(data.market_price);
            data.image && setImgs(data.image);
        }
    },[data]);
    useEffect(()=>{
        if (onSkuChange) {
            onSkuChange(selectSku);
        }
    },[selectSku])

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
                                imgs && imgs.map((item,index)=>(
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
                            <Text className='n'>{price}</Text>
                        </View>
                        <Text className='actual'>￥{marketPrice}</Text>
                    </View>
                </View>                
                <ScrollView scrollY className='scroll'>
                    <View className='param-part'>
                        {
                            data && data.attrGroup && data.attrGroup.map((item,index)=>(
                            <View className='param' key={item.id}>
                                <Text className='title'>{item.name}</Text>
                                <View className='params'>
                                    {
                                        tags && tags[index] && tags[index].map((tag)=>(
                                            <Fragment key={tag.id}>
                                                    <View className={itemActive[index]==tag.id?'item active':tag.over?'item over':'item'} onClick={()=>{
                                                        if (!tag.over) {
                                                            onItemSelect(index,item.id,tag.id)
                                                        }
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