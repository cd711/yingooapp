import Taro, {useEffect, useState} from '@tarojs/taro'
import {ScrollView, Text, View} from '@tarojs/components'
import "../../../order/pages/template/place.less"
import {AtFloatLayout} from "taro-ui"
import IconFont from '../../../../components/iconfont'
import isEmpty from 'lodash/isEmpty';

const OrderModal: Taro.FC<any> = ({data, isShow, onClose, defaultActive = [], onSkuChange, onNowBuy}) => {

    const [price, setPrice] = useState("0");
    const [marketPrice, setMarketPrice] = useState("0");
    const [marketPriceShow, setMarketPriceShow] = useState(true);
    const [attrItems, setAttrItems] = useState([]);
    const [skus, setSkus] = useState([]);

    const initSkus = (skus) => {

        for (let index = 0; index < skus.length; index++) {
            const skuItem = skus[index];
            const skuKeyAttrs: Array<any> = skuItem.value.split(',');
            skuKeyAttrs.sort(function (value1, value2) {
                return parseInt(value1) - parseInt(value2);
            });
            skuItem.value = skuKeyAttrs.join(',');
        }

        setSkus(skus);
    }


    const selectAtteItems = (attrItems: Array<Array<any>>) => {
        const items = attrItems.map((value) => {
            return value.map((val) => {
                val["selected"] = false;
                val["over"] = false;
                for (const child of defaultActive) {
                    if (child == val.id) {
                        val["selected"] = true
                    }
                }
                return val;
            });
        });
        setAttrItems(items);
    }

    function recursionSku(arr, idArr) {
        let tempArr = [];
        const filterArr = (fnArr, idArr, current) => {
            let c = current;
            const id = idArr[c];
            if (c === fnArr.length || !id) {
                tempArr = fnArr;
                return
            } else {
                const childArr = [];
                for (let i = 0; i < fnArr.length; i++) {
                    const obj = fnArr[i];
                    if (obj.value.indexOf(id) > -1) {
                        childArr.push(obj);
                    }
                }
                c++;
                filterArr(childArr, idArr, c)
            }
        }
        filterArr(arr, idArr, 0);
        return tempArr
    }

    const onItemSelect = (itemIdx, tagIdx, state) => {

        onSkuChange && onSkuChange({});
        const selectIds = [];
        let items = [...attrItems];
        items[itemIdx].map((tag, idx) => {
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
        selectIds.sort(function (value1, value2) {
            return parseInt(value1) - parseInt(value2);
        });
        const skuValue = selectIds.join(',');

        let maybeSkus = [];

        maybeSkus = recursionSku(skus, selectIds )

        console.log("maybeSkus", maybeSkus)
        items = items.map((item) => {
            return item.map((tag) => {
                tag["over"] = false;
                if (!tag["selected"] && selectIds.length > 0) {
                    maybeSkus.map((sku) => {
                        if (sku.value.indexOf(tag.id) > -1 && parseInt(sku.stock + "") < 1) {
                            tag["over"] = true;
                        }
                    })
                }
                return tag;
            });
        });
        setAttrItems(items);
        console.log(selectIds)
        if (selectIds.length != items.length) {
            const prices = maybeSkus.map((item) => {
                return item.price;
            })
            prices.sort(function (a, b) {
                return parseFloat(a + "") - parseFloat(b + "")
            });
            setPrice(prices[0] == prices[prices.length - 1] ? prices[0] : `${prices[0]}-${prices[prices.length - 1]}`);
            setMarketPriceShow(false);
        } else {
            for (let i = 0; i < maybeSkus.length; i++) {
                const sku = maybeSkus[i];
                if (sku.value == skuValue) {
                    setPrice(sku.price);
                    setMarketPriceShow(true);
                    setMarketPrice(sku.market_price);
                    onSkuChange && onSkuChange(sku);
                    break;
                }
            }
        }
    }


    useEffect(() => {

        if (!isEmpty(data)) {
            initSkus(data.skus);
            selectAtteItems([...data.attrItems]);
            const prices = data.skus.map((item) => {
                return item.price;
            })
            prices.sort(function (a, b) {
                return parseFloat(a + "") - parseFloat(b + "")
            });
            data.price && setPrice(prices[0] == prices[prices.length - 1] ? prices[0] : `${prices[0]}-${prices[prices.length - 1]}`);
        }
    }, [data]);


    const onSubmit = () => {
        onNowBuy && onNowBuy()
    }

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
                                <View className='param' key={item.id} style={item.disable ? {display: "none"} : null}>
                                    <Text className='title'>{item.name}</Text>
                                    <View className='params'>
                                        {
                                            attrItems && attrItems[index] && attrItems[index].map((tag, idx) => {
                                                return <View
                                                    className={tag.over ? 'item over' : (tag.selected ? 'item active' : 'item')}
                                                    key={`${index}-${idx}`}
                                                    style={item.disable ? {opacity: 0.7} : null}
                                                    onClick={() => {
                                                        if (item.disable) {
                                                            return
                                                        }
                                                        if (!tag.over) {
                                                            onItemSelect(index, idx, !tag.selected)
                                                        }
                                                    }}>
                                                    <Text className='txt'>{tag.name}</Text>
                                                </View>
                                            })
                                        }
                                    </View>
                                </View>
                            ))
                        }
                    </View>
                </ScrollView>
                <View className='ops'>
                    <View className="plac_submit" onClick={onSubmit}>
                        <Text className="txt">立即购买</Text>
                    </View>
                </View>
            </View>
        </AtFloatLayout>
    </View>
}

export default OrderModal
