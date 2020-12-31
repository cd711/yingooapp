import Taro, {useEffect, useState} from '@tarojs/taro'
import {Button, Image, ScrollView, Swiper, SwiperItem, Text, View} from '@tarojs/components'
import './place.less'
import IconFont from '../../../../components/iconfont'
import Counter from '../../../../components/counter/counter'
import Fragment from '../../../../components/Fragment'
import isEmpty from 'lodash/isEmpty';

// eslint-disable-next-line import/prefer-default-export
export const PlaceOrder: Taro.FC<any> = ({data, productType = "",maxBuyNum = 0,isShow = false, showOkButton = false, selectedSkuId,selectedSku,defalutSelectIds,onClose, onBuyNumberChange, onSkuChange, onAddCart, onNowBuy,onOkButtonClick,onNowButtonClick}) => {

    const [price, setPrice] = useState("0");
    const [marketPrice, setMarketPrice] = useState("0");
    const [marketPriceShow, setMarketPriceShow] = useState(false);
    const [imgs, setImgs] = useState([]);
    const [skus,setSkus] = useState([]);
    const [attrItems,setAttrItems] = useState([]);
    
    let currentSku = null;

    useEffect(()=>{
        console.log(skus,"哈哈哈哈")
    },[skus])
    const initData = (skus,sku,attrItems:Array<Array<any>>) => {
        const ts = [...skus];
        let currentValue = "";
        if (selectedSku) {
            const skuKeyAttr:Array<any> = selectedSku.split(',');
            skuKeyAttr.sort(function(value1, value2) {
                return parseInt(value1) - parseInt(value2);
            });
            currentValue = skuKeyAttr.join(',');
        }
        for (let index = 0; index < ts.length; index++) {
            const skuItem = ts[index];
            const skuKeyAttrs:Array<any> = skuItem.value.split(',');
            skuKeyAttrs.sort(function(value1, value2) {
                return parseInt(value1) - parseInt(value2);
            });
            skuItem.value = skuKeyAttrs.join(',');
            console.log(selectedSkuId)
            if (selectedSkuId && parseInt(skuItem.id+"") == parseInt(selectedSkuId+"")) {
                currentSku = skuItem;
            }
            if (currentValue.length>0 && currentValue == skuItem.value) {
                currentSku = skuItem;
            }
        }
        setSkus([...ts]);
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        selectAtteItems(sku,attrItems,[...ts])
        
    }

    const selectAtteItems = (sku,attrItems:Array<Array<any>>,skusa) => {
        const items = attrItems.map((value)=>{
            return value.map((val)=>{
                val["selected"] = false;
                val["over"] = false;
                if (defalutSelectIds && defalutSelectIds.length==0) {
                    if (sku && sku.value && sku.value.indexOf(val.id)>-1) {
                        val["selected"] = true;
                        if (parseInt(sku.stock+"")>0) {
                            val["over"] = false;
                        } else {
                            val["over"] = true;
                            val["selected"] = false;
                        }
                    }
                }
                return val;
            });
        });
        setAttrItems(items);
        if (defalutSelectIds && defalutSelectIds.length>0) {
            for (let i = 0;i<data.attrItems.length;i++) {
                const item = data.attrItems[i];
                for (let j = 0;j<item.length;j++) {
                    const tag = item[j];
                    if (defalutSelectIds.indexOf(tag.id)!=-1) {
                        onSelectItem(i,j,true,items,skusa);
                    }
                }
            }
            const names = getNames(items);
            onClose && onClose(names)
        }
    }

    const tempSkuValue = [];
    const onSelectItem = (itemIdx,tagIdx,state,aItems,skusa = []) => {
        onSkuChange && onSkuChange(null);
        const selectIds = [];
        let items = aItems;
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
        if (tempSelectIds.length == items.length && items.length > 1) {
            tempSelectIds.splice(itemIdx, 1);
            selectItemIdxs.splice(itemIdx, 1)
        }
        let tmp = [];
        const mskus = skus.length>0?skus:skusa
        const maybeSkus = mskus.filter((obj)=>{
            if (tempSelectIds.length>0 || items.length==1) {
                const vals:Array<any> = obj.value.split(",");
                console.log("aaa",vals)
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
        items = items.map((item,index)=>{
            return item.map((tag,idx)=>{
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
                console.log(sku.value == skuValue)
                if (sku.value == skuValue) {
                    setPrice(sku.price);
                    setMarketPriceShow(true);
                    setMarketPrice(sku.market_price);
                    onSkuChange && onSkuChange(sku);
                    break;
                }
            }
        }
        if (selectIds.length>0 && data.imgs && data.imgs.length>0) {
            const ids = [];
            for (let i = 0; i<items.length; i++) {
                const element = items[i];
                let tid = "";
                for (let j = 0; j<element.length;j++) {
                    if(element[j]["selected"]){
                        tid = element[j].id;
                        break;
                    }
                }
                ids.push(tid)
            }
            const imgs = data.imgs.filter((item)=>item.image.length>0 && item.value == ids.join(","));
            setImgs(imgs.length==1?imgs[0].image:data.image);
        } else {
            setImgs(data.image);
        }
    }
    useEffect(() => {
        if (!isEmpty(data) && data != undefined && data != null) {
            initData(data.skus,currentSku,data.attrItems);
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
    const getNames = (attrItems:Array<any>) => {
        let names = [];
        for (let i = 0; i<attrItems.length; i++) {
            const element = attrItems[i];
            let tid = "";
            for (let j = 0; j<element.length;j++) {
                if(element[j]["selected"]){
                    tid = element[j].name;
                    break;
                }
            }
            names.push(tid);
        }
        let n = 0;
        const ns = [];
        for (let i = 0; i<names.length; i++) {
            const item = names[i];
            if (item == "") {
                n += 1;
                ns.push(data.attrGroup[i].name)
            }
        }
        if (n == attrItems.length) {
            names = [];
        }
        if (n>0 && n<attrItems.length) {
            names = ns;
        }
        return names;
    }
    const _onClose = () => {
        const names = getNames(attrItems);
        onClose && onClose(names)
    }
    return <View className='placeOrder'>
        <View className={isShow?'float-layout float-layout--active':'float-layout'}>
            <View className='float-layout__overlay' onClick={_onClose}/>
            <View className='float-layout__container'>
                <View className='float-container'>
                    <View className='info-part'>
                        <Image src={imgs && imgs.length > 0?imgs[0]:""} mode='aspectFill' className='pre_image' onClick={()=>{
                            Taro.previewImage({
                                current:imgs && imgs.length > 0?imgs[0]:"",
                                urls:imgs && imgs.length > 0?imgs:[]
                            })
                        }}/>
                        <View className='info'>
                            <Text className='name'>{ data && data.title ? (data.title.length>10?`${data.title.substring(0,10)}...`:data.title):"商品名称"}</Text>
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
                                                                    onSelectItem(index,idx,!tag.selected,attrItems);
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
                    {
                        productType == "customized"?null:<View className='buy-number'>
                            <Text className='title'>购买数量</Text>
                            <Counter num={1} max={maxBuyNum==0?999:maxBuyNum} onCounterChange={onBuyNumberChange}/>
                        </View>
                    }
                    
                    {
                        showOkButton ?<View className='ops'>
                            <Button className='red-ok-btn' onClick={onOkButtonClick}>确定</Button>
                        </View>:(productType=="customized"?<View className='ops'>
                            <Button className='red-ok-btn' onClick={onNowButtonClick}>立即制作</Button>
                        </View>:<View className='ops'>
                            <Button className='add-cart-btn' onClick={onAddCart}>加入购物车</Button>
                            <Button className='now-buy-btn' onClick={onNowBuy}>立即购买</Button>
                        </View>)
                    }
                </View>
            </View>
        </View>
        {/* <AtFloatLayout isOpened={isShow}>

        </AtFloatLayout> */}
    </View>
}
