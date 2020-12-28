import Taro, {useEffect, useState, useRef} from "@tarojs/taro";
import {Image, ScrollView, Text, View} from "@tarojs/components";
import "./index.less";
import {AtNavBar} from "taro-ui";
import IconFont from "../../../../components/iconfont";
import {
    deviceInfo,
    getURLParamsStr,
    getUserKey,
    jumpToPrintEditor,
    notNull,
    sleep,
    urlEncode
} from "../../../../utils/common";
import {api} from "../../../../utils/net";
import PhotosEle from "../../../../components/photos/photos";
import photoStore from "../../../../store/photo";
import {PhotoParams} from "../../../../modal/modal";
import LoginModal from "../../../../components/login/loginModal";
import {userStore} from "../../../../store/user";

const Index: Taro.FC<any> = () => {

    const [checked, setChecked] = useState(0);
    const [checkAttr, setCheckAttr] = useState("");
    const router = Taro.useRouter();
    const [sizeItem, setSizeItem] = useState([]);
    const [photoVisible, setPhotoPickerVisible] = useState(false);
    const [animating, setAnimating] = useState(false);
    const info = useRef<any>({});

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
                console.log("查找的下标：", idx, numIdx)
                if (idx > -1) {
                    arr = [...res.attrItems[idx]];
                    setSizeItem([...arr]);
                    setChecked(Number(arr[0].id))
                    setCheckAttr(res.attrItems[idx][0].value)

                    params = {
                        attrItems: res.attrItems,
                        index: idx,
                        numIdx,
                        pictureSize: res.attrItems[idx][0].value,
                        photoStyle: res.photostyle,
                        max: res.max
                    }

                } else {
                    console.log("初始化尺寸时没找到尺寸：", res)
                }
            }
        } catch (e) {
            console.log("获取--app.product/info出错：", e)
        }

        if (router.params.tplid) {
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
                console.log(`获取照片模板详情出错：${router.params.tplid}`, e)
            }
        }

        console.log("初始化的参数 getBasicInfo：", params)

        await photoStore.setActionParamsToServer(getUserKey(), params)

    }

    useEffect(() => {

        getBasicInfo()

    }, [])

    const selectSize = (id, attr) => {
        setChecked(Number(id));
        setCheckAttr(attr)
    }

    function allowJump() {
        const {tplid} = router.params;
        return !notNull(tplid)
    }

    async function renderParams(path: any[]) {
        Taro.showLoading({title: "请稍后..."});
        const temp = {path, sku: checked, id: router.params.id};

        // 存储选择的照片
        await photoStore.updateServerParams(photoStore.printKey, {
            photo: allowJump() ? {...temp, path: []} : temp,
            pictureSize: checkAttr,
            editPhotos: path
        })


        const obj: any = {
            id: router.params.id,
            cid: info.current.category.tpl_category_id,
        }

        Taro.hideLoading();
        await sleep(100);

        // 从照片模板点击 -->  选择照片后 --> 直接进入编辑器
        if (allowJump()) {
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
            url: `/pages/editor/pages/printing/change?${str}`
        })
    }


    const onPhotoSelect = (data: {ids: [], imgs: [], attrs: []}) => {
        console.log("返回的结果：", data)

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

        renderParams(path)

    }

    const selectPhoto = () => {
        if (notNull(userStore.id)) {
            userStore.showLoginModal = true
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
                              ? {paddingTop: deviceInfo.statusBarHeight + "px"}
                              : null
                      }
                >
                    {
                        sizeItem.map((item, index) => (
                            <View className="printing_item" key={index+""} onClick={() => selectSize(item.id, item.value)}>
                                <View className="left">
                                    <Image src={require("../../../../source/print.png")} className="icon"/>
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
                <View className="print_submit" onClick={selectPhoto}>
                    <Text className="txt">下一步</Text>
                </View>
            </View>
            {
                photoVisible
                    ? <View className={`photo_picker_container ${animating ? "photo_picker_animate" : ""}`}>
                        <PhotosEle editSelect={photoVisible}
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

export default Index
