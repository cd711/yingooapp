import Taro, {useEffect, useState} from "@tarojs/taro";
import {Image, ScrollView, Text, View} from "@tarojs/components";
import "./index.less";
import {AtNavBar} from "taro-ui";
import IconFont from "../../../../components/iconfont";
import {
    deviceInfo, getURLParamsStr,
    getUserKey,
    jumpToPrintEditor,
    notNull, sleep,
    urlEncode
} from "../../../../utils/common";
import {api} from "../../../../utils/net";
import OrderModal from "./orederModal";
import {PhotoParams} from "../../../../modal/modal";
import PhotosEle from "../../../../components/photos/photos";
import photoStore from "../../../../store/photo";
import LoginModal from "../../../../components/login/loginModal";
import {userStore} from "../../../../store/user";

const PrintChange: Taro.FC<any> = () => {

    const router = Taro.useRouter();

    const [photos, setPhotos] = useState([]);
    const [visible, setVisible] = useState(false);
    const goodsInfo = Taro.useRef({});
    const [skus, setSkus] = useState<any[]>([]);
    const [skuInfo, setSkuInfo] = useState<any>({});
    const [photoVisible, setPhotoPickerVisible] = useState(false);
    const [animating, setAnimating] = useState(false);
    const _imgstyle = Taro.useRef("");
    const sizeArr = Taro.useRef<any[]>([]);

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

    /**
     * 在首页活动页跳转过来后，要携带的sku_ID和分类ID，如果两者都在，就说明跳过了上一步选尺寸页面，
     * 需要重新初始化当前用户的 photo Key
     * @param {Array} path
     */
    function getRouterParams(path = []) {
        return new Promise<any>(async (resolve, reject) => {
            try {
                if (!router.params.sku_id || !router.params.id) {
                    Taro.showToast({
                        title: "没有相关ID信息",
                        icon: "none"
                    })
                    reject(`没有相关ID信息: sku_id、分类ID`);
                } else {
                    const obj = {
                        path,
                        sku: router.params.sku_id,
                        id: router.params.id
                    };

                    // 从服务器获取基本数据信息
                    const serPar = await api("app.product/info", {id: router.params.id});

                    const idx = serPar.attrGroup.findIndex(v => v.special_show === "photosize");
                    const numIdx = serPar.attrGroup.findIndex(v => v.special_show === "photonumber");
                    console.log("查找的下标：", idx, numIdx)
                    if (idx > -1) {

                        // 向本地存储attrItems
                        await photoStore.setActionParamsToServer(getUserKey(), {
                            photo: obj,
                            attrItems: serPar.attrItems,
                            index: idx,
                            numIdx,
                            pictureSize: serPar.attrItems[idx][0].value,
                            photoStyle: serPar.photostyle,
                            photoTplId: router.params.tplid
                        })
                        resolve()
                    } else {
                        reject("初始化尺寸时没找到尺寸")
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
                    url: `/pages/editor/pages/printing/change?${getURLParamsStr(urlEncode(ap))}`
                })
            } else {
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
            setPhotos([...params.photo.path] || [])
        }

        Taro.hideLoading()
    })

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
        if (count >= photoStore.photoProcessParams.max) {
            Taro.showToast({
                title: `最多打印${photoStore.photoProcessParams.max}张`,
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
        arr.push(photoStore.photoProcessParams.photo.sku);
        arr.push(id);

        console.log("追加的skuID：", arr)
        setSkus([...arr])
    }

    const onCreateOrder = async () => {
        if (photos.length <= 0) {
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
                    if (parseInt(item.value) > count) {
                        let c = i - 1;
                        if (c <= 0) {
                            c = 0
                        }
                        setCount(res, photoStore.photoProcessParams.attrItems[idx][c].id)
                        break;
                    } else {
                        if (i === len - 1) {
                            setCount(res, photoStore.photoProcessParams.attrItems[idx][len - 1].id)
                            break;
                        }
                    }
                }
            } else {
                setSkus([photoStore.photoProcessParams.photo.sku])
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

        try {

            await photoStore.updateServerParams(photoStore.printKey, {
                changeUrlParams: data
            })

        } catch (e) {
            console.log("本地存储失败：", e)

        }
        Taro.navigateTo({
            url: `/pages/order/pages/template/confirm?skuid=${skuInfo.id}&total=${count}&page=photo`
        })
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
            local: !notNull(item.readLocal) && item.readLocal === true ? "t" : "f",
            status: item.edited && !notNull(item.doc) ? "t" : "f",
            img: item.url,
        };

        if (deviceInfo.env === "weapp") {
            Object.assign(obj, {key: photoStore.printKey})
        }

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
                window.location.href = "/";
            } else {
                Taro.switchTab({url: "/pages/tabbar/index/index"});
            }
        }
    }

    const getScrollHeight = () => {
        return deviceInfo.env === "h5"
            ? deviceInfo.windowHeight - 110 + "px"
            : deviceInfo.windowHeight - 110 + deviceInfo.statusBarHeight + deviceInfo.menu.height + "px"
    }

    return (
        <View className="printing_container">
            <LoginModal isTabbar={false} />
            <AtNavBar onClickLeftIcon={onBackHandle}
                      customStyle={{
                          paddingTop: deviceInfo.env === "weapp" ? deviceInfo.statusBarHeight + "px" : "0px"
                      }}
                      color='#121314' title="照片冲印列表" border fixed
                      leftIconType={{value: 'chevron-left', color: '#121314', size: 24}}
            />
            <ScrollView scrollY enableFlex className="printing_scroll_container" style={{height: getScrollHeight()}}>
                <View className="printing_change_main"
                      style={
                          deviceInfo.env === "weapp"
                              ? {paddingTop: deviceInfo.statusBarHeight + "px"}
                              : null
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
                                                <Image src={require("../../../../source/reduce.png")} className='img'/>
                                            </View>
                                            <Text className='num'>{value.count || 1}</Text>
                                            <View className='add' onClick={() => onAddCount(value.count, index)}>
                                                <Image src={require("../../../../source/add.png")} className='img'/>
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
                <View className="btn" onClick={onCreateOrder} style={{opacity: photos.length > 0 ? 1 : 0.7}}>
                    <Text className="txt">立即下单</Text>
                </View>
            </View>
            {
                visible
                    ? <OrderModal data={goodsInfo.current}
                                  isShow={visible}
                                  defaultActive={skus || []}
                                  onClose={() => setVisible(false)}
                                  onSkuChange={orderSkuChange}
                                  onNowBuy={onSubmitOrder}
                    />
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
