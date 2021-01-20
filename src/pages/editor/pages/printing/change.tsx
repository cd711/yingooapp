import Taro, {useEffect, useRef, useState} from "@tarojs/taro";
import {Image, ScrollView, Text, View} from "@tarojs/components";
import "./index.less";
import {AtNavBar} from "taro-ui";
import IconFont from "../../../../components/iconfont";
import {
    debounce,
    debuglog,
    deviceInfo, findPictureSizeForID,
    getURLParamsStr,
    getUserKey,
    jumpOrderConfimPreview,
    jumpToPrintEditor,
    notNull,
    removeDuplicationForArr,
    shareAppExtends,
    sleep,
    updateChannelCode,
    urlEncode,
    useDebounceFn
} from "../../../../utils/common";
import {api, options} from "../../../../utils/net";
import {PhotoParams} from "../../../../modal/modal";
import PhotosEle from "../../../../components/photos/photos";
import photoStore from "../../../../store/photo";
import LoginModal from "../../../../components/login/loginModal";
import {userStore} from "../../../../store/user";
import Discount from "../../../../components/discount";
import PlaceOrder from "../../../../components/place/place";
import SetMealSelectorModal from "../../../../components/changePackage/changePackage";
import TipModal from "../../../../components/tipmodal/TipModal";
import FillStyleModal from "./fillStyleModal";
import FillStyleChange from "./fillStyleChangeModal";


const PrintChange: Taro.FC<any> = () => {

    const router = Taro.useRouter();

    const [photos, setPhotos] = useState([]);
    const [visible, setVisible] = useState(false);
    const goodsInfo = useRef<any>({});
    const useMoreThan = useRef<any>({});

    // 列表每个ITem的宽高
    const [itemStyle, setItemStyle] = useState<{width: number, height: number}>({width: deviceInfo.windowWidth / 2 - 26, height: 203});

    // sku子项ID列表
    const [skus, setSkus] = useState<any[]>([]);
    // skus ID， 已选好所有子项sku的大项ID
    const [skuInfoID, setSkuInfoID] = useState<any>(0);
    const [photoVisible, setPhotoPickerVisible] = useState(false);
    const [animating, setAnimating] = useState(false);
    const _imgstyle = useRef("");

    const [fillStyleStatus, setFillStyleStatus] = useState(false);

    const [fillStyle, setFillStyle] = useState<{style: "fill" | "allowBlank", exclude: boolean}>({style: "fill", exclude: true});
    const [changeFill, setFillStatus] = useState(false);
    // 只有从商品详情页跳转过来才会为true
    const [detailStatus, setDetailStatus] = useState(false);
    const skuArr = useRef([]);

    const [pictureSize, setPictureSize] = useState<number>(0);
    const [describe, setDescribe] = useState<string>("");
    // 图片数量状态   1:低于{min}张、2：刚好满足{min}/{max}的值、3：最大{max}的值、4：{min}{max}值相等
    const [countStatus, setCountStatus] = useState<1 | 2 | 3 | 4>(1);
    // 根据当前的总数要展示的SKU价格
    // @ts-ignore
    const [price, setPrice] = useState<string[]>(["0.00"]);
    const [scrolling, setScrolling] = useState<boolean>(false);
    const [tipStatus, showTip] = useState(false);

    const [discountStatus, setDiscountStatus] = useState<boolean>(false);
    const [distCountList, setDiscountList] = useState<Array<{ id: string | number, name: string, price: string, value: string }>>([]);
    const [discountInfo, setDiscountInfo] = useState<{ count: number, price: number, status: boolean }>({
        status: false,
        count: 0,
        price: 0.00
    });

    // 顶部的所有文案
    const [setMealTxt, setMealTxtInfo] = useState<{ title: string, desc: string }>({title: "", desc: ""});
    // 套餐的信息列表
    const [setMealArr, updateSetMealArr] = useState([]);

    // 当前套餐价所有正常的skus的value
    const normalSkusArr = useRef([]);

    const currentSkus = useRef<any[]>([]);
    const skuStr = useRef<string>("");

    const scrollVal = useRef<number>(0);

    const runOnlyOne = useRef(0);

    // 当前套餐的信息
    const [currentSetMeal, setCurrentMeal] = useState<any>({})
    // 是否为套餐，且已经初始化成功了
    const setMealSuccess = useRef(false);


    const backPressHandle = async (e) => {
        console.log(222222222222222, "浏览器返回：", e, router.path)
        if (deviceInfo.env === "h5") {
            if (photoVisible) {
                setPhotoPickerVisible(false)
            }
            // photoStore.updateServerParams(photoStore.printKey, new PhotoParams())
        }
    }

    // 检测是否需要旋转
    function checkHasRotate(attribute: string): boolean {
        if (router.params.id) {
            const pixArr = photoStore.photoProcessParams.pictureSize.split("*");
            const imgPix = attribute.split("*");
            // 容器宽高比
            const num = Number(pixArr[0]) / Number(pixArr[1]);
            // 图片宽高比
            const cNum = Number(imgPix[0]) / Number(imgPix[1])
            debuglog("旋转计算：", {imgPix, cNum, num})
            /**
             * pixArr: 打印尺寸, imgPix：图片尺寸
             * 打印尺寸 大于 1，就判定为打印的是横图，图片尺寸不满足条件（也就是图片尺寸小于1）的话就旋转
             * 或
             * 打印尺寸小于1，就能判定为竖图，但是图片尺寸不满足条件的话（也就是图片尺寸大于1）就旋转
             */
                // return cNum > 1 && num < 1 || cNum < 1 && num > 1
            let rotate = false;
            if (num > 1) {
                rotate = cNum < 1;
            } else if (num < 1) {
                if (cNum > 1) {
                    rotate = true
                }
            }
            return rotate
        }
        return false
    }

    function getTailoringImg(arr: any[]) {
        if (notNull(_imgstyle.current) && arr.length !== 3) {
            return ""
        }
        let path = "";

        const getUrl = (arr: any[], url: string, i: number) => {
            let c = i;
            let str = url;
            if (c === arr.length) {
                path = str;
                return
            } else {
                const reg = new RegExp(`#${arr[c].key}#`);
                str = url.replace(reg, arr[c].val)
                c += 1;
                getUrl(arr, str, c)
            }
        }

        getUrl(arr, _imgstyle.current, 0)

        return path
    }

    function updateDescribe(title: string, status: 1 | 2 | 3 | 4) {
        setDescribe(title);
        setCountStatus(status)
    }

    // 检查图片的数量是否在套餐允许的最大数量内
    function inspectionQuantityLimit(arr = []) {
        return new Promise<boolean>((resolve, _) => {
            if (setMealSuccess.current) {
                let count = 0;
                for (let i = 0; i < arr.length; i++) {
                    const item = arr[i];
                    count += (notNull(item.count) ? 1 : item.count)
                }
                if (count > parseInt(currentSetMeal.value)) {
                    showTip(true);
                    resolve(false)
                } else {
                    resolve(true)
                }
            } else {
                resolve(true)
            }
        })
    }

    // 根据选择的尺寸来计算每个Item的高度
    /**
     * 3寸：756*1051  --->  161*223
     * 4寸：898*1205  --->  161*216
     * 5寸：1051*1500  --->  161*229
     * 6寸：1205*1795  --->  161*239
     * 7寸：1500*2102  --->  161*225
     * 8寸：1795*2398  --->  161*215
     */
    function computedHeightAccordingToSize(imgSize: string, containerH: number, radio: number = 1, style: "fill" | "allowBlank" = "fill"): { width: number, height: number, hasRotate: boolean } {
        debuglog("-----------------分割线-------------------")

        // w: 304, h: 406
        const obj = {
            width: 152,
            height: 203
        };
        if (notNull(imgSize) || imgSize.indexOf("*") === -1) {
            return {
                ...obj,
                hasRotate: false
            }
        }

        let imgW = parseInt(imgSize.split("*")[0]);
        let imgH = parseInt(imgSize.split("*")[1]);
        debuglog("图片原始宽高：", {imgW, imgH})
        const containerW = itemStyle.width;
        const scaleC = containerW / containerH;

        // 是否发生旋转
        const hasRotate = checkHasRotate(imgSize);

        if (style === "fill") {
            if (hasRotate) {
                return {
                    // width: containerH,
                    height: containerH,
                    width: itemStyle.width,
                    hasRotate
                }
            }
            return {
                width: itemStyle.width,
                height: containerH,
                hasRotate
            }
        }

        if (hasRotate) {
            const [w, h] = [imgH, imgW]
            imgW = w;
            imgH = h;
            debuglog("发生交换的值：", {imgW, imgH})
        }

        const scaleI = imgW / imgH;

        if (scaleC > scaleI) {
            // 说明图片比较高 以高度为准
            debuglog("说明图片比较高 以高度为准：", scaleC, scaleI)
            obj.height = radio * containerH;
            obj.width = containerH * scaleI;
        } else if (scaleC < scaleI) {
            // 说明图片比较宽 以宽度为准
            debuglog("说明图片比较宽 以宽度为准：", scaleC, scaleI)
            obj.width = radio * containerW;
            obj.height = containerW / scaleI;
        } else {
            debuglog("说明图片等宽高为准：", scaleC, scaleI)
            obj.width = radio * containerW;
            obj.height = containerW / scaleI
        }

        if (hasRotate) {
            // const [w, h] = [obj.width, obj.height];
            // obj.width = h;
            // obj.height = w;
        }

        debuglog("图片计算的值：", obj)
        return {
            ...obj,
            hasRotate
        }
    }

    useEffect(() => {
        try {
            const res = Taro.getStorageSync(`${userStore.id}_fillStyleGuide`);
            if (!res || res == -1) {
                setFillStyleStatus(true)
                Taro.setStorage({
                    key: `${userStore.id}_fillStyleGuide`,
                    data: 1
                })
            }
        } catch (e) {
            setFillStyleStatus(true);
            Taro.setStorage({
                key: `${userStore.id}_fillStyleGuide`,
                data: 1
            })
        }
    }, [])

    // 根据改变的相框展示方式(fillStyle)作出更新
    useEffect(() => {
        let arr = [...photos];
        _imgstyle.current = photoStore.photoProcessParams.photoStyle[fillStyle.style]
        arr = arr.map(val => {
            const {width, height, hasRotate} = computedHeightAccordingToSize(val.attr, itemStyle.height, 1, fillStyle.style)
            if (fillStyle.exclude && val.edited === true) {
                return val
            }
            const tArr = [
                {key: "w", val: parseInt(`${width}`)},
                {key: "h", val: parseInt(`${height}`)},
                {key: "r", val: 0},
            ];
            if (hasRotate) {
                tArr[2].val = 90;
            }
            return {
                ...val,
                osx: getTailoringImg(tArr),
                width,
                height
            }
        });
        setPhotos([...arr]);
        photoStore.updateServerParams(photoStore.printKey, {
            fillStyle
        })
        debuglog("改变fillstyle后的列表：", arr)
    }, [fillStyle])

    useEffect(() => {
        if (deviceInfo.env !== "h5") {
            return
        }
        window.addEventListener("popstate", backPressHandle);

        return () => {
            window.removeEventListener("popstate", backPressHandle)
        }
    }, [])

    useEffect(debounce(() => {

        debuglog("当前预定的skuStr：", skuStr.current)

        if (setMealSuccess.current) {
            return
        }

        const arr = currentSkus.current.filter(v => v.value.includes(skuStr.current));
        if (arr.length > 1) {
            const first = arr[0];
            const last = arr[arr.length - 1];
            setPrice([first.price, last.price]);
            setMealTxtInfo(prev => {
                return {
                    ...prev,
                    title: `现单价：￥${first.price}${!detailStatus ? "起" : ""}`,
                    desc: `${discountInfo.status ? `再加${discountInfo.count}张,单价低至￥${discountInfo.price}` : ""}`
                }
            })
        } else if (arr.length > 0) {
            setPrice([arr[0].price]);
            setMealTxtInfo(prev => {
                return {
                    ...prev,
                    title: `现单价：￥${arr[0].price}${!detailStatus ? "起" : ""}`,
                    desc: `${discountInfo.status ? `再加${discountInfo.count}张,单价低至￥${discountInfo.price}` : ""}`
                }
            })
        }

    }, 800), [skuStr.current])

    // 如果当前的套餐信息发生变化
    useEffect(() => {

        let count = 0;
        for (let i = 0; i < photos.length; i++) {
            const item = photos[i];
            count += (notNull(item.count) ? 1 : item.count)
        }

        updateDescribe(`套餐打印张数：${currentSetMeal.value || 0}张`, count == currentSetMeal.value ? 4 : 1);

        setMealTxtInfo({
            title: `套餐价：${currentSetMeal.price || 0}`,
            desc: `当前套餐：${currentSetMeal.value || 0}张`
        });

        photoStore.updateServerParams(photoStore.printKey, {
            currentSetMeal
        })

    }, [currentSetMeal])

    // photo变化时要做 的事
    useEffect(() => {

        // 统计图片及其count的总数
        let count = 0;
        for (let i = 0; i < photos.length; i++) {
            const item = photos[i];
            count += (notNull(item.count) ? 1 : item.count)
        }

        debuglog("统计的打印张数：", count)
        setPictureSize(count)

        // 根据张数判断状态
        const min = photoStore.photoProcessParams.min;
        const max = photoStore.photoProcessParams.max;

        if (!notNull(router.params.meal) && router.params.meal === "t") {
            updateDescribe(`套餐打印张数：${currentSetMeal.value || 0}张`, count == currentSetMeal.value ? 4 : 1)
        } else {
            if (min === max) {
                updateDescribe(`请上传${min}张照片`, count === min ? 4 : 1)
            } else {
                if (count < min) {  // 小于

                    if (notNull(min)) {
                        return
                    }
                    updateDescribe(`最低打印${min}张照片`, 1)
                } else if (count >= min && count <= max) {   // 等于最小/最大值
                    updateDescribe("", 2)
                } else if (count > max) {  // 大于

                    if (notNull(max)) {
                        return;
                    }
                    updateDescribe(`最多打印${max}张照片`, 3)
                }
            }
        }

        // 解析路由上的skus
        const pSku = photoStore.photoProcessParams.photo.sku;
        const idx = photoStore.photoProcessParams.numIdx;
        debuglog("当前的numIdx：", idx, pSku)

        // 查找合适的sku价格
        if (count > 0) {
            let arr = !notNull(pSku) ? String(decodeURIComponent(pSku)).split(",") : [];
            if (idx > -1) {
                const countAttrArr = photoStore.photoProcessParams.attrItems[idx];
                const len = countAttrArr.length;
                debuglog("当前的countAttrArr：", JSON.parse(JSON.stringify(countAttrArr)))
                for (let i = 0; i < countAttrArr.length; i++) {
                    const item = countAttrArr[i];
                    if (parseInt(item.value) >= count) {
                        let c = i - 1;
                        if (c <= 0) {
                            c = 0
                        }
                        debuglog("c：", c, i)
                        arr.push(item.id)
                        break;
                    } else {
                        if (i === len - 1) {
                            arr.push(countAttrArr[len - 1].id)
                            break;
                        }
                    }
                }
            }
            arr = arr.sort((a, b) => parseInt(a) - parseInt(b));
            setSkus([...arr])
            skuStr.current = arr.join(",");
            debuglog("找到的skuID列表：", arr)
        }

        // 在所有的sku列表里查询阶梯价对应的价格, 并且最多执行3次, 弹窗展示用
        let discountTempArr = [];
        if (count > 0 && idx > -1 && runOnlyOne.current <= 1) {
            const countAttrArr = photoStore.photoProcessParams.attrItems[idx];
            debuglog("价格列表：", JSON.parse(JSON.stringify(countAttrArr)))

            for (let i = 0; i < countAttrArr.length; i++) {
                const cItem = countAttrArr[i];
                const obj = {...cItem};
                let arr = !notNull(pSku) ? String(decodeURIComponent(pSku)).split(",") : [];
                arr.push(cItem.id);
                arr = arr.sort((a, b) => parseInt(a) - parseInt(b))
                if (arr.length === photoStore.photoProcessParams.attrItems.length) {
                    const str = arr.join(",");
                    const tempSkuArr = useMoreThan.current.skus.filter(v => v.value.includes(str));
                    if (tempSkuArr.length > 0) {
                        obj.price = tempSkuArr[0].price;
                    } else {
                        debuglog("没有找到对应的SKU信息：", tempSkuArr)
                    }
                } else {
                    debuglog("sku长度不相等：", JSON.parse(JSON.stringify(arr)))
                }
                discountTempArr.push(obj)
            }
            debuglog("执行完最终查找到的优惠列表：", discountTempArr)
            discountTempArr = discountTempArr.sort((a, b) => parseInt(a.value) - parseInt(b.value))
            setDiscountList([...discountTempArr]);
            runOnlyOne.current += 1;
        }

        // 根据当前总张数推算展示的阶梯价信息
        const tempList = distCountList.length > 0 ? distCountList : discountTempArr;
        debuglog("开始查询阶梯价：", count, tempList)
        if (count > 0 && tempList.length > 0) {
            const currentIdx = tempList.findIndex((vItem) => {
                return count <= Number(vItem.value.trim())
            });
            debuglog("当前的总数查询的位置：", currentIdx, tempList);

            if (currentIdx > -1) {
                let arr = !notNull(pSku) ? String(decodeURIComponent(pSku)).split(",") : [];
                arr.push(tempList[currentIdx].id);
                arr = arr.sort((a, b) => parseInt(a) - parseInt(b));
                if (arr.length === photoStore.photoProcessParams.attrItems.length) {
                    skuStr.current = arr.join(",");
                }

                const nextIdx = currentIdx + 1;
                debuglog("下一个位置：", nextIdx)
                if (nextIdx < tempList.length) {
                    const tempCur = tempList[nextIdx];
                    setDiscountInfo({
                        count: parseInt(tempList[currentIdx].value) - count + 1,
                        price: Number(tempCur.price),
                        status: true
                    })
                } else if (nextIdx === tempList.length) {
                    // 已达到最大的取值区间，即当前nextIdx为最后一个价位
                    setDiscountInfo({
                        status: false,
                        count: 0,
                        price: 0
                    })
                } else {
                    debuglog("nextIdx：", nextIdx)
                }
            } else {
                debuglog("初始下标没有查到：", currentIdx, tempList)
            }
        }

    }, [photos])

    /**
     * 在首页活动页跳转过来后，要携带的sku_ID和分类ID，如果两者都在，就说明跳过了上一步选尺寸页面，
     * 需要重新初始化当前用户的 photo Key
     * @param params {path: array, forDetail: boolean}
     * path 图片路径
     * forDetail  默认false， 为true就代表是从商品详情页跳转过来的，已经选好图片了, 此时的sku_id是所有规格都选好了的
     * onlyInitPrice  仅仅只是初始化currentSkus， goodsInfo, currentSkus, 不向容器发送新内容
     * isSetMeal 如果是套餐的话就为true， 并且forDetail此时也为true， sku_id是所有规格都选好了的
     */
    function getRouterParams(params: { path?: [], forDetail?: boolean, incomplete?: boolean, onlyInitPrice?: boolean, isSetMeal?: boolean } = {}) {
        return new Promise<void>(async (resolve, reject) => {
            const opt = {
                path: params.path || [],
                forDetail: params.forDetail || false,
                incomplete: params.incomplete || false,
                onlyInitPrice: params.onlyInitPrice || false,
                isSetMeal: params.isSetMeal || false
            }
            try {
                if ((!opt.onlyInitPrice && !router.params.sku_id) || !router.params.id) {
                    Taro.showToast({
                        title: "没有相关ID信息",
                        icon: "none"
                    })
                    reject(`没有相关ID信息: sku_id、分类ID`);
                } else {
                    if (deviceInfo.env === "weapp") {
                        try {
                            await photoStore.getServerParams({key: getUserKey(), setLocal: true})
                        } catch (e) {
                            debuglog("初始获取参数错误：", e)
                        }
                    }
                    const obj = {
                        path: opt.forDetail || opt.incomplete ? [...photoStore.photoProcessParams.photo.path] : opt.path,
                        sku: decodeURIComponent(router.params.sku_id),
                        id: router.params.id
                    };
                    debuglog("初始化的Object：", JSON.parse(JSON.stringify(obj)))

                    // 从服务器获取基本数据信息
                    const serPar = await api("app.product/info", {id: router.params.id});
                    const temp = {...serPar};

                    temp.skus = temp.skus.filter(v => v.stock > 0);
                    useMoreThan.current = {...temp};

                    debuglog("清除库存为0的数据：", useMoreThan.current)

                    // 找到当前模糊搜索的suk列表
                    let arr = [];
                    const sku = photoStore.photoProcessParams.photo.sku;
                    if (!notNull(sku)) {
                        arr = decodeURIComponent(sku).split(",");
                    }
                    arr = arr.sort((a, b) => a - b);
                    skuStr.current = arr.join(",");
                    currentSkus.current = temp.skus.filter(v => v.value.includes(arr.join(",")));
                    debuglog("第一次产生的currentSkus：", "id", skuStr.current, "列表：", currentSkus.current);

                    const idx = serPar.attrGroup.findIndex(v => v.special_show === "photosize");
                    const numIdx = serPar.attrGroup.findIndex(v => v.special_show === "photonumber");
                    const setMealIdx = serPar.attrGroup.findIndex(v => v.special_show === "setmeal");
                    debuglog("查找的下标：", idx, numIdx, setMealIdx);

                    let pictureSize = "";
                    // if (opt.isSetMeal && setMealIdx > -1) {
                    //
                    //     updateSetMealArr([...serPar.attrItems[setMealIdx]])
                    // }

                    // 如果是完整的SkuID
                    if (opt.forDetail) {
                        const tArr = serPar.skus.filter(v => v.id == obj.sku);
                        debuglog("如果是完整的SkuID：", obj.sku, tArr)
                        if (tArr.length > 0) {
                            setPrice([tArr[0].price]);
                            if (opt.isSetMeal) {
                                const setMealList = [...serPar.attrItems[setMealIdx]];
                                const skuVal = tArr[0].value.split(",");
                                pictureSize = findPictureSizeForID(skuVal, serPar.attrItems[idx])
                                if (skuVal.length === serPar.attrGroup.length) {
                                    /**
                                     * 查询套餐下对应的价格，形成一个包含价格的新的套餐列表
                                     * 先从skuVal（已知的所有sku规格ID）中找到对应套餐的下标位(idx)，以便循环生成sku列表，去匹配对应的大项sku信息
                                     * setMealSkuIdArr：已知的所有套餐ID数组
                                     */
                                    debuglog("skuVal：", skuVal, setMealList)
                                    // const idx = skuVal.findIndex(ci => ci == setMealList[0].id);
                                    let idx = -1;
                                    for (let j = 0; j < skuVal.length; j++) {
                                        let match = false;
                                        for (let m = 0; m < setMealList.length; m++) {
                                            if (parseInt(setMealList[m].id) == parseInt(skuVal[j])) {
                                                match = true;
                                                break;
                                            }
                                        }
                                        if (match) {
                                            idx = j;
                                            break;
                                        }
                                    }
                                    debuglog("查找的套餐sku对应的下标位置：", idx);
                                    const setMealSkuIdArr = setMealList.map(v => v.id);
                                    const tempArr = [];

                                    // 循环已知的所有套餐ID数组
                                    setMealSkuIdArr.forEach((item, index) => {
                                        // 深拷贝
                                        const tempIdArr = JSON.parse(JSON.stringify(skuVal));
                                        // 删除并添加，形成新的sku列表
                                        tempIdArr.splice(idx, 1, item);
                                        const idStr = tempIdArr.join(",");
                                        // 在normalSkusArr里面查找已有的id， 如果没有就push，以便提交订单
                                        const localMatch = normalSkusArr.current.findIndex(v => v == idStr);
                                        if (localMatch === -1) {
                                            normalSkusArr.current.push(idStr)
                                        }
                                        // 在所有的skus列表里面匹配 tempIdArr.join(",")（上面生成的新sku列表组成的字符串）
                                        const matchArr = temp.skus.filter(v => v.value == idStr);
                                        // 找到结果后就组成新的数组
                                        if (matchArr.length > 0) {
                                            tempArr.push({
                                                ...setMealList[index],
                                                price: matchArr[0].price || 0.00,
                                                skuValue: matchArr[0].value || idStr,
                                                skuID: matchArr[0].id || ""
                                            })
                                        }
                                    })
                                    debuglog("查找的所有的包含价格的新的套餐列表：", tempArr, "，所有的正常的sku列表：", normalSkusArr.current)

                                    const current = tempArr.filter(value => skuVal.findIndex(cv => cv == value.id) > -1)[0] || {};
                                    setCurrentMeal({...current})
                                    debuglog("查询到的当前套餐：", skuVal, current)
                                    updateSetMealArr([...tempArr])

                                    setDiscountInfo(prev => ({...prev, status: true}));
                                    setMealSuccess.current = true;
                                } else {
                                    Taro.showToast({
                                        title: "套餐Sku不完整",
                                        icon: "none",
                                        success: async () => {
                                            await sleep(2000);
                                            Taro.navigateBack()
                                        }
                                    })
                                }
                            } else {
                                setMealTxtInfo(prev => {
                                    return {
                                        ...prev,
                                        title: `现单价：￥${tArr[0].price}${!detailStatus ? "起" : ""}`,
                                        desc: `${discountInfo.status ? `再加${discountInfo.count}张,单价低至￥${discountInfo.price}` : ""}`
                                    }
                                })
                            }
                        }
                    } else {
                        pictureSize = findPictureSizeForID(obj.sku.split(","),  serPar.attrItems[idx])
                    }

                    if (idx > -1 && !opt.onlyInitPrice) {
                        // 向本地存储attrItems
                        await photoStore.setActionParamsToServer(getUserKey(), {
                            photo: obj,
                            attrItems: serPar.attrItems,
                            index: idx,
                            numIdx,
                            setMealIdx,
                            pictureSize,
                            photoStyle: serPar.photostyle,
                            photoTplId: router.params.tplid,
                            max: serPar.max,
                            min: serPar.min
                        })
                        resolve()
                    } else {
                        opt.onlyInitPrice ? resolve() : reject("初始化尺寸时没找到尺寸")
                        debuglog("初始化尺寸时没找到尺寸：", serPar)
                    }
                }
            } catch (e) {
                reject(e)
            }
        })
    }

    const selectPhoto = () => {
        let num = 0;
        for (const item of photos) {
            num += parseInt(item.count)
        }
        const allowCount = setMealSuccess.current ? parseInt(currentSetMeal.value) : photoStore.photoProcessParams.max;
        if (num >= allowCount) {
            Taro.showToast({
                title: setMealSuccess.current ? `当前套餐只能选择${allowCount}张` : `最多打印${allowCount}张`,
                icon: "none"
            })
            return
        }
        setPhotoPickerVisible(true);
        setTimeout(() => {
            setAnimating(true)
        }, 50)
    }

    if (deviceInfo.env === "weapp") {
        Taro.useShareAppMessage(() => {
            return shareAppExtends()
        })
    }

    Taro.useDidShow(async () => {

        if (notNull(userStore.id)) {
            userStore.showLoginModal = true;
            return
        }

        Taro.showLoading({title: "初始化中..."});
        debuglog(router)


        // 解析参数
        // 默认进来，根据key值是第一次还是其他
        // 第一次就先读本地再向服务器存储，之后就只是使用服务器的值
        let params: any = {};

        try {
            if (router.params.init) {
                params = await getRouterParams();
                const ap = router.params;
                if (ap.init) {
                    delete ap.init
                }
                await sleep(300)
                Taro.redirectTo({
                    url: updateChannelCode(`/pages/editor/pages/printing/change?${getURLParamsStr(urlEncode(ap))}`)
                })
            } else if (router.params.detail && router.params.detail === "t") {
                // 如果是从商品详情页过来，此时已经有选好的图片了，并且规格已经选好了
                // 此处还存在一个情况，就是如果是套餐价，说明所有的规格也已经选好了，那么isSetMeal就为true
                await getRouterParams({
                    path: [],
                    forDetail: true,
                    isSetMeal: !notNull(router.params.meal) && router.params.meal == "t"
                });
                params = {...photoStore.photoProcessParams}
                setDetailStatus(true)
            } else if (router.params.inc) {
                // 如果从商品详情页跳转过来，有inc(incomplete)字段，就说明sku_id是残缺的子项ID，就需要在onCreateOrder时判断是否已经选完了，选完就直接跳转
                await getRouterParams({incomplete: true});
                params = {...photoStore.photoProcessParams}
            } else {
                await getRouterParams({onlyInitPrice: true})
                params = await photoStore.getServerParams({setLocal: true});
            }
        } catch (e) {
            debuglog("初始化获取服务器的数据出错：", e)
        }


        debuglog("读取的photo params：", params)

        const pix = photoStore.photoProcessParams.pictureSize;
        _imgstyle.current = photoStore.photoProcessParams.photoStyle[fillStyle.style];
        if (!notNull(photoStore.photoProcessParams.fillStyle) && Object.keys(photoStore.photoProcessParams.fillStyle).length > 0) {
            setFillStyle({...photoStore.photoProcessParams.fillStyle})
        }

        debuglog("尺寸参数：", pix)
        if (!notNull(pix)) {
            const pixArr = pix.split("*");
            debuglog("格式化素组：", pixArr)
            const tArr = [
                {key: "w", val: pixArr[0]},
                {key: "h", val: pixArr[1]},
                {key: "r", val: 0},
            ];

            if (params.photo.path.length === 0) {
                selectPhoto()
            }

            const containerH = itemStyle.width * (parseInt(pixArr[1]) / parseInt(pixArr[0]));
            // containerW / containerH
            const obj = {
                width: itemStyle.width,
                height: containerH
            }
            debuglog("默认初始化的列表宽高：", obj)
            setItemStyle({...obj})

            debuglog("path:", params.photo.path)
            params.photo.path = params.photo.path.map((v) => {
                const styleArr = [...tArr];
                const {width, height, hasRotate} = computedHeightAccordingToSize(v.attr, containerH, 1, fillStyle.style);
                if (hasRotate) {
                    styleArr[2].val = 90;
                }
                return {
                    ...v,
                    url: v.url,
                    count: notNull(v.count) ? 1 : parseInt(v.count),
                    hasRotate: hasRotate,
                    osx: getTailoringImg(styleArr),
                    readLocal: v.originalData && v.originalData.length > 0,
                    width,
                    height
                }
            })
            setPhotos([...params.photo.path] || []);
        }

        if (Object.keys(photoStore.photoProcessParams.currentSetMeal).length > 0) {
            setCurrentMeal({...photoStore.photoProcessParams.currentSetMeal})
        }

        Taro.hideLoading();

    })

    const onSetMealChange = (item, idx) => {
        debuglog("当前选择的套餐：", item, idx);
        setCurrentMeal({...item})
    }

    const onFillStyleChange = (style, exclude) => {
        debuglog(style, exclude)
        setFillStyle({style, exclude});
        setFillStatus(false)
    }

    const debounceUpdateCount = useDebounceFn(async (idx, num) => {
        const photo = [...photoStore.photoProcessParams.photo.path];
        photo[idx].count = Number(num);
        try {
            await photoStore.updateServerParams(photoStore.printKey, {
                photo: {
                    ...photoStore.photoProcessParams.photo,
                    path: photo
                }
            })
        } catch (e) {
            debuglog("更新数量出错：", e)
        }
    }, 500, false)

    const onAddCount = async (num, idx) => {
        let _num = Number(num);
        _num = _num + 1;

        const arr = JSON.parse(JSON.stringify(photos));

        arr[idx].count = Number(_num);
        try {
            const allow = await inspectionQuantityLimit(arr);
            if (allow) {
                setPhotos([...arr]);
                debounceUpdateCount(idx, Number(_num))
            }
        } catch (e) {

        }
    }

    const onReducer = async (prevNum, idx) => {
        let num = Number(prevNum);
        num = num - 1;
        if (num < 1) {
            num = 1
        }

        const arr = JSON.parse(JSON.stringify(photos));
        arr[idx].count = Number(num);
        setPhotos([...arr]);
        debounceUpdateCount(idx, Number(num))
    }

    const onDeleteImg = async idx => {
        const arr = [...photos];

        debuglog(arr[idx].id,
            arr[idx])

        // removeDuplicationForArr(
        //     arr.map(v => ({id: v.id, url: v.url})),
        //     photoStore.photoProcessParams.usefulImages,
        //     arr[idx].id,
        //     arr[idx].extraIds || undefined
        // )

        const photo = [...photoStore.photoProcessParams.photo.path];
        photo.splice(idx, 1);
        try {
            await photoStore.updateServerParams(photoStore.printKey, {
                photo: {
                    ...photoStore.photoProcessParams.photo,
                    path: photo
                },
                usefulImages: removeDuplicationForArr({
                    newArr: [{id: arr[idx].id, url: arr[idx].url}],
                    oldArr: photoStore.photoProcessParams.usefulImages,
                    deleteID: arr[idx].id,
                    extraIds: arr[idx].extraIds || undefined
                })
            })
            arr.splice(idx, 1);
            setPhotos([...arr])
        } catch (e) {
            debuglog("更新数量出错：", e)
        }
    }

    function setCount(_, id) {
        if (detailStatus) {
            return
        }
        let arr = [];
        arr = String(decodeURIComponent(photoStore.photoProcessParams.photo.sku)).split(",")
        arr.push(id);

        debuglog("追加的skuID：", arr)
        skuArr.current = [...arr]
        setSkus([...arr])
    }

    const forIDJumpToDatail = async (skuId, isSetMeal: boolean = false) => {
        let count = 0;
        photos.forEach(value => {
            count += parseInt(value.count)
        })

        const data = {
            skuid: skuId,
            total: isSetMeal ? 1 : count,
            page: "photo",
            crop: fillStyle.style,
            parintImges: photos.map(v => {
                const pixArr = photoStore.photoProcessParams.pictureSize.split("*");
                debuglog("当前的尺寸参数：", pixArr)
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

        try {

            await photoStore.updateServerParams(photoStore.printKey, {
                changeUrlParams: data
            })
            jumpOrderConfimPreview({
                skuid: skuId,
                total: isSetMeal ? 1 : count,
                page: "photo"
            });
        } catch (e) {
            debuglog("本地存储失败：", e)

        }
    }

    const onCreateOrder = async () => {

        if (photos.length <= 0 || countStatus === 1 || countStatus === 3) {
            return
        }

        if (detailStatus && notNull(router.params.inc)) {
            // 已选好所有规格，直接跳转
            if (setMealSuccess.current) {
                // 如果是套餐价
                // let currentSkuId = null;
                // debuglog(currentSkus)
                // for (let i = 0; i < currentSkus.current.length; i++) {
                //     const item = currentSkus.current[i];
                //     const cur = normalSkusArr.current.filter(v => v == item.value)[0];
                //     debuglog(cur, normalSkusArr.current)
                //     if (!notNull(cur) && Object.keys(cur).length > 0 && item.value == cur) {
                //         currentSkuId = item.id;
                //         break;
                //     }
                // }
                debuglog("当前找到的ID：", currentSetMeal)
                if (!notNull(currentSetMeal.skuID)) {
                    forIDJumpToDatail(currentSetMeal.skuID, true)
                }
            } else {
                // 非套餐价
                forIDJumpToDatail(router.params.sku_id)
            }
            return
        }

        if (detailStatus && !notNull(router.params.inc)) {
            let currentSkuId = null;
            debuglog(currentSkus)
            for (let i = 0; i < currentSkus.current.length; i++) {
                const item = currentSkus.current[i];
                if (skuStr.current === item.value) {
                    currentSkuId = item.id;
                    debuglog(item)
                    break;
                }
            }
            debuglog("当前找到的ID：", currentSkuId)
            if (!notNull(currentSkuId)) {
                forIDJumpToDatail(currentSkuId)
            }
            return
        }

        Taro.showLoading({title: "请稍后..."});
        try {
            const res = await api("app.product/info", {id: photoStore.photoProcessParams.photo.id});
            if (res.attrGroup && res.attrGroup instanceof Array) {
                res.attrGroup = res.attrGroup.map(val => ({...val, disable: !notNull(val.special_show)}))
            }
            goodsInfo.current = res;

            let count = 0;
            for (const item of photos) {
                count += Number(item.count)
            }
            debuglog("总数量：", count)
            const idx = photoStore.photoProcessParams.numIdx || 1;
            debuglog("数量的下标：", idx)
            if (photoStore.photoProcessParams.numIdx != -1) {
                const len = photoStore.photoProcessParams.attrItems[idx].length
                for (let i = 0; i < len; i++) {
                    const item = photoStore.photoProcessParams.attrItems[idx][i];
                    debuglog(1111, JSON.parse(JSON.stringify(item)))
                    if (parseInt(item.value) >= count) {
                        let c = i - 1;
                        if (c <= 0) {
                            c = 0
                        }
                        debuglog("c：", c, i)
                        setCount(res, photoStore.photoProcessParams.attrItems[idx][i].id)
                        break;
                    } else {
                        if (i === len - 1) {
                            setCount(res, photoStore.photoProcessParams.attrItems[idx][len - 1].id)
                            break;
                        }
                    }
                }
            } else {
                let arr = [];
                const sku = photoStore.photoProcessParams.photo.sku;
                if (!notNull(sku)) {
                    arr = decodeURIComponent(sku).split(",");
                }
                setSkus([...arr])
            }

            debuglog(skuArr.current, res.attrGroup.length)

            if (skuArr.current.length === res.attrGroup.length) {
                const tArr = skuArr.current.sort((a, b) => parseInt(a) - parseInt(b));
                debuglog("tArr：", tArr)
                const tStr = tArr.join(",");
                debuglog(tStr)
                let currentSkuId = null;
                for (let i = 0; i < res.skus.length; i++) {
                    const item = res.skus[i];
                    if (tStr === item.value) {
                        currentSkuId = item.id;
                        debuglog(item)
                        break;
                    }
                }
                debuglog("当前找到的ID：", currentSkuId)
                if (!notNull(currentSkuId)) {
                    forIDJumpToDatail(currentSkuId)
                }
            } else {
                setTimeout(() => {
                    setVisible(true)
                }, 10)
            }
        } catch (e) {
            debuglog("获取商品详情出错：", e)
        }
        Taro.hideLoading()
    }

    const orderSkuChange = (skus: any[], skuID: number | string) => {
        debuglog("sku信息：", skus, skuID)
        setSkuInfoID(skuID)
    }

    const onSubmitOrder = async () => {
        let count = 0;
        for (const item of photos) {
            count += parseInt(item.count)
        }

        const pix = photoStore.photoProcessParams.pictureSize;

        debuglog("尺寸参数：", pix)

        if (notNull(pix)) {
            Taro.showToast({
                title: "没有尺寸参数，请联系客服",
                icon: "none"
            })
            return;
        }

        if (notNull(skuInfoID) || skuInfoID == 0) {
            Taro.showToast({title: "请选择规格", icon: "none"})
            return
        }
        const data = {
            skuid: skuInfoID,
            total: count,
            page: "photo",
            crop: fillStyle.style,
            parintImges: photos.map(v => {
                const pixArr = pix.split("*");
                debuglog("选择的宽高：", pixArr)
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

        try {

            await photoStore.updateServerParams(photoStore.printKey, {
                changeUrlParams: data
            })
            jumpOrderConfimPreview({
                skuid: skuInfoID,
                total: count,
                page: "photo"
            })
        } catch (e) {
            debuglog("本地存储失败：", e)

        }
    }

    const closeSelectPhoto = () => {
        setAnimating(false);
        setTimeout(() => {
            setPhotoPickerVisible(false)
        }, 500)
    }

    const onPhotoSelect = async (data: { ids: [], imgs: [], attrs: [] }) => {

        setPhotoPickerVisible(false);
        try {

            const arr = [...photos];
            for (let i = 0; i < data.ids.length; i++) {
                arr.push({
                    id: data.ids[i],
                    url: data.imgs[i],
                    attr: data.attrs[i],
                    count: 1,
                    edited: false,
                    doc: ""
                });
            }

            let exArr = [...arr];
            const sizeArr = photoStore.photoProcessParams.pictureSize.split("*");
            if (sizeArr[0] && sizeArr[1]) {
                const tArr = [
                    {key: "w", val: sizeArr[0]},
                    {key: "h", val: sizeArr[1]},
                    {key: "r", val: 0},
                ];
                exArr = arr.map(v => {
                    const allowRotate = checkHasRotate(v.attr);
                    const fixArr = [...tArr];

                    if (allowRotate) {
                        fixArr[2].val = 90;
                    }
                    return {
                        ...v,
                        hasRotate: allowRotate,
                        osx: getTailoringImg(fixArr),
                        url: v.url,
                    }
                })
            }

            exArr = exArr.map(value => {
                if (fillStyle.exclude && value.edited === true) {
                    return value
                }
                const {width, height, hasRotate} = computedHeightAccordingToSize(value.attr, itemStyle.height, 1, fillStyle.style);
                const tArr = [
                    {key: "w", val: parseInt(`${width}`)},
                    {key: "h", val: parseInt(`${height}`)},
                    {key: "r", val: 0},
                ];
                if (hasRotate) {
                    tArr[2].val = 90;
                }
                return {
                    ...value,
                    osx: getTailoringImg(tArr),
                    width,
                    height
                }
            })

            const allow = await inspectionQuantityLimit(exArr);
            if (allow) {
                await photoStore.updateServerParams(photoStore.printKey, {
                    photo: {
                        ...photoStore.photoProcessParams.photo,
                        path: exArr
                    },
                    usefulImages: removeDuplicationForArr({
                        newArr: data.ids.map((value, index) => ({id: value, url: data.imgs[index]})),
                        oldArr: photoStore.photoProcessParams.usefulImages
                    })
                })

                setPhotos([...exArr]);
            }
        } catch (e) {
            debuglog("选择图片后处理出错：", e)
        }
    }

    const onEditClick = async (item, index) => {

        const obj: any = {
            idx: index,
            cid: router.params.id,
            tplid: router.params.cid,
            key: photoStore.printKey,
            local: !notNull(item.readLocal) && item.readLocal === true ? "t" : "f",
            status: item.edited && !notNull(item.doc) ? "t" : "f",
            imgID: notNull(item.id) ? -1 : item.id,
            img: item.url,
        };

        // if (deviceInfo.env === "weapp") {
        //     Object.assign(obj, {key: photoStore.printKey})
        // }

        try {
            if (!notNull(item.readLocal) && item.readLocal === true) {
                await photoStore.updateServerParams(photoStore.printKey, {
                    originalData: item.originalData,
                })
            }
        } catch (e) {
            debuglog("向本地存储旧数据出错：", e)
        }

        jumpToPrintEditor(obj)
    }

    const onBackHandle = () => {
        if (photoStore.photoProcessParams.limit) {
            Taro.navigateBack({
                delta: 2
            });
            return
        }
        photoStore.updateServerParams(getUserKey(), new PhotoParams())
        if (Taro.getCurrentPages().length > 1) {
            Taro.navigateBack();
        } else {
            if (process.env.TARO_ENV == "h5") {
                window.location.href = updateChannelCode("/");
            } else {
                Taro.switchTab({url: updateChannelCode("/pages/tabbar/index/index")});
            }
        }
    }

    const getScrollHeight = () => {
        return deviceInfo.env === "h5"
            ? deviceInfo.windowHeight - 110 + "px"
            : deviceInfo.windowHeight - 200 + deviceInfo.statusBarHeight - deviceInfo.menu.height + "px"
    }

    const debounceScroll = useDebounceFn(() => {
        setScrolling(false)
    }, 300, false);

    const onScroll = (e) => {
        const top = e.detail.scrollTop;
        scrollVal.current = top;
        setScrolling(true);
        if (scrollVal.current === top) {
            debounceScroll()
        }
    }

    const showMoreMeal = () => {
        if (setMealSuccess.current) {
            if (setMealArr.length > 1) {
                setDiscountStatus(true)
            }
            return
        }
        setDiscountStatus(true)
    }

    return (
        <View className="printing_container">
            <LoginModal isTabbar={false}/>
            <AtNavBar onClickLeftIcon={onBackHandle}
                      customStyle={{
                          paddingTop: deviceInfo.env === "weapp" ? deviceInfo.statusBarHeight + "px" : "0px"
                      }}
                      color='#121314' title="照片冲印列表" border fixed
                      leftIconType={{value: 'chevron-left', color: '#121314', size: 24}}
            />
            <View className="fixed_top_fill_style_container" style={{
                top: `${deviceInfo.env === "weapp" ? deviceInfo.menu.bottom + 4 : 44}px`
            }}>
                <Text className="txt">显示方式</Text>
                <View className="act_txt" onClick={() => setFillStatus(true)}>
                    <Text className="a_txt">{fillStyle.style === "fill" ? "填充相纸" : "留白相纸"}</Text>
                    <View className="arrow" />
                </View>
            </View>
            <View className="fixed_top_price_container" style={{
                top: `${deviceInfo.env === "weapp" ? deviceInfo.menu.bottom + 48 : 88}px`
            }}>
                <View className="left">
                    <Text className="txt">{setMealTxt.title}</Text>
                </View>
                <View className="right">
                    {
                        discountInfo.status
                            ? <View className="more_price_info" onClick={showMoreMeal}>
                                <Text className="red_txt">{setMealTxt.desc}</Text>
                                {
                                    setMealSuccess.current && setMealArr.length > 1
                                        ? <IconFont name="24_xiayiye" color="#FF4966" size={28} />
                                        : null
                                }
                                {
                                    distCountList.length > 1
                                        ? <IconFont name="24_xiayiye" color="#FF4966" size={28} />
                                        : null
                                }
                            </View>
                            : null
                    }
                </View>
            </View>
            <ScrollView scrollY enableFlex className="printing_scroll_container" style={{height: getScrollHeight()}} onScroll={onScroll}>
                <View className="printing_change_main"
                      style={
                          deviceInfo.env === "weapp"
                              ? {
                                  paddingTop: deviceInfo.statusBarHeight + 95 + "px",
                                  paddingBottom: 22 + "px"
                              }
                              : {
                                paddingBottom: "88px",
                                paddingTop: 95
                              }
                      }
                >
                    {
                        photos.map((value, index) => (
                            <View className="print_change_item_wrap" key={index + ""}
                                  style={{
                                      width: deviceInfo.windowWidth / 2 + "px"
                                  }}>
                                <View className="print_change_item"
                                      style={{
                                          width: `${itemStyle.width}px`,
                                      }}
                                >
                                    <View className="print_change_del" onClick={() => onDeleteImg(index)}>
                                        <IconFont name="32_guanbi" size={32}/>
                                    </View>
                                    <View className="print_change_img"
                                          style={{
                                              width: `${itemStyle.width}px`,
                                              height: `${itemStyle.height}px`
                                          }}
                                    >
                                        <Image
                                            src={`${value.url}?${value.osx}`}
                                            // src={value.url}
                                            className="p_img"
                                            mode="aspectFill"
                                            onClick={() => onEditClick(value, index)}
                                            style={{
                                                // transform: value.hasRotate ? "rotateZ(90deg)" : "none",
                                                width: `${value.width}px`,
                                                height: `${value.height}px`
                                            }}
                                        />
                                    </View>
                                    <View className="print_change_count">
                                        <View className='counter-fc'>
                                            <View className='reduce' onClick={() => onReducer(value.count, index)}>
                                                <Image
                                                    src={value.count > 1
                                                        ? `${options.sourceUrl}appsource/reduceActive.png`
                                                        : `${options.sourceUrl}appsource/reduce.png`}
                                                    className='img'/>
                                            </View>
                                            <Text className='num'>{value.count || 1}</Text>
                                            <View className='add' onClick={() => onAddCount(value.count, index)}>
                                                <Image src={`${options.sourceUrl}appsource/add.png`} className='img'/>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))
                    }
                </View>
            </ScrollView>
            <View className="print_foot">
                <View className={`print_fixed_select_button ${scrolling ? "print_fixed_btn_ainm" : ""}`}
                      style={{}}
                      onClick={selectPhoto}
                >
                    <IconFont name="24_jiahao" size={40} color="#fff"/>
                    <Text className="txt">加图</Text>
                </View>
                <View className="print_foot_main" style={{justifyContent: "space-around"}}>
                    <View className="print_info">
                        {
                            !notNull(describe)
                                ? <View className="top">
                                    <Image src={`${options.sourceUrl}appsource/waing.png`} className="top_icon" />
                                    <Text className="v_txt">{describe}</Text>
                                </View>
                                : null
                        }
                        <View className="print_num_info">
                            <Text className="b_txt">打印照片数量：</Text>
                            <Text className="red_txt">{pictureSize}张</Text>
                        </View>
                    </View>
                    <View className="btn"
                          onClick={onCreateOrder}
                          style={{
                              opacity: photos.length > 0 && (countStatus === 2 || countStatus === 4) ? 1 : 0.7
                          }}>
                        <Text className="txt">立即下单</Text>
                    </View>
                </View>
            </View>
            {
                visible
                    ? <PlaceOrder data={goodsInfo.current} isShow={visible}
                                  onClose={() => setVisible(false)}
                                  onSkuChange={orderSkuChange}
                                  quoteType="photo"
                                  defaultSelectIds={skus || []}
                                  onNowBuy={onSubmitOrder}/>
                    : null
            }
            {
                photoVisible
                    ? <View className={`photo_picker_container ${animating ? "photo_picker_animate" : ""}`}>
                        <PhotosEle editSelect
                                   onClose={closeSelectPhoto}
                                   count={photoStore.photoProcessParams.imageCount}
                                   max={setMealSuccess.current ? parseInt(currentSetMeal.value) - pictureSize : photoStore.photoProcessParams.max}
                                   defaultSelect={photoStore.photoProcessParams.usefulImages}
                                   onPhotoSelect={onPhotoSelect}
                        />
                    </View>
                    : null
            }
            {
                discountStatus
                    ? setMealSuccess.current
                    ? <SetMealSelectorModal
                        visible={discountStatus}
                        count={pictureSize}
                        currentSetMeal={currentSetMeal}
                        setMealData={setMealArr}
                        onClose={() => setDiscountStatus(false)}
                        onConfirm={onSetMealChange}/>
                    : <Discount list={distCountList} onClose={() => setDiscountStatus(false)}/>
                    : null
            }
            {
                tipStatus
                    ? <TipModal
                        isShow={tipStatus}
                        title="超出打印照片数量"
                        tip={`当前套餐照片数量最多打印${currentSetMeal.value}张照片${setMealArr.length > 1 ? "，是否更改套餐打印更多照片？" : ""}`}
                        cancelText="取消"
                        okText={setMealArr.length > 1 ? "更换套餐" : "知道了"}
                        onCancel={() => showTip(false)}
                        onOK={() => setMealArr.length > 1 ? setDiscountStatus(true) : showTip(false)}
                    />
                    : null
            }
            {
                fillStyleStatus
                    ? <FillStyleModal onClose={() => setFillStyleStatus(false)} />
                    : null
            }
            {
                changeFill
                    ? <FillStyleChange
                        visible={changeFill}
                        defaultFill={fillStyle}
                        onClose={() => setFillStatus(false)}
                        onConfirm={onFillStyleChange}
                    />
                    : null
            }
        </View>
    )
}

export default PrintChange
