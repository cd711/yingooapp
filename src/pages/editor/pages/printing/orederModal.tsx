import Taro, {useEffect, useState} from '@tarojs/taro'
import {ScrollView, Text, View} from '@tarojs/components'
import "./orderModal.less"
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

    const tempSkuValue = [];
    const onItemSelect = (itemIdx, tagIdx, state) => {


        onSkuChange && onSkuChange(null);
        const selectIds = [];
        let items = attrItems;
        const selectItemIdxs = [];
        items[itemIdx].map((tag,idx)=>{
            tag["selected"] = false;
            if (tagIdx == idx) {
                tag["selected"] = state;
            }
            return tag;
        });

        for (let i = 0;i<items.length;i++) {
            const item = items[i];
            for (const tag of item) {
                if (tag["selected"]) {
                    selectItemIdxs.push(i);
                    selectIds.push(tag.id);
                    tempSkuValue.push(tag.id);
                }
            }
        }

        const tempSelectIds = selectIds.concat();
        if (tempSelectIds.length == items.length) {
            tempSelectIds.splice(itemIdx, 1);
            selectItemIdxs.splice(itemIdx, 1)
        }
        let tmp = [];
        const maybeSkus = skus.filter((obj)=>{
            if (tempSelectIds.length>0) {
                const vals:Array<any> = obj.value.split(",");
                return tempSelectIds.every(v=>vals.includes(v+""))
            }
            return true;
        })
        maybeSkus.filter((item)=> item.stock>0).map((item)=>{
            const vs = item.value.split(",").filter((v)=>tempSelectIds.indexOf(parseInt(v))==-1);
            tmp = tmp.concat(vs);
            return item.value
        });

        const notOverSku = Array.from(new Set(tmp));
        selectIds.sort(function(value1, value2) {
            return parseInt(value1) - parseInt(value2);
        });
        console.log(tmp,notOverSku,selectIds,tempSelectIds);
        items = items.map((item,index)=>{
            return item.map((tag)=>{
                tag["over"] = false;
                if (selectItemIdxs.indexOf(index)==-1) {
                    if (selectIds.length>1) {
                        if (notOverSku.indexOf(tag.id+"")==-1) {
                            tag["over"] = true;
                            if (tag["selected"]) {
                                selectIds.splice(index, 1);
                            }
                            tag["selected"] = false;
                        }
                    }
                }
                return tag;
            });
        });
        const skuValue = selectIds.join(',');
        setAttrItems(items);
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
            for (let i = 0; i<maybeSkus.length; i++) {
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
