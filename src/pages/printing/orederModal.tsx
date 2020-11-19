import Taro, {useEffect, useState} from '@tarojs/taro'
import {ScrollView, Text, View} from '@tarojs/components'
import "../template/place.less"
import {AtFloatLayout} from "taro-ui"
import IconFont from '../../components/iconfont'
import Fragment from '../../components/Fragment'
import lodash from 'lodash';

const OrderModal: React.FC<any> = ({data, isShow, onClose, defaultActive, onSkuChange, onNowBuy}) => {

    const [itemActive, setItemActive] = useState([])
    const [tags, setTags] = useState([]);
    const [price, setPrice] = useState("0");
    const [marketPrice, setMarketPrice] = useState("0");
    const [marketPriceShow, setMarketPriceShow] = useState(true);
    const [selectSku, setSelectSku] = useState({});
    const [imgs, setImgs] = useState([]);

    useEffect(() => {
        if (defaultActive && defaultActive instanceof Array) {
            setItemActive(defaultActive)
        }
    }, [])

    const onItemSelect = (idx, _, tagId) => {
        const items = itemActive;
        items[idx] = tagId;
        setItemActive(items);
        let temp = "";
        const skus = data.skus.filter(item => item.value.indexOf(tagId) != -1);
        const sku = [];
        let overskus = '';
        for (let index = 0; index < skus.length; index++) {
            const iterator = skus[index];
            if (iterator.stock > 0) {
                temp += temp.length > 0 ? `${iterator.value}` : `,${iterator.value}`
            } else {
                overskus += overskus.length > 0 ? `${iterator.value}` : `,${iterator.value}`
            }
        }
        const t = [];
        for (let index = 0; index < data.attrGroup.length; index++) {
            sku.push(items[index] ? `${items[index]}` : "");
            if (index != idx) {
                tags[index] = tags[index].map((item) => {
                    item["over"] = false;
                    if (overskus.indexOf(item.id) != -1) {
                        item["over"] = true;
                    }
                    return item;
                });
                const tt = tags[index].filter(item => overskus.indexOf(item.id) != -1 || temp.indexOf(item.id) != -1);
                t.push(tt)
            } else {
                t.push(tags[index])
            }
        }

        if (sku.length == data.attrGroup.length) {

            const sk = sku.join(",");
            const a = data.skus.filter(item => item.value == sk)[0];
            const imgs = data.imgs.filter(item => item.value == sk)[0];
            setImgs(imgs && imgs.image && imgs.image.length > 0 ? imgs.image : data.image)
            // console.log(imgs.image);
            if (a) {
                setPrice(a.price);
                setMarketPriceShow(true);
                setMarketPrice(a.market_price);
                setSelectSku(a);
            }
        }
        setTags(t);
    }


    useEffect(() => {

        if (!lodash.isEmpty(data)) {
            data.attrItems && setTags(data.attrItems);
            const prices = data.skus.map((item) => {
                return item.price;
            })
            prices.sort(function (a, b) {
                return parseFloat(a + "") - parseFloat(b + "")
            });
            data.price && setPrice(prices[0] == prices[prices.length - 1] ? prices[0] : `${prices[0]}-${prices[prices.length - 1]}`);
            setMarketPriceShow(false);
            data.market_price && setMarketPrice(data.market_price);
            data.image && setImgs(data.image);
        }
    }, [data]);


    useEffect(() => {
        if (onSkuChange) {
            onSkuChange(selectSku);
        }
    }, [selectSku])


    return <View className='placeOrder'>
        <AtFloatLayout isOpened={isShow}>
            <View className='float-container'>
                <View className='swiper-images-warp'>
                    <View className='close' onClick={onClose}>
                        <IconFont name='20_guanbi' size={40} color='#333'/>
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
                                            tags && tags[index] && tags[index].map((tag) => (
                                                <Fragment key={tag.id}>
                                                    <View
                                                        className={itemActive[index] == tag.id ? 'item active' : tag.over ? 'item over' : 'item'}
                                                        style={item.disable ? {opacity: 0.7} : null}
                                                        onClick={() => {
                                                            if (item.disable) {
                                                                return
                                                            }
                                                            if (!tag.over) {
                                                                onItemSelect(index, item.id, tag.id)
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
                <View className='ops'>
                    <View className="submit" onClick={onNowBuy}>
                        <Text className="txt">立即购买</Text>
                    </View>
                </View>
            </View>
        </AtFloatLayout>
    </View>
}

export default OrderModal