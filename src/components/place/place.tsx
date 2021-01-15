import Taro, {useEffect, useRef, useState} from '@tarojs/taro'
import {Button, Image, ScrollView, Text, View} from '@tarojs/components'
import './place.less'
import IconFont from '../iconfont'
import Counter from '../counter/counter'
import isEmpty from 'lodash/isEmpty';
import {flattens, intersection} from '../../utils/tool'
import {debuglog} from "../../utils/common";

interface OderParams {
    //商品信息
    data: any;
    //商品类型
    productType?: string;
    //最大购买数
    maxBuyNum?: number;
    //是否显示
    isShow: boolean;
    //显示加购确定按钮
    showOkButton?: boolean;
    //默认选项 ["56","124"]
    defaultSelectIds?: Array<any>;
    //关闭回调
    onClose: () => void;
    //购买数量变化回调
    onBuyNumberChange?: (count: number) => void;
    //sku变化回调，sku为当前选择项数组，如果当前选择了所有的sku项,在skus中存在这个组合，那么skusId>0
    onSkuChange: (sku: Array<any>, skusId: number) => void;
    //添加购物车按钮回调
    onAddCart?: () => void;
    //立即购买按钮回调
    onNowBuy?: () => void;
    //确定按钮回调
    onOkButtonClick?: () => void;
    //立即制作按钮回调
    onNowButtonClick?: () => void;
    //已经选择项目回调，例如:["5寸","高清打印"]
    onNamesChange?: (name: Array<string>) => void;
    //价格变化回调,参数一实际销售价格区间或者某一个价格，参数二为市场价格，当为空字符串时，说明市场价格没有
    onPriceChange?: (price: string, marketPrice: string) => void;
    // 引用类型，"photo" | "base"
    quoteType?: "photo" | "base"
}

const PlaceOrder: Taro.FC<OderParams> = props => {

    const {
        data,
        productType = "",
        maxBuyNum = 0,
        isShow = false,
        showOkButton = false,
        defaultSelectIds,
        quoteType = "base",
        onClose, onBuyNumberChange,
        onSkuChange, onAddCart, onNowBuy, onOkButtonClick,
        onNowButtonClick, onNamesChange, onPriceChange
    } = props;

    const [price, setPrice] = useState("0");
    const [marketPrice, setMarketPrice] = useState("0");
    const [marketPriceShow, setMarketPriceShow] = useState(false);
    const [imgs, setImgs] = useState([]);
    const [attrItems, setAttrItems] = useState([]);
    const [isLoad, setIsLoad] = useState(false);

    //没有库存的sku组合
    const notStockSkus = useRef([]);
    //有库存的sku组合
    const stockSkus = useRef([]);
    //筛选出的没有库存的sku
    const skuNotStock = useRef({});

    const onSelectItem = (itemIdx, tagIdx, state, aItems) => {
        onSkuChange && onSkuChange([], 0);
        const selectIds = [];
        const items = aItems;
        items[itemIdx].map((tag, idx) => {
            tag["selected"] = false;
            if (tagIdx == idx) {
                tag["selected"] = state;
            }
            return tag;
        });

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            for (const tag of item) {
                if (tag["selected"]) {
                    selectIds.push(tag.id);
                }
            }
        }
        selectSkuItem(selectIds, items)
    }

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
        const p = prices[0] == prices[prices.length - 1] ? prices[0] : `${prices[0]}-${prices[prices.length - 1]}`
        setPrice(p);
        onPriceChange && onPriceChange(p, "")
    }

    /**
     * @description: 根据选择sku id触发相关事件
     * @param {Array} selectIds 选择的sku id
     * @param {Array} items (data.attrItems)
     * @return {*}
     */
    const selectSkuItem = (selectIds: Array<any>, items: Array<Array<any>>) => {
        debuglog("已选择的sku id", selectIds)
        let tt = [];
        for (let index = 0; index < selectIds.length; index++) {
            const element = selectIds[index];
            tt = Array.from(new Set(tt.concat(skuNotStock.current[element]["value"])));
        }
        //当前可能所有集合
        const maybeSkus = stockSkus.current.filter((obj) => {
            const vals: Array<any> = obj.value.split(",");
            return selectIds.every(v => vals.includes(v + ""))
        })
        items = items.map((item) => {
            return item.map((tag) => {
                tag["over"] = false;
                if (maybeSkus.length==0) {
                    tag["selected"] = false;
                } else {
                    if (tt.indexOf(tag.id + "") != -1) {
                        tag["over"] = true;
                    }
                }

                return tag;
            });
        });
        setAttrItems(items);

        if (maybeSkus.length==0) {
            return;
        }
        if (maybeSkus.length>1) {
            handlePriceArea(maybeSkus);
            setMarketPriceShow(false);
            onSkuChange && onSkuChange(selectIds, 0);
        } else {
            let current:any = null;
            if (maybeSkus.length == 1) {
                current = maybeSkus[0];
            } else {
                const selectedCombinationSku = maybeSkus.filter((item) => {
                    const vals: Array<any> = item.value.split(",").map((item) => parseInt(item));
                    return intersection(vals, selectIds).length == data.attrItems.length
                });
                current = selectedCombinationSku.length==1?selectedCombinationSku[0]:null;
            }
            if (current != null) {
                if (current.stock && current.stock>0) {
                    setPrice(current.price);
                    setMarketPriceShow(true);
                    setMarketPrice(current.market_price);
                    setTimeout(() => {
                        setPrice(current.price);
                    }, 100);
                    onSkuChange && onSkuChange(selectIds, current.id);
                    onPriceChange && onPriceChange(current.price, current.market_price)
                } else {
                    Taro.showToast({
                        title: '库存不足',
                        icon: 'none',
                        duration: 1500
                    })
                }
            } else {
                Taro.showToast({
                    title: '库存不足',
                    icon: 'none',
                    duration: 1500
                })
            }
        }
        if (selectIds.length > 0 && data.imgs && data.imgs.length > 0) {
            const ids = [];
            for (let i = 0; i < items.length; i++) {
                const element = items[i];
                let tid = "";
                for (let j = 0; j < element.length; j++) {
                    if (element[j]["selected"]) {
                        tid = element[j].id;
                        break;
                    }
                }
                ids.push(tid)
            }
            const imgs = data.imgs.filter((item) => item.image.length > 0 && item.value == ids.join(","));
            setImgs(imgs.length == 1 ? imgs[0].image : data.image);
        } else {
            setImgs(data.image);
        }
        const names = getNames(selectIds);
        onNamesChange && onNamesChange(names);
    }
    /**
     * @description: 初始化sku数据,并选择默认
     * @param {Array} attrGroup
     * @param {Array} attrItems
     * @param {Array} skus
     * @return {*}
     */
    const initSku = (_: Array<any>, attrItems: Array<Array<any>>, skus: Array<any>) => {
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
                if (defaultSelectIds && defaultSelectIds.length > 0) {
                    if (defaultSelectIds.indexOf(tag.id + "") != -1) {
                        tag["selected"] = true;
                    }
                }
                return tag
            });
        });
        skuNotStock.current = temp;
        handlePriceArea(stockSkus.current);

        if (defaultSelectIds && defaultSelectIds.length > 0) {
            const dsids = defaultSelectIds.map((item) => {
                return parseInt(item + "");
            })
            selectSkuItem(dsids, skuItems)
        } else {
            setAttrItems(skuItems);
        }
    }


    useEffect(() => {
        debuglog("data被初始化", data)
        if (!isEmpty(data) && data != undefined && data != null) {
            setIsLoad(true);
            initSku(data.attrGroup, data.attrItems, data.skus)
            data.image && setImgs(data.image);
        }
    }, [data]);

    const getNames = (selectIds: Array<any>) => {
        const names = [];
        const sc = skuNotStock.current;
        for (let index = 0; index < selectIds.length; index++) {
            const element = selectIds[index];
            // debuglog("选择的项目",sc[element])
            names.push(sc[element]["key"])
        }
        return names;
    }
    const _onClose = () => {
        onClose && onClose()
    }
    return <View className='placeOrder'>
        {
            isLoad ? <View className={isShow ? 'float-layout float-layout--active' : 'float-layout'}>
                <View className='float-layout__overlay' onClick={_onClose}/>
                <View className='float-layout__container'>
                    <View className='float-container'>
                        <View className='xy_info-parts'>
                            <Image src={imgs && imgs.length > 0 ? imgs[0] : ""} mode='aspectFill'
                                   className='pre_image'/>
                            <View className='info'>
                                <Text
                                    className='name'>{data && data.title ? (data.title.length > 10 ? `${data.title.substring(0, 10)}...` : data.title) : "商品名称"}</Text>
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
                            <View className='close' onClick={_onClose}>
                                <IconFont name="20_guanbi" size={40} color="#000"/>
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
                                                    attrItems && attrItems[index] && attrItems[index].map((tag, idx) => (
                                                        <View key={`${index}-${idx}`}
                                                            className={tag.over ? 'item over' : (tag.selected ? 'item active' : 'item')}
                                                            onClick={() => {
                                                                if (item.disable && item.disable === true) {
                                                                    return
                                                                }
                                                                if (!tag.over) {
                                                                    onSelectItem(index, idx, !tag.selected, attrItems);
                                                                }
                                                            }}>
                                                            <Text className='txt'>{tag.name}</Text>
                                                        </View>
                                                    ))
                                                }
                                            </View>
                                        </View>
                                    ))
                                }
                                {
                                    productType == "customized" || quoteType === "photo" ? null : <View className='buy-number'>
                                        <Text className='title'>购买数量</Text>
                                        <Counter num={1} max={maxBuyNum == 0 ? 999 : maxBuyNum}
                                                 onCounterChange={onBuyNumberChange}/>
                                    </View>
                                }
                            </View>
                        </ScrollView>

                        {
                            quoteType === "base"
                                ? showOkButton
                                ? <View className='xy_x_ops'>
                                    <Button className='red-ok-btn' onClick={onOkButtonClick}>确定</Button>
                                </View>
                                : (productType == "customized"
                                    ? <View className='xy_x_ops'>
                                        <Button className='red-ok-btn' onClick={onNowButtonClick}>立即制作</Button>
                                    </View>
                                    : <View className='xy_x_ops'>
                                        <Button className='add-cart-btn' onClick={onAddCart}>加入购物车</Button>
                                        <Button className='now-buy-btn' onClick={onNowBuy}>立即购买</Button>
                                    </View>)
                                : <View className='xy_x_ops'>
                                    <Button className='red-ok-btn' onClick={onNowBuy}>立即购买</Button>
                                </View>
                        }
                    </View>
                </View>
            </View> : null
        }

    </View>
}

export default PlaceOrder
