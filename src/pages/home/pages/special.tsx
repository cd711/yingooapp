import Taro, {useState, useEffect} from "@tarojs/taro";
import {View, Text, Image, ScrollView} from "@tarojs/components";
import "../../tabbar/index/index.less";
import IconFont from "../../../components/iconfont";
import {cutString, deviceInfo, fixStatusBarHeight, getURLParamsStr, ossUrl, urlEncode} from "../../../utils/common";
import {AtNavBar} from "taro-ui";
import {api} from "../../../utils/net";
import LoadMore from "../../../components/listMore/loadMore";

const Special: Taro.FC<any> = () => {

    const router = Taro.useRouter();

    const [showBar, setBarVisible] = useState<boolean>(false);
    const [list, setList] = useState<Array<any>>([]);
    const [total, setTotal] = useState<number>(0);
    const [info, setInfo] = useState<any>({});
    const [loadStatus, setLoadStatus] = useState<'more' | 'loading' | 'noMore'>("more")

    async function getSpecialList(params: {start?: number, size?: number, loadMore?: boolean} = {}) {
        const opt = {
            start: params.start || 0,
            size: params.size || 15,
            loadMore: params.loadMore || false
        };
        const id = router.params.specialid;
        if (id) {
            try {
                const res = await api("app.special/list", {
                    special_id: id,
                    start: opt.start,
                    size: opt.size
                });
                setTotal(Number(res.total))
                let arr = [];
                if (opt.loadMore) {
                    arr = [...list, ...res.list || []]
                } else {
                    arr = res.list;
                }

                setList([...arr])

                if (parseInt(res.total) === arr.length) {
                    setLoadStatus("noMore")
                }

            }catch (e) {
                console.log("获取专题列表出错：", e)
            }
        }
    }

    useEffect(() => {
        const id = router.params.specialid;
        if (id) {
            api("app.special/info", {special_id: id}).then(res => {
                setInfo({...res})
            }).catch(e => {
                console.log("获取专题信息出错：", e)
            })
        }

        getSpecialList()
    }, [])

    const onScroll = e => {
        const top = e.detail.scrollTop;

        if (top > 200) {
            if (!showBar) {
                setBarVisible(true)
            }
        } else {
            if (showBar) {
                setBarVisible(false)
            }
        }
    }

    const loadMore = () => {
        if (total === list.length || total < 15) {
            setLoadStatus("noMore")
            return
        }
        setLoadStatus("loading")
        getSpecialList({
            start: list.length,
            loadMore: true
        })
    }

    const viewDetail = (item) => {
        console.log(item)
        if (item.info.jump_url) {
            Taro.navigateTo({url: item.info.jump_url});
            return
        }
        const {type} = router.params;
        if (type === "phone") {
            Taro.navigateTo({
                url: `/pages/order/pages/template/detail?id=${item.info.id}&cid=${item.info.category.id}`
            })
        } else {
            const str = getURLParamsStr(urlEncode({
                id: 34,
                tplid: item.info.id,
            }))
            Taro.navigateTo({
                url: `/pages/editor/pages/printing/index?${str}`
            });
        }
    }

    const getHeight = () => {
        return deviceInfo.env === "h5"
            ? deviceInfo.windowHeight + "px"
            : deviceInfo.windowHeight + deviceInfo.menu.height + deviceInfo.statusBarHeight + "px"
    }

    return (
        <View className="special_container">
            <ScrollView className="special_scroll"
                        scrollY
                        style={{
                            height: getHeight(),
                            paddingTop: deviceInfo.env === "weapp" ? deviceInfo.statusBarHeight + "px" : ""
                        }}
                        onScroll={onScroll}
                        onScrollToLower={loadMore}
            >
                <View className={`special_bar_ctx ${showBar ? "show_bar" : ""}`} style={fixStatusBarHeight()}>
                    <AtNavBar onClickLeftIcon={() => Taro.navigateBack()}
                              className={deviceInfo.env === "weapp" ? "fix_weapp_special_tit" : ""}
                              color='#121314' title={cutString(info.name, 6)} border
                              leftIconType={{value:'chevron-left', color:'#121314', size:24}}
                    />
                </View>
                <View className="special_animate_container">
                    <View className="animate_container_bg">
                        <Image src={ossUrl(info.image, 2)} className="animate_img" mode="aspectFill" />
                        <View className="txt_container">
                            <View className="close_btn" onClick={() => Taro.navigateBack()}>
                                <IconFont name="32_guanbi" size={64} />
                            </View>
                            <Text className="h1">{info.name || " "}</Text>
                            <Text className="ext">{info.subtitle || " "}</Text>
                            <View className="action_bar">
                                <View className="bar" />
                            </View>
                        </View>
                    </View>
                </View>
                <View className="special_main">
                    <View className="special_scroll_main">
                        {
                            list.map((value, index) => (
                                <View className="special_item_wrap" key={index+""} onClick={() => viewDetail(value)}>
                                    <View className="special_item">
                                        <Image src={ossUrl(value.thumb_image, 1)} className="special_item_img" mode="aspectFill" />
                                    </View>
                                </View>
                            ))
                        }
                    </View>
                </View>
                <LoadMore status={loadStatus} />
            </ScrollView>
        </View>
    )
}

export default Special
