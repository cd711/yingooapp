import Taro, {useEffect, useState} from "@tarojs/taro";
import {Image, ScrollView, Text, View} from "@tarojs/components";
import "./index.less";
import {AtNavBar} from "taro-ui";
import IconFont from "../../components/iconfont";
import {backHandlePress, deviceInfo, getURLParamsStr, notNull, ossUrl, urlEncode} from "../../utils/common";
import {api} from "../../utils/net";
import Counter from "../../components/counter/counter";
import OrderModal from "./orederModal";
import {userStore} from "../../store/user";
import moment from "moment";
import {templateStore} from "../../store/template";
import Photos from "../me/photos";
import ENV_TYPE = Taro.ENV_TYPE;

const PrintChange: Taro.FC<any> = () => {

    const paramsObj = Taro.useRef<any>({});
    const printAttrItems = Taro.useRef<any>({});
    const [photos, setPhotos] = useState([]);
    const [visible, setVisible] = useState(false);
    const goodsInfo = Taro.useRef({});
    const [skus, setSkus] = useState([]);
    const [skuInfo, setSkuInfo] = useState<any>({});
    const [photoVisible, setPhotoPickerVisible] = useState(false);
    const [animating, setAnimating] = useState(false)

    const backPressHandle = () => {
        if (Taro.getEnv() === ENV_TYPE.WEB) {
            if (photoVisible) {
                setPhotoPickerVisible(false)
            }
        }
    }

    useEffect(() => {
        window.addEventListener("popstate", backPressHandle);

        return () => {
            window.removeEventListener("popstate", backPressHandle)
        }
    }, [])

    useEffect(() => {
        // 解析参数
        let params: any = {};

        try {
            const res = Taro.getStorageSync(`${userStore.id}_photo_${moment().date()}`);
            if (res) {
                params = JSON.parse(res)
            } else {
                if (Object.keys(templateStore.photoSizeParams).length > 0) {
                    params = templateStore.photoSizeParams
                } else {
                    Taro.showToast({title: "系统错误，请稍后重试", icon: "none"})
                }
            }
        }catch (e) {
            if (Object.keys(templateStore.photoSizeParams).length > 0) {
                params = templateStore.photoSizeParams
            } else {
                Taro.showToast({title: "系统错误，请稍后重试", icon: "none"})
            }
        }

        paramsObj.current = params || {};
        params.path = params.path.map(v => {
            return {
                ...v,
                count: 1
            }
        })
        setPhotos([...params.path] || [])

        // 读取本地存储print_attrItems
        try {
            const res = Taro.getStorageSync("print_attrItems");
            console.log("本地的：", res)
            if (res) {
                const parse = JSON.parse(res);
                console.log("本地的items：", parse)
                printAttrItems.current = parse;
            }
        } catch (e) {
            console.log("读取print_attrItems出错：", e)
        }

        backHandlePress()

    }, [])

    const onCountChange = (num, idx) => {
        const arr = [...photos];
        arr[idx].count = Number(num);
        setPhotos([...arr])
    }

    const onDeleteImg = idx => {
        const arr = [...photos];
        arr.splice(idx, 1);
        setPhotos([...arr])
    }

    function setCount(_, id) {
        const arr = [];
        arr.push(paramsObj.current.sku);
        arr.push(id);

        // const tempArr = data.attrGroup.map((v, index) => {
        //     if (notNull(v.special_show)) {
        //         return index
        //     } else {
        //         return null
        //     }
        // }) || [];
        // for (let i = 0; i < tempArr.length; i++) {
        //     if (!notNull(tempArr[i])) {
        //         const c = tempArr[i];
        //         const item = data.attrItems[c];
        //         if (item && item[0]) {
        //             arr.push(item[0].id)
        //         }
        //     }
        // }
        console.log("追加的skuID：", arr)
        setSkus([...arr])
    }

    const onCreateOrder = async () => {
        Taro.showLoading({title: "请稍后..."});
        try {
            const res = await api("app.product/info", {id: paramsObj.current.id});
            if (res.attrGroup && res.attrGroup instanceof Array) {
                res.attrGroup = res.attrGroup.map(val => ({...val, disable: !notNull(val.special_show) ? true : false}))
            }
            goodsInfo.current = res;

            let count = 0;
            for (const item of photos) {
                count += Number(item.count)
            }
            console.log("总数量：", count)
            const idx = printAttrItems.current.numIdx || 1;
            console.log("数量的下标：", idx)

            const len = printAttrItems.current.attrItems[idx].length
            for (let i = 0; i < len; i++) {
                const item = printAttrItems.current.attrItems[idx][i];
                if (parseInt(item.value) > count) {
                    let c = i - 1;
                    if (c <= 0) {
                        c = 0
                    }
                    setCount(res, printAttrItems.current.attrItems[idx][c].id)
                    break;
                } else {
                    if (i === len - 1) {
                        setCount(res, printAttrItems.current.attrItems[idx][len - 1].id)
                        break;
                    }
                }
            }


            setTimeout(() => {
                setVisible(true)
            }, 10)
        } catch (e) {
            console.log("获取商品详情出错：", e)
        }
        Taro.hideLoading()
    }

    const orderSkuChange = data => {
        console.log("sku信息：", data)
        setSkuInfo({...data})
    }

    const onSubmitOrder = () => {
        let count = 0;
        for (const item of photos) {
            count += parseInt(item.count)
        }
        if (notNull(skuInfo.id) || skuInfo.id == 0) {
            Taro.showToast({title: "请选择规格", icon: "none"})
            return
        }
        const data = {
            skuid: skuInfo.id,
            total: count,
            page: "photo",
            parintImges: photos.map(v => ({url: v.url, num: v.count}))
        }
        const paramsStr = getURLParamsStr(urlEncode(data));

        // 如果地址栏参数长度大于200，就使用本地存储加store存储
        if (paramsStr.length > 200) {
            try {
                Taro.setStorageSync(`${userStore.id}_${skuInfo.id}_${count}_${moment().date()}`, JSON.stringify(data));
                templateStore.photoParams = data;
            } catch (e) {
                console.log("本地存储失败：", e)
                templateStore.photoParams = data;
            }
            Taro.navigateTo({
                url: `/pages/template/confirm?skuid=${skuInfo.id}&total=${count}&page=photo&succ=0`
            })
        } else {
            Taro.navigateTo({
                url: `/pages/template/confirm?${paramsStr}&succ=1`
            })
        }
    }

    const onPhotoSelect = (data: {ids: [], imgs: []}) => {
        const arr = [...photos];
        for (let i = 0; i < data.ids.length; i++) {
            arr.push({
                id: data.ids[i],
                url: data.imgs[i],
                count: 1
            });
        }
        setPhotos([...arr]);
        setPhotoPickerVisible(false)
    }

    const selectPhoto = () => {
        setPhotoPickerVisible(true);
        setTimeout(() => {
            setAnimating(true)
        }, 50)
    }

    const closeSelectPhoto = () => {
        setAnimating(false);
        setTimeout(() => {
            setPhotoPickerVisible(false)
        }, 500)
    }

    return (
        <View className="printing_container">
            <AtNavBar onClickLeftIcon={() => Taro.navigateBack()}
                      color='#121314' title="照片冲印列表" border fixed
                      leftIconType={{value: 'chevron-left', color: '#121314', size: 24}}
            />
            <ScrollView scrollY className="printing_scroll_container" style={{height: deviceInfo.windowHeight - 110}}>
                <View className="printing_change_main">
                    {
                        photos.map((value, index) => (
                            <View className="print_change_item_wrap" key={index}
                                  style={{
                                      width: deviceInfo.windowWidth / 2
                                  }}>
                                <View className="print_change_item"
                                      style={{
                                          width: deviceInfo.windowWidth / 2 - 26
                                      }}
                                >
                                    <View className="print_change_del" onClick={() => onDeleteImg(index)}>
                                        <IconFont name="32_guanbi" size={32}/>
                                    </View>
                                    <Image src={ossUrl(value.url, 1)} className="img" mode="aspectFill"/>
                                    <View className="print_change_count">
                                        <Counter max={100} num={value.count}
                                                 onCounterChange={c => onCountChange(c, index)}/>
                                    </View>
                                </View>
                            </View>
                        ))
                    }
                </View>
            </ScrollView>
            <View className="print_foot" style={{justifyContent: "space-around"}}>
                <View className="btn default" onClick={selectPhoto}>
                    <Text className="txt">添加图片</Text>
                </View>
                <View className="btn" onClick={onCreateOrder}>
                    <Text className="txt">立即下单</Text>
                </View>
            </View>
            {
                visible
                    ? <OrderModal data={goodsInfo.current}
                                  isShow={visible}
                                  defaultActive={skus}
                                  onClose={() => setVisible(false)}
                                  onSkuChange={orderSkuChange}
                                  onNowBuy={onSubmitOrder}
                    />
                    : null
            }
            {
                photoVisible
                    ? <View className={`photo_picker_container ${animating ? "photo_picker_animate" : ""}`}>
                        <Photos editSelect
                                onClose={closeSelectPhoto}
                            // defaultSelect={photos.map(v => ({id: v.id, img: v.url}))}
                                onPhotoSelect={onPhotoSelect}
                        />
                    </View>
                    : null
            }
        </View>
    )
}

export default PrintChange
