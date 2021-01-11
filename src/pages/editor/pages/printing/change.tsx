import Taro, {useEffect, useState, useRef} from "@tarojs/taro";
import {Image, ScrollView, Text, View} from "@tarojs/components";
import "./index.less";
import {AtNavBar} from "taro-ui";
import IconFont from "../../../../components/iconfont";
import {
    debounce,
    deviceInfo, getURLParamsStr,
    getUserKey,
    jumpToPrintEditor,
    notNull, shareAppExtends, sleep, updateChannelCode,
    urlEncode, useDebounceFn
} from "../../../../utils/common";
import {api} from "../../../../utils/net";
import {PhotoParams} from "../../../../modal/modal";
import PhotosEle from "../../../../components/photos/photos";
import photoStore from "../../../../store/photo";
import LoginModal from "../../../../components/login/loginModal";
import {userStore} from "../../../../store/user";
import Discount from "../../../../components/discount";
import PlaceOrder from "../../../order/pages/template/place";

const PrintChange: Taro.FC<any> = () => {

    const router = Taro.useRouter();

    const [photos, setPhotos] = useState([]);
    const [visible, setVisible] = useState(false);
    const goodsInfo = Taro.useRef<any>({});
    const useMoreThan = useRef<any>({});
    // sku子项ID列表
    const [skus, setSkus] = useState<any[]>([]);
    // skus ID， 已选好所有子项sku的大项ID
    const [skuInfoID, setSkuInfoID] = useState<any>(0);
    const [photoVisible, setPhotoPickerVisible] = useState(false);
    const [animating, setAnimating] = useState(false);
    const _imgstyle = Taro.useRef("");
    const sizeArr = Taro.useRef<any[]>([]);
    // 只有从商品详情页跳转过来才会为true
    const [detailStatus, setDetailStatus] = useState(false);
    const skuArr = useRef([]);

    const [pictureSize, setPictureSize] = useState<number>(0);
    const [describe, setDescribe] = useState<string>("");
    // 图片数量状态   1:低于{min}张、2：刚好满足{min}/{max}的值、3：最大{max}的值、4：{min}{max}值相等
    const [countStatus, setCountStatus] = useState<1 | 2 | 3 | 4>(1);
    // 根据当前的总数要展示的SKU价格
    const [price, setPrice] = useState<string[]>(["0.00"]);
    const [scrolling, setScrolling] = useState<boolean>(false);

    const [discountStatus, setDiscountStatus] = useState<boolean>(false);
    const [distCountList, setDiscountList] = useState<Array<{id: string | number, name: string, price: string, value: string}>>([]);
    const [discountInfo, setDiscountInfo] = useState<{count: number, price: number, status: boolean}>({status: false, count: 0, price: 0.00});

    const currentSkus = useRef<any[]>([]);
    const skuStr = useRef<string>("");


    const backPressHandle = () => {
        if (deviceInfo.env === "h5") {
            if (photoVisible) {
                setPhotoPickerVisible(false)
            }
        }
    }

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

        console.log("当前预定的skuStr：", skuStr.current)

        const arr = currentSkus.current.filter(v => v.value.includes(skuStr.current));
        if (arr.length > 1) {
            const first = arr[0];
            const last = arr[arr.length - 1];
            setPrice([first.price, last.price])
        } else if (arr.length > 0) {
            setPrice([arr[0].price])
        }

    }, 800), [skuStr.current])

    const runOnlyOne = useRef(0);
    useEffect(() => {

        // 统计图片及其count的总数
        let count = 0;
        for (let i = 0; i < photos.length; i ++) {
            const item = photos[i];
            count += (notNull(item.count) ? 1 : item.count)
        }

        console.log("统计的打印张数：", count)
        setPictureSize(count)

        // 根据张数判断状态
        const min = photoStore.photoProcessParams.min;
        const max = photoStore.photoProcessParams.max;

        if (min === max) {
            setDescribe(`请上传${min}张照片`);
            if (count === min) {
                setCountStatus(4);
            } else {
                setCountStatus(1)
            }
        } else {
            if (count < min) {  // 小于

                if (notNull(min)) {
                    return
                }
                setDescribe(`最低打印${min}张照片`);
                setCountStatus(1)
            } else if (count >= min && count <= max) {   // 等于最小/最大值
                setDescribe("");
                setCountStatus(2)
            } else if (count > max) {  // 大于

                if (notNull(max)) {
                    return;
                }
                setDescribe(`最多打印${max}张照片`);
                setCountStatus(3)
            }
        }

        // 解析路由上的skus
        const pSku = photoStore.photoProcessParams.photo.sku;
        const idx = photoStore.photoProcessParams.numIdx;
        console.log("当前的numIdx：", idx, pSku)

        // 查找合适的sku价格
        if (count > 0) {
            let arr = !notNull(pSku) ? String(decodeURIComponent(pSku)).split(",") : [];
            if (idx > -1) {
                const countAttrArr = photoStore.photoProcessParams.attrItems[idx];
                const len = countAttrArr.length;
                console.log("当前的countAttrArr：", JSON.parse(JSON.stringify(countAttrArr)))
                for (let i = 0; i < countAttrArr.length; i++) {
                    const item =  countAttrArr[i];
                    if (parseInt(item.value) >= count) {
                        let c = i - 1;
                        if (c <= 0) {
                            c = 0
                        }
                        console.log("c：", c, i)
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
            console.log("找到的skuID列表：", arr)
        }

        // 在所有的sku列表里查询阶梯价对应的价格, 并且最多执行3次, 弹窗展示用
        let discountTempArr = [];
        if (count > 0 && idx > -1 && runOnlyOne.current <= 1) {
            const countAttrArr = photoStore.photoProcessParams.attrItems[idx];
            console.log("价格列表：", JSON.parse(JSON.stringify(countAttrArr)))

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
                        console.log("没有找到对应的SKU信息：", tempSkuArr)
                    }
                } else {
                    console.log("sku长度不相等：", JSON.parse(JSON.stringify(arr)))
                }
                discountTempArr.push(obj)
            }
            console.log("执行完最终查找到的优惠列表：", discountTempArr)
            discountTempArr = discountTempArr.sort((a, b) => parseInt(a.value) - parseInt(b.value))
            setDiscountList([...discountTempArr]);
            runOnlyOne.current += 1;
        }

        // 根据当前总张数推算展示的阶梯价信息
        const tempList = distCountList.length > 0 ? distCountList : discountTempArr;
        console.log("开始查询阶梯价：", count, tempList)
        if (count > 0 && tempList.length > 0) {
            const currentIdx = tempList.findIndex((vItem) => {
                return count <= Number(vItem.value.trim())
            });
            console.log("当前的总数查询的位置：", currentIdx, tempList);

            if (currentIdx > -1) {
                let arr = !notNull(pSku) ? String(decodeURIComponent(pSku)).split(",") : [];
                arr.push(tempList[currentIdx].id);
                arr = arr.sort((a, b) => parseInt(a) - parseInt(b));
                if (arr.length === photoStore.photoProcessParams.attrItems.length) {
                    skuStr.current = arr.join(",");
                }

                const nextIdx = currentIdx + 1;
                console.log("下一个位置：", nextIdx)
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
                    console.log("nextIdx：", nextIdx)
                }
            } else {
                console.log("初始下标没有查到：", currentIdx, tempList)
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
     */
    function getRouterParams(params:{path?: [], forDetail?: boolean, incomplete?: boolean, onlyInitPrice?: boolean} = {}) {
        return new Promise<any>(async (resolve, reject) => {
            const opt = {
                path: params.path || [],
                forDetail: params.forDetail || false,
                incomplete: params.incomplete || false,
                onlyInitPrice: params.onlyInitPrice || false
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
                        }catch (e) {
                            console.log("初始获取参数错误：", e)
                        }
                    }
                    const obj = {
                        path: opt.forDetail || opt.incomplete ? [...photoStore.photoProcessParams.photo.path] : opt.path,
                        sku: decodeURIComponent(router.params.sku_id),
                        id: router.params.id
                    };
                    console.log("初始化的Object：", JSON.parse(JSON.stringify(obj)))

                    // 从服务器获取基本数据信息
                    const serPar = await api("app.product/info", {id: router.params.id});
                    const temp = {...serPar};
                    // temp.attrGroup = temp.attrGroup.map(val => ({...val, disable: !notNull(val.special_show)}))
                    temp.skus = temp.skus.filter(v => v.stock > 0);
                    useMoreThan.current = {...temp};

                    console.log("清除库存为0的数据：", useMoreThan.current)

                    // 找到当前模糊搜索的suk列表
                    let arr = [];
                    const sku = photoStore.photoProcessParams.photo.sku;
                    if (!notNull(sku)) {
                        arr = decodeURIComponent(sku).split(",");
                    }
                    arr = arr.sort((a, b) => a - b);
                    skuStr.current = arr.join(",");
                    currentSkus.current = temp.skus.filter(v => v.value.includes(arr.join(",")));
                    console.log("第一次产生的currentSkus：", skuStr.current, currentSkus.current);

                    // 如果是完成的SkuID
                    if (opt.forDetail) {
                        const tArr = serPar.skus.filter(v => v.id == obj.sku);
                        if (tArr.length > 0) {
                            setPrice([tArr[0].price])
                        }
                    }

                    const idx = serPar.attrGroup.findIndex(v => v.special_show === "photosize");
                    const numIdx = serPar.attrGroup.findIndex(v => v.special_show === "photonumber");
                    console.log("查找的下标：", idx, numIdx)
                    if (idx > -1 && !opt.onlyInitPrice) {

                        // 向本地存储attrItems
                        await photoStore.setActionParamsToServer(getUserKey(), {
                            photo: obj,
                            attrItems: serPar.attrItems,
                            index: idx,
                            numIdx,
                            pictureSize: serPar.attrItems[idx][0].value,
                            photoStyle: serPar.photostyle,
                            photoTplId: router.params.tplid,
                            max: serPar.max,
                            min: serPar.min
                        })
                        resolve()
                    } else {
                        opt.onlyInitPrice ? resolve() : reject("初始化尺寸时没找到尺寸")
                        console.log("初始化尺寸时没找到尺寸：", serPar)
                    }
                }
            }catch (e) {
                reject(e)
            }
        })
    }

    function checkHasRotate(attribute: string): boolean {
        if (router.params.id) {
            const pixArr = sizeArr.current;
            const imgPix = attribute.split("*");
            const num = Number(pixArr[0]) / Number(pixArr[1]);
            const cNum = Number(imgPix[0]) / Number(imgPix[1])
            console.log("超级计算：", num)
            /**
             * pixArr: 打印尺寸, imgPix：图片尺寸
             * 打印尺寸 大于 1，就判定为打印的是横图，图片尺寸不满足条件（也就是图片尺寸小于1）的话就旋转
             * 或
             * 打印尺寸小于1，就能判定为竖图，但是图片尺寸不满足条件的话（也就是图片尺寸大于1）就旋转
             */
            return cNum > 1 && num < 1 || cNum < 1 && num > 1
        }
        return false
    }

    function getTailoringImg(arr: any[]) {
        if (!_imgstyle.current && arr.length !== 3) {
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

    const selectPhoto = () => {
        let num = 0;
        for (const item of photos) {
            num += parseInt(item.count)
        }
        if (num >= photoStore.photoProcessParams.max) {
            Taro.showToast({
                title: `最多打印${photoStore.photoProcessParams.max}张`,
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
        console.log(router)


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
            } else if (router.params.detail && router.params.detail === "t") {  // 如果是从商品详情页过来，此时已经有选好的图片了，并且规格已经选好了
                await getRouterParams({path: [], forDetail: true});
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
        }catch (e) {
            console.log("初始化获取服务器的数据出错：", e)
        }


        console.log("读取的photo params：", params)

        const pix = photoStore.photoProcessParams.pictureSize;
        _imgstyle.current = photoStore.photoProcessParams.photoStyle

        console.log("尺寸参数：", pix)
        if (!notNull(pix)) {
            const pixArr = pix.split("*");
            console.log("格式化素组：", pixArr)
            sizeArr.current = pixArr;
            const tArr = [
                {key: "w", val: pixArr[0]},
                {key: "h", val: pixArr[1]},
                {key: "r", val: 0},
            ];

            if (params.photo.path.length === 0) {
                selectPhoto()
            }
            params.photo.path = params.photo.path.map((v) => {
                const allowRotate = checkHasRotate(v.attr);
                const arr = [...tArr];
                if (allowRotate) {
                    arr[2].val = 90;
                }
                return {
                    ...v,
                    url: v.url,
                    count: notNull(v.count) ? 1 : parseInt(v.count),
                    hasRotate: allowRotate,
                    osx: getTailoringImg(arr),
                    readLocal: v.originalData && v.originalData.length > 0
                }
            })
            setPhotos([...params.photo.path] || []);
        }

        Taro.hideLoading();

    })

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
            console.log("更新数量出错：", e)
        }
    }, 500, false)

    const onAddCount = async (num, idx) => {
        let _num = Number(num);
        _num = _num + 1;

        const arr = [...photos];

        arr[idx].count = Number(_num);
        setPhotos([...arr]);
        debounceUpdateCount(idx, Number(_num))
    }

    const onReducer = async (prevNum, idx) => {
        let num = Number(prevNum);
        num = num - 1;
        if (num < 1) {
            num = 1
        }

        const arr = [...photos];
        arr[idx].count = Number(num);
        setPhotos([...arr]);
        debounceUpdateCount(idx, Number(num))
    }

    const onDeleteImg = idx => {
        const arr = [...photos];
        arr.splice(idx, 1);
        setPhotos([...arr])
    }

    function setCount(_, id) {
        if (detailStatus) {
            return
        }
        let arr = [];
        arr = String(decodeURIComponent(photoStore.photoProcessParams.photo.sku)).split(",")
        arr.push(id);

        console.log("追加的skuID：", arr)
        skuArr.current = [...arr]
        setSkus([...arr])
    }

    const forIDJumpToDatail = async (skuId) => {
        let count = 0;
        photos.forEach(value => {
            count += parseInt(value.count)
        })

        const data = {
            skuid: skuId,
            total: count,
            page: "photo",
            parintImges: photos.map(v => {
                const pixArr = photoStore.photoProcessParams.pictureSize.split("*");
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
            Taro.navigateTo({
                url: updateChannelCode(`/pages/order/pages/template/confirm?skuid=${skuId}&total=${count}&page=photo`)
            })
        } catch (e) {
            console.log("本地存储失败：", e)

        }
    }

    const onCreateOrder = async () => {

        if (photos.length <= 0 || countStatus === 1 || countStatus === 3) {
            return
        }

        if (detailStatus && notNull(router.params.inc)) {
            // 已选好所有规格，直接跳转
            forIDJumpToDatail(router.params.sku_id)
            return
        }

        if (detailStatus && !notNull(router.params.inc)) {
            let currentSkuId = null;
            console.log(currentSkus)
            for (let i = 0; i < currentSkus.current.length; i++) {
                const item = currentSkus.current[i];
                if (skuStr.current === item.value) {
                    currentSkuId = item.id;
                    console.log(item)
                    break;
                }
            }
            console.log("当前找到的ID：", currentSkuId)
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
            console.log("总数量：", count)
            const idx = photoStore.photoProcessParams.numIdx || 1;
            console.log("数量的下标：", idx)
            if (photoStore.photoProcessParams.numIdx != -1) {
                const len = photoStore.photoProcessParams.attrItems[idx].length
                for (let i = 0; i < len; i++) {
                    const item = photoStore.photoProcessParams.attrItems[idx][i];
                    console.log(1111, JSON.parse(JSON.stringify(item)))
                    if (parseInt(item.value) >= count) {
                        let c = i - 1;
                        if (c <= 0) {
                            c = 0
                        }
                        console.log("c：", c, i)
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

            console.log(skuArr.current, res.attrGroup.length)

            if (skuArr.current.length === res.attrGroup.length) {
                const tArr = skuArr.current.sort((a, b) => parseInt(a) - parseInt(b));
                console.log("tArr：", tArr)
                const tStr = tArr.join(",");
                console.log(tStr)
                let currentSkuId = null;
                for (let i = 0; i < res.skus.length; i++) {
                    const item = res.skus[i];
                    if (tStr === item.value) {
                        currentSkuId = item.id;
                        console.log(item)
                        break;
                    }
                }
                console.log("当前找到的ID：", currentSkuId)
                if (!notNull(currentSkuId)) {
                    forIDJumpToDatail(currentSkuId)
                }
            } else {
                setTimeout(() => {
                    setVisible(true)
                }, 10)
            }
        } catch (e) {
            console.log("获取商品详情出错：", e)
        }
        Taro.hideLoading()
    }

    const orderSkuChange = (skus: any[], skuID: number | string) => {
        console.log("sku信息：", skus, skuID)
        setSkuInfoID(skuID)
    }

    const onSubmitOrder = async () => {
        let count = 0;
        for (const item of photos) {
            count += parseInt(item.count)
        }

        const pix = photoStore.photoProcessParams.pictureSize;

        console.log("尺寸参数：", pix)

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

        try {

            await photoStore.updateServerParams(photoStore.printKey, {
                changeUrlParams: data
            })
            Taro.navigateTo({
                url: updateChannelCode(`/pages/order/pages/template/confirm?skuid=${skuInfoID}&total=${count}&page=photo`)
            })
        } catch (e) {
            console.log("本地存储失败：", e)

        }
    }

    const closeSelectPhoto = () => {
        setAnimating(false);
        setTimeout(() => {
            setPhotoPickerVisible(false)
        }, 500)
    }

    const onPhotoSelect = async (data: {ids: [], imgs: [], attrs: []}) => {

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
        if (sizeArr.current[0] && sizeArr.current[1]) {
            const tArr = [
                {key: "w", val: sizeArr.current[0]},
                {key: "h", val: sizeArr.current[1]},
                {key: "r", val: 0},
            ];
            exArr = arr.map(v => {
                const allowRotate = checkHasRotate(v.attr);
                const arr = [...tArr];

                if (allowRotate) {
                    arr[2].val = 90;
                }
                console.log("处理后的旋转度：", arr[2],allowRotate, sizeArr.current, v.attr)
                return {
                    ...v,
                    hasRotate: allowRotate,
                    osx: getTailoringImg(arr),
                    url: v.url,
                }
            })
        }

        await photoStore.updateServerParams(photoStore.printKey, {
            photo: {
                ...photoStore.photoProcessParams.photo,
                path: exArr
            }
        })

        setPhotos([...exArr]);
        setPhotoPickerVisible(false)
    }

    const onEditClick = async (item ,index) => {

        const obj: any = {
            idx: index,
            cid: router.params.id,
            tplid: router.params.cid,
            key: photoStore.printKey,
            local: !notNull(item.readLocal) && item.readLocal === true ? "t" : "f",
            status: item.edited && !notNull(item.doc) ? "t" : "f",
            img: item.url,
        };

        // if (deviceInfo.env === "weapp") {
        //     Object.assign(obj, {key: photoStore.printKey})
        // }

        try {
            if (!notNull(item.readLocal) && item.readLocal === true) {
                await photoStore.updateServerParams(photoStore.printKey, {
                    originalData: item.originalData
                })
            }
        }catch (e) {
            console.log("向本地存储旧数据出错：", e)
        }

        jumpToPrintEditor(obj)
    }

    const onBackHandle = async () => {
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
            : deviceInfo.windowHeight - 110 + deviceInfo.statusBarHeight + deviceInfo.menu.height + "px"
    }

    const scrollVal = useRef<number>(0);
    const debounceScroll = useDebounceFn(() => {
        setScrolling(false)
    }, 300, false)
    const onScroll = (e) => {
        const top = e.detail.scrollTop;
        scrollVal.current = top;
        setScrolling(true);
        if (scrollVal.current === top) {
            debounceScroll()
        }
    }

    return (
        <View className="printing_container">
            <LoginModal isTabbar={false} />
            {
                discountStatus
                    ? <Discount list={distCountList} onClose={() => setDiscountStatus(false)}/>
                    : null
            }
            <AtNavBar onClickLeftIcon={onBackHandle}
                      customStyle={{
                          paddingTop: deviceInfo.env === "weapp" ? deviceInfo.statusBarHeight + "px" : "0px"
                      }}
                      color='#121314' title="照片冲印列表" border fixed
                      leftIconType={{value: 'chevron-left', color: '#121314', size: 24}}
            />
            <View className="fixed_top_price_container" style={{
                top: `${deviceInfo.env === "weapp" ? deviceInfo.menu.bottom + 4 : 44}px`
            }}>
                <View className="left">
                    <Text className="txt">现单价：￥{price.length === 1 ? price[0] : `${price[0]}${!detailStatus ? "起" : ""}`}</Text>
                </View>
                <View className="right">
                    {
                        discountInfo.status
                            ? <View className="more_price_info" onClick={() => setDiscountStatus(true)}>
                                <Text className="red_txt">再加{discountInfo.count}张,单价低至￥{discountInfo.price}</Text>
                                <IconFont name="24_xiayiye" color="#FF4966" size={28} />
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
                                  paddingTop: deviceInfo.statusBarHeight + 56 + "px",
                                  paddingBottom: 22 + "px"
                              }
                              : {
                                paddingBottom: "88px",
                                paddingTop: 56
                              }
                      }
                >
                    {
                        photos.map((value, index) => (
                            <View className="print_change_item_wrap" key={index+""}
                                  style={{
                                      width: deviceInfo.windowWidth / 2 + "px"
                                  }}>
                                <View className="print_change_item"
                                      style={{
                                          width: deviceInfo.windowWidth / 2 - 26 + "px"
                                      }}
                                >
                                    <View className="print_change_del" onClick={() => onDeleteImg(index)}>
                                        <IconFont name="32_guanbi" size={32}/>
                                    </View>
                                    <View className="print_change_img">
                                        <Image src={value.hasRotate ? `${value.url}?${value.osx}` : value.url}
                                               className="p_img"
                                               mode="aspectFill"
                                               onClick={() => onEditClick(value, index)}
                                               style={{
                                                   // transform: value.hasRotate ? "rotateZ(90deg)" : "none",
                                                   // width: value.hasRotate ? 203 : 152,
                                                   // height: value.hasRotate ? 152 : 203
                                               }}
                                        />
                                    </View>
                                    <View className="print_change_count">
                                        <View className='counter-fc'>
                                            <View className='reduce' onClick={() => onReducer(value.count, index)}>
                                                <Image src={require(`../../../../source/${value.count > 1 ? "reduceActive" : "reduce"}.png`)} className='img'/>
                                            </View>
                                            <Text className='num'>{value.count || 1}</Text>
                                            <View className='add' onClick={() => onAddCount(value.count, index)}>
                                                <Image src={require(`../../../../source/add.png`)} className='img'/>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))
                    }
                </View>
            </ScrollView>
            <View className={`print_fixed_select_button ${scrolling ? "print_fixed_btn_ainm" : ""}`}
                  onClick={selectPhoto}
                  style={{bottom: deviceInfo.env === "weapp" ? `${deviceInfo.safeBottomHeight + 80}px` : 80}}>
                <IconFont name="24_jiahao" size={40} color="#FF4966" />
                <Text className="txt">加图</Text>
            </View>
            <View className="print_foot">
                <View className="print_foot_main" style={{justifyContent: "space-around"}}>
                    <View className="print_info">
                        {
                            !notNull(describe)
                                ? <View className="top">
                                    <Image src={require("../../../../source/waing.png")} className="top_icon" />
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
                    ? <View>
                        {/*<OrderModal data={goodsInfo.current}*/}
                        {/*            isShow={visible}*/}
                        {/*            defaultActive={skus || []}*/}
                        {/*            onClose={() => setVisible(false)}*/}
                        {/*            onSkuChange={orderSkuChange}*/}
                        {/*            onNowBuy={onSubmitOrder}*/}
                        {/*/>*/}
                        <PlaceOrder  data={goodsInfo.current} isShow={visible}
                                     onClose={() => setVisible(false)}
                                     onSkuChange={orderSkuChange}
                                     quoteType="photo"
                                     defaultSelectIds={skus || []}
                                     onNowBuy={onSubmitOrder} />
                    </View>
                    : null
            }
            {
                photoVisible
                    ? <View className={`photo_picker_container ${animating ? "photo_picker_animate" : ""}`}>
                        <PhotosEle editSelect
                                onClose={closeSelectPhoto}
                                count={photoStore.photoProcessParams.imageCount}
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
