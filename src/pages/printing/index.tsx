import Taro, {useEffect, useState, useRef} from "@tarojs/taro";
import {Image, ScrollView, Text, View} from "@tarojs/components";
import "./index.less";
import {AtNavBar} from "taro-ui";
import IconFont from "../../components/iconfont";
import {deviceInfo, getURLParamsStr, notNull, urlEncode} from "../../utils/common";
import {api} from "../../utils/net";
import Photos from "../me/photos";
import {userStore} from "../../store/user";
import moment from "moment";
import {templateStore} from "../../store/template";

const Index: Taro.FC<any> = () => {

    const [checked, setChecked] = useState(0);
    const router = Taro.useRouter();
    const [sizeItem, setSizeItem] = useState([]);
    const [photoVisible, setPhotoPickerVisible] = useState(false);
    const [animating, setAnimating] = useState(false);
    const info = useRef<any>({});

    useEffect(() => {
        const id = router.params.id;
        if (id) {
            api("app.product/info", {id}).then(res => {
                info.current = {...res} || {};
                let arr = [];
                const idx = res.attrGroup.findIndex(v => v.special_show === "photosize");
                const numIdx = res.attrGroup.findIndex(v => v.special_show === "photonumber");
                if (idx > -1) {
                    arr = [...res.attrItems[idx]];
                    setSizeItem([...arr]);
                    setChecked(Number(arr[0].id))

                    // 向本地存储attrItems
                    Taro.setStorage({
                        key: "print_attrItems",
                        data: JSON.stringify({
                            attrItems: res.attrItems,
                            index: idx,
                            numIdx
                        })
                    })
                } else {
                    console.log("初始化尺寸时没找到尺寸：", res)
                }

            }).catch(e => {
                console.log("获取--app.product/info出错：", e)
            })

        }
    }, [])

    const selectSize = id => {
        setChecked(Number(id))
    }

    function renderParams(path: any[], allowFastJump: boolean = false) {
        const temp = {path, sku: checked, id: router.params.id};
        try {
            Taro.setStorageSync(`${userStore.id}_photo_${moment().date()}`, JSON.stringify(temp))
        }catch (e) {
            console.log("存储错误：", e)
        }
        templateStore.photoSizeParams = temp;

        let obj: any = {
            id: router.params.id,
            cid: info.current.category.tpl_category_id,
            max: info.current.max,
            tplmax: info.current.tpl_max,
            proid: router.params.imgid
        }

        if (allowFastJump) {
            obj = {...obj, status: "t"}
        }

        const str = getURLParamsStr(urlEncode(obj))
        console.log(str)
        Taro.navigateTo({
            url: `/pages/printing/change?${str}`
        })
    }

    const onPhotoSelect = (data: {ids: [], imgs: [], attrs: []}) => {
        console.log("返回的结果：", data)

        setPhotoPickerVisible(false)
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

    function allowJump() {
        const {imgid, img, attr, status} = router.params;
        return !notNull(imgid) && !notNull(img) && !notNull(attr) && !notNull(status) && status == "t"
    }

    const selectPhoto = () => {

        if (allowJump()) {
            let arr = []
            arr.push({
                id: router.params.imgid,
                url: router.params.img,
                attr: router.params.attr,
                edited: false,
                doc: ""
            });
            renderParams([], true);
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

    return (
        <View className="printing_container">
            <AtNavBar onClickLeftIcon={() => Taro.navigateBack()}
                      color='#121314' title="选择尺寸" border fixed
                      leftIconType={{value: 'chevron-left', color: '#121314', size: 24}}
            />
            <ScrollView scrollY className="printing_scroll_container" style={{height: deviceInfo.windowHeight - 110}}>
                <View className="printing_main">
                    {
                        sizeItem.map((item, index) => (
                            <View className="printing_item" key={index+""} onClick={() => selectSize(item.id)}>
                                <View className="left">
                                    <Image src={require("../../source/print.png")} className="icon"/>
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
                    <Text className="txt">{allowJump() ? "下一步" : "添加照片"}</Text>
                </View>
            </View>
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

export default Index
