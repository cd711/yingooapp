import Taro, {useEffect, useState} from "@tarojs/taro";
import {Image, ScrollView, Text, View} from "@tarojs/components";
import "./index.less";
import {AtNavBar} from "taro-ui";
import IconFont from "../../components/iconfont";
import {deviceInfo, getURLParamsStr, notNull, ossUrl, urlEncode} from "../../utils/common";
import {api} from "../../utils/net";
import OrderModal from "./orederModal";
import {userStore} from "../../store/user";
import moment from "moment";
import {templateStore} from "../../store/template";
import Photos from "../me/photos";
import ENV_TYPE = Taro.ENV_TYPE;

const PrintChange: Taro.FC<any> = () => {

    const router = Taro.useRouter();

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

    function getProductInfo() {
        return new Promise<any>((resolve, reject) => {
            api("app.product/info", {id: router.params.id}).then(res => {
                const idx = res.attrGroup.findIndex(v => v.special_show === "photosize");
                const numIdx = res.attrGroup.findIndex(v => v.special_show === "photonumber");
                if (idx > -1) {
                    // 向本地存储attrItems
                    Taro.setStorageSync("print_attrItems", JSON.stringify({
                        attrItems: res.attrItems,
                        index: idx,
                        numIdx
                    }))
                    resolve({
                        attrItems: res.attrItems,
                        index: idx,
                        numIdx
                    })
                } else {
                    console.log("初始化尺寸时没找到尺寸：", res)
                }
            }).catch(e => {
                reject(e)
            })
        })
    }

    function getRouterParams(path = []) {
        let obj = {};
        if (!router.params.sku_id) {
            Taro.showToast({
                title: "没有相关ID信息",
                icon: "none"
            })
            return {}
        }
        obj = {
            path,
            sku: router.params.sku_id,
            id: router.params.id
        }
        Taro.setStorage({
            key: `${userStore.id}_photo_${moment().date()}`,
            data: JSON.stringify(obj)
        })
        return obj
    }

    Taro.useDidShow(async () => {
        // 读取本地存储print_attrItems
        try {
            const info = await getProductInfo();
            console.log("读取本地存储print_attrItems：", info)
            printAttrItems.current = info

        } catch (e) {
            console.log("读取print_attrItems出错：", e)
        }

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
                    params = getRouterParams()
                }
            }
        }catch (e) {
            if (Object.keys(templateStore.photoSizeParams).length > 0) {
                params = templateStore.photoSizeParams
            } else {
                params = getRouterParams()
            }
        }

        console.log("读取的photo params：", params)
        paramsObj.current = params || {};
        params.path = params.path.map((v) => {
            return {
                ...v,
                count: notNull(v.count) ? 1 : parseInt(v.count),
                hasRotate: checkHasRotate(v.attr, params.sku),
            }
        })
        setPhotos([...params.path] || [])

    })

    function checkHasRotate(attribute: string, sku: number | string): boolean {
        if (router.params.id) {
            let pix = "";
            for (const item of printAttrItems.current.attrItems[Number(printAttrItems.current.index)]) {
                if (sku == item.id) {
                    pix = item.value;
                    break;
                }
            }
            if (!notNull(pix)) {
                const pixArr = pix.split("*");
                const imgPix = attribute.split("*");
                const num = Number(pixArr[0]) / Number(imgPix[1]);
                return num > 1
            }
        }
        return false
    }

    const onReducer = (prevNum, idx) => {
        let num = Number(prevNum);
        num = num - 1;
        if (num < 1) {
            num = 1
        }

        const arr = [...photos];
        arr[idx].count = Number(num);
        setPhotos([...arr])
    }

    const onAddCount = (num, idx) => {
        let _num = Number(num);
        _num = _num + 1;

        const arr = [...photos];

        let count = 0;
        for (const item of arr) {
            count += parseInt(item.count)
        }
        if (count >= Number(router.params.max)) {
            Taro.showToast({
                title: `最多打印${router.params.max}张`,
                icon: "none"
            })
        } else {
            arr[idx].count = Number(_num);
            setPhotos([...arr])
        }
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

        console.log("追加的skuID：", arr)
        setSkus([...arr])
    }

    const onCreateOrder = async () => {
        Taro.showLoading({title: "请稍后..."});
        try {
            const res = await api("app.product/info", {id: paramsObj.current.id});
            if (res.attrGroup && res.attrGroup instanceof Array) {
                res.attrGroup = res.attrGroup.map(val => ({...val, disable: !notNull(val.special_show)}))
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

        let pix = "";
        for (const item of printAttrItems.current.attrItems[Number(printAttrItems.current.index)]) {
            if (paramsObj.current.sku == item.id) {
                pix = item.value;
                break;
            }
        }

        console.log("尺寸参数：", pix)

        if (notNull(pix)) {
            Taro.showToast({
                title: "没有尺寸参数，请联系客服",
                icon: "none"
            })
            return;
        }

        if (notNull(skuInfo.id) || skuInfo.id == 0) {
            Taro.showToast({title: "请选择规格", icon: "none"})
            return
        }
        const data = {
            skuid: skuInfo.id,
            total: count,
            page: "photo",
            parintImges: photos.map(v => {
                const pixArr = pix.split("*");
                if (v.hasRotate && v.hasRotate === true) {
                    return {
                        url: v.url,
                        num: v.count,
                        style: [pixArr[0], pixArr[1], 90].join(",")
                    }
                }
                return {
                    url: v.url,
                    num: v.count,
                    style: [pixArr[0], pixArr[1], 0].join(",")
                }
            })
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

    const onPhotoSelect = (data: {ids: [], imgs: [], attrs: []}) => {
        const arr = [...photos];
        for (let i = 0; i < data.ids.length; i++) {
            arr.push({
                id: data.ids[i],
                url: data.imgs[i],
                attr: data.attrs[i],
                count: 1,
                hasRotate: checkHasRotate(data.attrs[i], paramsObj.current.sku),
                edited: false,
                doc: ""
            });
        }

        Taro.setStorage({
            key: `${userStore.id}_photo_${moment().date()}`,
            data: JSON.stringify({
                ...paramsObj.current,
                path: photos
            })
        })

        setPhotos([...arr]);
        setPhotoPickerVisible(false)
    }

    const selectPhoto = () => {
        let num = 0;
        for (const item of photos) {
            num += parseInt(item.count)
        }
        if (num >= Number(router.params.max)) {
            Taro.showToast({
                title: `最多打印${router.params.max}张`,
                icon: "none"
            })
            return
        }
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

    const onEditClick = (item ,index) => {

        let obj:any = {
            idx: index,
            cid: router.params.id,
            tplid: router.params.cid,
            status: item.edited && !notNull(item.doc) ? "t" : "f",
            tplmax: router.params.tplmax,
            img: item.url,
        };
        if (router.params.proid) {
            obj = {...obj, proid: router.params.proid}
        }
        const str = getURLParamsStr(urlEncode(obj))

        Taro.navigateTo({
            url: `/pages/editor/printedit?${str}`
        })
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
                                    <View className="print_change_img">
                                        <Image src={ossUrl(value.url, 1)} className="p_img" mode={value.hasRotate ? "aspectFill" : "aspectFill"}
                                               onClick={() => onEditClick(value, index)}
                                               style={{
                                                   transform: value.hasRotate ? "rotateZ(90deg)" : "none",
                                                   width: value.hasRotate ? 203 : 152,
                                                   height: value.hasRotate ? 152 : 203
                                               }}
                                        />
                                    </View>
                                    <View className="print_change_count">
                                        <View className='counter-fc'>
                                            <View className='reduce' onClick={() => onReducer(value.count, index)}>
                                                <Image src={require("../../source/reduce.png")} className='img'/>
                                            </View>
                                            <Text className='num'>{value.count || 1}</Text>
                                            <View className='add' onClick={() => onAddCount(value.count, index)}>
                                                <Image src={require("../../source/add.png")} className='img'/>
                                            </View>
                                        </View>
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
