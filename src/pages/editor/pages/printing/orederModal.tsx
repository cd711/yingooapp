import Taro, {useEffect, useRef, useState} from '@tarojs/taro'
import {ScrollView, Text, View} from '@tarojs/components'
import "./orderModal.less"
import {AtFloatLayout} from "taro-ui"
import isEmpty from 'lodash/isEmpty';
import {flattens, intersection} from "../../../../utils/tool";

const OrderModal: Taro.FC<any> = ({data, isShow, onClose, defaultActive = [], onSkuChange, onNowBuy}) => {

    const [price, setPrice] = useState("0");
    const [marketPrice, setMarketPrice] = useState("0");
    const [marketPriceShow, setMarketPriceShow] = useState(true);
    const [attrItems, setAttrItems] = useState([]);

    //没有库存的sku组合
    const notStockSkus = useRef([]);
    //有库存的sku组合
    const stockSkus = useRef([]);
    //筛选出的没有库存的sku
    const skuNotStock = useRef({});

    /**
     * @description: 处理价格区间
     * @param {Array} skus 组合的sku的数组(data.skus)
     * @return {*}
     */
    const handlePriceArea = (skus: Array<any>) => {
        const prices = skus.map((item) => {
            return item.price;
        })
        prices.sort(function (a, b) {
            return parseFloat(a + "") - parseFloat(b + "")
        });
        setPrice(prices[0] == prices[prices.length - 1] ? prices[0] : `${prices[0]}-${prices[prices.length - 1]}`);
    }

    /**
     * @description: 初始化sku数据,并选择默认
     * @param {Array} _  attrGroup
     * @param {Array} attrItems
     * @param {Array} skus
     * @return {*}
     */
    const initSku = (_:Array<any>,attrItems:Array<Array<any>>,skus:Array<any>) => {

        notStockSkus.current = skus.filter((item) => item.stock <= 0);
        stockSkus.current = skus.filter((item) => item.stock > 0);
        //把所有sku id归类为一个数组,并且筛选出所有sku对应的不可选的sku id
        const temp = {};
        const skuItems = attrItems.map((item) => {
            return item.map((tag) => {

                tag["selected"] = false;
                tag["over"] = false;
                const element = tag.id;
                const hasStockSkus = Array.from(new Set(flattens(stockSkus.current.filter((obj) => {
                    const vals: Array<any> = obj.value.split(",");
                    if (vals.includes(element + "")) {
                        return true;
                    }
                    return false;
                }).map((item) => {
                    return item.value.split(",")
                }))));

                const cStockSkus = Array.from(new Set(flattens(notStockSkus.current.filter((item) => {
                    const vals: Array<any> = item.value.split(",");
                    return vals.includes(element + "")
                }).map((item) => {
                    return item.value.split(",")
                }))));
                temp[element] = {};
                temp[element]["key"] = tag.name
                temp[element]["value"] = cStockSkus.filter(function (v) {
                    return hasStockSkus.indexOf(v) == -1
                });
                if (defaultActive && defaultActive.length > 0) {
                    if (defaultActive.indexOf(tag.id + "") != -1) {
                        tag["selected"] = true;
                    }
                }
                return tag
            });
        });
        skuNotStock.current = temp;
        handlePriceArea(stockSkus.current);

        if (defaultActive && defaultActive.length > 0) {
            const dsids = defaultActive.map((item) => {
                return parseInt(item + "");
            })
            selectSkuItem(dsids, skuItems)
        } else {
            setAttrItems(skuItems);
        }
    }


    const selectSkuItem = (selectIds: Array<any>, items: Array<Array<any>>) => {
        console.log("已选择的sku id", selectIds)
        let tt = [];
        for (let index = 0; index < selectIds.length; index++) {
            const element = selectIds[index];
            tt = Array.from(new Set(tt.concat(skuNotStock.current[element]["value"])));
        }
        items = items.map((item) => {
            return item.map((tag) => {
                tag["over"] = false;
                if (tt.indexOf(tag.id + "") != -1) {
                    tag["over"] = true;
                }
                return tag;
            });
        });
        setAttrItems(items);
        //当前可能所有集合
        const maybeSkus = stockSkus.current.filter((obj) => {
            const vals: Array<any> = obj.value.split(",");
            return selectIds.every(v => vals.includes(v + ""))
        })
        if (selectIds.length != data.attrItems.length) {
            handlePriceArea(maybeSkus);
            setMarketPriceShow(false);
        } else {
            let current: any = {};
            if (maybeSkus.length == 1) {
                current = maybeSkus[0];
            } else {
                const selectedCombinationSku = maybeSkus.filter((item) => {
                    const vals: Array<any> = item.value.split(",").map((item) => parseInt(item));
                    return intersection(vals, selectIds).length == data.attrItems.length
                });
                current = selectedCombinationSku[0];
            }
            if (current) {
                if (current.stock && current.stock > 0) {
                    setPrice(current.price);
                    setMarketPriceShow(true);
                    setMarketPrice(current.market_price);
                    setTimeout(() => {
                        setPrice(current.price);
                    }, 100);
                    onSkuChange && onSkuChange(current);
                } else {
                    Taro.showToast({
                        title: '库存不足',
                        icon: 'none',
                        duration: 1500
                    })
                }
            }
        }
    }

    const onSelectItem = (itemIdx,tagIdx,state,aItems) => {
        const selectIds = [];
        const items = aItems;
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
                    selectIds.push(tag.id);
                }
            }
        }
        selectSkuItem(selectIds,items)
    }


    useEffect(() => {

        if (!isEmpty(data) && data != undefined && data != null) {
            initSku(data.attrGroup, data.attrItems, data.skus)
        }
    }, [data]);


    const onSubmit = () => {
        onNowBuy && onNowBuy()
    }

    return <View className='placeOrder'>
        <AtFloatLayout isOpened={isShow} onClose={onClose}>
            <View className='float-container'>
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
                                                            onSelectItem(index,idx,!tag.selected,attrItems);
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
