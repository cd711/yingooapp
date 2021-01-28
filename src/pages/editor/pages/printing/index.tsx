import Taro, {useState, useRef, useEffect} from "@tarojs/taro";
import {Image, ScrollView, Text, View} from "@tarojs/components";
import "./index.less";
import {AtNavBar} from "taro-ui";
import IconFont from "../../../../components/iconfont";
import {
    debuglog,
    deviceInfo,
    getURLParamsStr,
    getUserKey,
    jumpToPrintEditor,
    notNull, removeDuplicationForArr, setPageTitle, shareAppExtends,
    sleep, updateChannelCode,
    urlEncode
} from "../../../../utils/common";
import {api, options} from "../../../../utils/net";
import PhotosEle from "../../../../components/photos/photos";
import photoStore from "../../../../store/photo";
import {PhotoParams} from "../../../../modal/modal";
import LoginModal from "../../../../components/login/loginModal";
import {userStore} from "../../../../store/user";
import {IValueDidChange, observe} from "mobx";

const Index: Taro.FC<any> = () => {

    const [checked, setChecked] = useState(0);
    const [checkAttr, setCheckAttr] = useState("");
    const router = Taro.useRouter();
    const [sizeItem, setSizeItem] = useState([]);
    const [photoVisible, setPhotoPickerVisible] = useState(false);
    const [animating, setAnimating] = useState(false);
    const info = useRef<any>({});
    const isMandatory = useRef<boolean>(false);
    const [hasChanged, setChangeStatus] = useState<boolean>(false);
    const hasTplID = useRef<boolean>(!!router.params.tplid)

    useEffect(() => {
        setPageTitle("选择尺寸")
    }, [])

    async function getBasicInfo() {
        let params = {};
        try {
            const id = router.params.id;
            if (id) {
                const res = await api("app.product/info", {id});
                info.current = {...res} || {};
                let arr = [];
                const idx = res.attrGroup.findIndex(v => v.special_show === "photosize");
                const numIdx = res.attrGroup.findIndex(v => v.special_show === "photonumber");
                const setMealIdx = res.attrGroup.findIndex(v => v.special_show === "setmeal");
                debuglog("查找的下标：", idx, numIdx)
                if (idx > -1) {
                    arr = [...res.attrItems[idx]];
                    setSizeItem([...arr]);
                    setChecked(Number(arr[0].id))
                    setCheckAttr(res.attrItems[idx][0].value)

                    params = {
                        attrItems: res.attrItems,
                        index: idx,
                        numIdx,
                        setMealIdx,
                        pictureSize: res.attrItems[idx][0].value,
                        photoStyle: res.photostyle,
                        max: res.max,
                        min: res.min
                    }

                } else {
                    debuglog("初始化尺寸时没找到尺寸：", res)
                }
            }
        } catch (e) {
            debuglog("获取--app.product/info出错：", e)
        }

        if (hasTplID.current) {
            params = {
                ...params,
                photoTplId: router.params.tplid
            }
            try {
                const tplInfo = await api("app.product_tpl/info", {id: router.params.tplid});
                if (!notNull(tplInfo.image_num)) {
                    params = {
                        ...params,
                        imageCount: tplInfo.image_num
                    }
                }
            }catch (e) {
                debuglog(`获取照片模板详情出错：${router.params.tplid}`, e)
            }
        }

        // 如果是从模板选择进来的, 会有一个数量限制
        if (!notNull(router.params.limit) && router.params.limit === "t") {
            params = {
                ...params,
                limit: true
            }
        }

        debuglog("初始化的参数 getBasicInfo：", params)

        await photoStore.setActionParamsToServer(getUserKey(), new PhotoParams(params));

        if (photoStore.photoProcessParams.photo.path.length === 0) {
            selectPhoto();
            isMandatory.current = true;
        }

    }

    Taro.useDidShow(() => {

        getBasicInfo()

    })

    observe(photoStore, "photoProcessParams", (val: IValueDidChange<PhotoParams>) => {
        if (hasTplID.current) {
            setChangeStatus(val.newValue.editPhotos.length > 0)
        } else {
            setChangeStatus(val.newValue.photo.path.length > 0)
        }
    })

    if (deviceInfo.env === "weapp") {
        Taro.useShareAppMessage(() => {
            return shareAppExtends()
        })
    }

    const selectSize = async (id, attr) => {
        console.log("当前选择的尺寸：", id, attr)
        setChecked(Number(id));
        setCheckAttr(attr)
        try {
            await photoStore.updateServerParams(photoStore.printKey, {
                pictureSize: attr
            })
        } catch (e) {

        }
    }

    async function renderParams(path: any[], photo = []) {
        Taro.showLoading({title: "请稍后..."});
        const temp:any = {path, sku: checked, id: router.params.id};

        // 存储选择的照片
        await photoStore.updateServerParams(photoStore.printKey, {
            photo: hasTplID.current ? {...temp, path: []} : temp,
            pictureSize: checkAttr,
            editPhotos: path,
            usefulImages: removeDuplicationForArr({
                newArr: photo,
                oldArr: photoStore.photoProcessParams.usefulImages
            })
        })

        Taro.hideLoading();

    }


    const onPhotoSelect = (data: {ids: [], imgs: [], attrs: []}) => {
        debuglog("返回的结果：", data)
        if (data.ids.length === 0) {
            return
        }

        setPhotoPickerVisible(false);

        const path = [];
        for (let i = 0; i < data.ids.length; i++) {
            path.push({
                id: data.ids[i],
                url: data.imgs[i],
                attr: data.attrs[i],
                edited: false,
                doc: ""
            })
        }

        renderParams(path, data.ids.map((value, index) => ({id: value, url: data.imgs[index]})))

    }

    const selectPhoto = async () => {
        if (notNull(userStore.id)) {
            userStore.showLoginModal = true
            return
        }

        const len = hasTplID.current ? photoStore.photoProcessParams.editPhotos.length :  photoStore.photoProcessParams.photo.path.length;

        if (len > 0) {
            const obj: any = {
                id: router.params.id,
                cid: info.current.category.tpl_category_id,
            }

            await sleep(100);

            // 从照片模板点击 -->  选择照片后 --> 直接进入编辑器
            if (hasTplID.current) {
                const p = {
                    cid: router.params.id,
                    tplid: info.current.category.tpl_category_id,
                    key: photoStore.printKey,
                    status: "f",
                    init: "t",
                }
                jumpToPrintEditor(p)
                return
            }

            // 否则 --> 进入照片冲印列表页面
            const str = getURLParamsStr(urlEncode(obj));
            Taro.navigateTo({
                url: updateChannelCode(`/pages/editor/pages/printing/change?${str}`)
            })
        } else {
            setPhotoPickerVisible(true);

            setTimeout(() => {
                setAnimating(true)
            }, 50)
        }
    }

    const closeSelectPhoto = () => {
        setAnimating(false);
        setTimeout(() => {
            setPhotoPickerVisible(false)
        }, 500)
    }

    const getBoxSize = (val: string) => {
        if (notNull(val)) {
            return " "
        }
        const strArr = val.split("*");
        const x = parseInt(strArr[0]) * 0.085;
        const y = parseInt(strArr[1]) * 0.085;
        return `${parseInt(x.toString())}*${parseInt(y.toString())}mm`
    }

    const getScrollHeight = () => {
        return deviceInfo.env === "h5"
            ? deviceInfo.windowHeight - 110 + "px"
            : deviceInfo.windowHeight - 110 + deviceInfo.statusBarHeight + deviceInfo.menu.height + "px"
    }

    const onBackHandle = async () => {
        photoStore.updateServerParams(getUserKey(), new PhotoParams())
        Taro.navigateBack()
    }

    return (
        <View className="printing_container">
            <LoginModal isTabbar={false} />
            <AtNavBar onClickLeftIcon={onBackHandle}
                      color='#121314' title="选择尺寸" border fixed
                      customStyle={{
                          paddingTop: deviceInfo.env === "weapp" ? deviceInfo.statusBarHeight + "px" : "0px"
                      }}
                      leftIconType={{value: 'chevron-left', color: '#121314', size: 24}}
            />
            <ScrollView scrollY className="printing_scroll_container" enableFlex style={{height: getScrollHeight()}}>
                <View className="printing_main"
                      style={
                          deviceInfo.env === "weapp"
                              ? {
                                paddingTop: deviceInfo.statusBarHeight + "px",
                                paddingBottom: 22 + "px"
                              }
                              : null
                      }
                >
                    {
                        sizeItem.map((item, index) => (
                            <View className="printing_item" key={index+""} onClick={() => selectSize(item.id, item.value)}>
                                <View className="left">
                                    <Image src={`${options.sourceUrl}appsource/print.png`} className="icon"/>
                                    <View className="info">
                                        <Text className="h2">{item.name}</Text>
                                        <Text className="txt">{getBoxSize(item.value)}</Text>
                                    </View>
                                </View>
                                <View className="right">
                                    <View className="check_icon">
                                        <IconFont
                                            name={Number(item.id) === checked ? "22_yixuanzhong" : "22_touming-weixuanzhong"}
                                            size={44}/>
                                    </View>
                                </View>
                            </View>
                        ))
                    }
                </View>
            </ScrollView>
            <View className="print_foot">
                <View className="print_foot_main">
                    <View className="print_submit" onClick={selectPhoto}>
                        <Text className="txt">{!hasChanged ? "请选择图片" : "下一步"}</Text>
                    </View>
                </View>
            </View>
            {
                photoVisible
                    ? <View className={`photo_picker_container ${animating ? "photo_picker_animate" : ""}`}>
                        <PhotosEle
                            editSelect={photoVisible}
                            onClose={closeSelectPhoto}
                            defaultSelect={photoStore.photoProcessParams.usefulImages}
                            count={photoStore.photoProcessParams.imageCount}
                            max={photoStore.photoProcessParams.max}
                            onPhotoSelect={onPhotoSelect} />
                    </View>
                    : null
            }
        </View>
    )
}

export default Index
