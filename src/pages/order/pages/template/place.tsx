import Taro, {useEffect, useState} from '@tarojs/taro'
import {Button, Image, ScrollView, Swiper, SwiperItem, Text, View} from '@tarojs/components'
import './place.less'
import IconFont from '../../../../components/iconfont'
import Counter from '../../../../components/counter/counter'
import Fragment from '../../../../components/Fragment'
import isEmpty from 'lodash/isEmpty';

// eslint-disable-next-line import/prefer-default-export
export const PlaceOrder: Taro.FC<any> = ({data, isShow = false, selectedSkuId,selectedSku,onClose, onBuyNumberChange, onSkuChange, onAddCart, onNowBuy}) => {

    const [price, setPrice] = useState("0");
    const [marketPrice, setMarketPrice] = useState("0");
    const [marketPriceShow, setMarketPriceShow] = useState(false);
    const [imgs, setImgs] = useState([]);
    const [skus,setSkus] = useState([]);
    const [attrItems,setAttrItems] = useState([]);
    
    let currentSku = null;
    useEffect(() => {
        if (!isEmpty(data)) {
            initSkus(data.skus);
            selectAtteItems(currentSku,data.attrItems);
            const prices = data.skus.map((item) => {
                return item.price;
            })
            prices.sort(function (a, b) {
                return parseFloat(a + "") - parseFloat(b + "")
            });
            data.price && setPrice(prices[0] == prices[prices.length - 1] ? prices[0] : `${prices[0]}-${prices[prices.length - 1]}`);
            data.image && setImgs(data.image);
        }
    }, [data]);

    const initSkus = (skus) => {
        let currentValue = "";
        if (selectedSku) {
            const skuKeyAttr:Array<any> = selectedSku.split(',');
            skuKeyAttr.sort(function(value1, value2) {
                return parseInt(value1) - parseInt(value2);
            });
            currentValue = skuKeyAttr.join(',');
        }
        for (let index = 0; index < skus.length; index++) {
            const skuItem = skus[index];
            const skuKeyAttrs:Array<any> = skuItem.value.split(',');
            skuKeyAttrs.sort(function(value1, value2) {
                return parseInt(value1) - parseInt(value2);
            });
            skuItem.value = skuKeyAttrs.join(',');
            if (selectedSkuId && parseInt(skuItem.id+"") == parseInt(selectedSkuId+"")) {
                currentSku = skuItem;
            }
            if (currentValue.length>0 && currentValue == skuItem.value) {
                currentSku = skuItem;
            }
        }
        setSkus(skus);
    }

    const selectAtteItems = (sku,attrItems:Array<Array<any>>) => {
        const items = attrItems.map((value)=>{
            return value.map((val)=>{
                val["selected"] = false;
                val["over"] = false;
                if (sku && sku.value && sku.value.indexOf(val.id)>-1) {
                    val["selected"] = true;
                    if (parseInt(sku.stock+"")>0) {
                        val["over"] = false;
                    } else {
                        val["over"] = true;
                        val["selected"] = false;
                    }
                }
                return val;
            });
        });
        setAttrItems(items);
    }
    const onSelectItem = (itemIdx,tagIdx,state) => {
        const selectIds = [];
        let items = attrItems;
        items[itemIdx].map((tag,idx)=>{
            tag["selected"] = false;
            if (tagIdx == idx) {
                tag["selected"] = state;
            }
            return tag;
        });
        for (const item of items) {
            for (const tag of item) {
                if (tag["selected"]) {
                    selectIds.push(tag.id);
                }
            }
        }
        selectIds.sort(function(value1, value2) {
            return parseInt(value1) - parseInt(value2);
        });
        let skuValue = selectIds.join(',');
        const currentSkus = skus.filter((obj)=>{
            if (selectIds.length>0) {
                return obj.value.indexOf(skuValue)>-1
            }
            return false;
        });
        items = items.map((item,idx)=>{
            return item.map((tag)=>{
                tag["over"] = false;
                for (const sku of currentSkus) {
                    if (sku.value.indexOf(tag.id)>-1 && parseInt(sku.stock+"")<=0 && idx != itemIdx) {
                        tag["over"] = true;
                    }
                }
                return tag;
            });
        });
        console.log(items)
        setAttrItems(items);
        if (selectIds.length != items.length) {
            const prices = currentSkus.map((item) => {
                return item.price;
            })
            prices.sort(function (a, b) {
                return parseFloat(a + "") - parseFloat(b + "")
            });
            setPrice(prices[0] == prices[prices.length - 1] ? prices[0] : `${prices[0]}-${prices[prices.length - 1]}`);
        }
        
        currentSkus.map((sku)=>{
            if (selectIds.length == items.length && sku.value == skuValue) {
                setPrice(sku.price);
                setMarketPriceShow(true);
                setMarketPrice(sku.market_price);
                onSkuChange && onSkuChange(sku);
            }
        });
    }

    return <View className='placeOrder'>
        <View className={isShow?'float-layout float-layout--active':'float-layout'}>
            <View className='float-layout__overlay' />
            <View className='float-layout__container'>
                <View className='float-container'>
                    <View className='swiper-images-warp'>
                        {
                            imgs && imgs.length > 0 ? <Swiper
                                indicatorColor='#000000'
                                indicatorActiveColor='#FF4966'
                                circular
                                indicatorDots
                                style="height:440rpx;">
                                {
                                    imgs && imgs.map((item, index) => (
                                        <SwiperItem className='swiper-item' key={index+""}>
                                            <Image src={item} mode='aspectFill' className='pre-image'/>
                                        </SwiperItem>
                                    ))
                                }
                            </Swiper> : null
                        }

                        <View className='close' onClick={onClose}>
                            <IconFont name='32_guanbi' size={64} color='#333'/>
                        </View>
                    </View>
                    <View className='info-part'>
                        <Text className='name'>{data.title}</Text>
                        <View className='price'>
                            <View className='folding'>
                                <Text className='sym'>¥</Text>
                                <Text className='n'>{price}</Text>
                            </View>
                            {
                                marketPriceShow ? <Text className='actual'>￥{marketPrice}</Text> : null
                            }

                        </View>
                    </View>
                    <ScrollView scrollY className='scroll'>
                        <View className='param-part'>
                            {
                                data && data.attrGroup && data.attrGroup.map((item, index) => (
                                    <View className='param' key={item.id}>
                                        <Text className='title'>{item.name}</Text>
                                        <View className='params'>
                                            {
                                                attrItems && attrItems[index] && attrItems[index].map((tag,idx) => (
                                                    <Fragment key={tag.id}>
                                                        <View
                                                            className={tag.over ?'item over':(tag.selected?'item active' :'item')}
                                                            onClick={() => {
                                                                if (!tag.over) {
                                                                    // onItemSelect(index, item.id, tag.id);
                                                                    onSelectItem(index,idx,!tag.selected);
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
                        <Counter num={1} onCounterChange={onBuyNumberChange}/>
                    </View>
                    <View className='ops'>
                        <Button className='add-cart-btn' onClick={onAddCart}>加入购物车</Button>
                        <Button className='now-buy-btn' onClick={onNowBuy}>立即购买</Button>
                    </View>
                </View>
            </View>
        </View>
        {/* <AtFloatLayout isOpened={isShow}>

        </AtFloatLayout> */}
    </View>
}
