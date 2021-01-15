import "./index.less";
import Taro, {useState, useEffect} from "@tarojs/taro";
import {View, Text, Image, ScrollView} from "@tarojs/components";
import IconFont from "../../components/iconfont";
import {AtInput} from "taro-ui";
import Empty from "../../components/empty";
import {
    debounce, debuglog,
    deviceInfo,
    getSpecialRouter,
    getURLParamsStr,
    notNull,
    shareAppExtends, updateChannelCode,
    urlEncode
} from "../../utils/common";
import {api,options} from "../../utils/net";
import searchStore from "../../store/search";

const Search:Taro.FC<any> = () => {
    const router = Taro.useRouter();

    const [touched, setTouched] = useState(false);
    const [searchList, setSearchList] = useState([]);

    async function getSearchList(keywords) {
        setTouched(true)
        try{
            const res = await api("app.product_tpl/search", {keywords});
            setSearchList([...res]);
            searchStore.searchList = [...res];
        }catch (e) {
            debuglog("获取搜索数据出错：", e)
        }
    }

    if (deviceInfo.env === "weapp") {
        Taro.useShareAppMessage(() => {
            return shareAppExtends()
        })
    }

    useEffect(() => {
        if (searchList.length === 0 && searchStore.searchList.length > 0) {
            setSearchList([...searchStore.searchList])
        }
    }, [])

    const debounceFn = debounce(getSearchList, 1000)

    const onSearch = (val, _) => {
        debuglog(val)
        if (!notNull(val)) {
            // @ts-ignore
            debounceFn(val)
        }
    }

    const onCancel = () => {
        Taro.navigateBack();
        searchStore.searchList = []
    }

    const onItemClick = (item) => {
        switch (item.category.type) {
            case "phone":
                const phoneStr = getURLParamsStr(urlEncode({
                    id: item.id,
                    cid: item.category.id,
                }))
                Taro.navigateTo({
                    url: updateChannelCode(`/pages/order/pages/template/detail?${phoneStr}&cp=${getSpecialRouter(router)}`)
                });
                break;
            case "photo":
                const str = getURLParamsStr(urlEncode({
                    id: 34,
                    imgid: item.id,
                    attr: `${item.attr.width}*${item.attr.height}`,
                    status: "t",
                    img: item.thumb_image,
                }))
                Taro.navigateTo({
                    url: updateChannelCode(`/pages/editor/pages/printing/index?${str}`)
                });
                break;
        }
    }

    const getHeight = () => {
        return deviceInfo.env === "h5"
            ? `${deviceInfo.windowHeight - 70}px`
            : `${deviceInfo.windowHeight - 70 - deviceInfo.menu.bottom}px`
    }

    return (
        <View className="search_index_container">
            <View className="search_top_bar" style={`margin-top: ${deviceInfo.menu.bottom}px`}>
                <View className="search_input">
                    <View className="icon">
                        <IconFont name="20_sousuo" size={40} color="#000" />
                    </View>
                    <AtInput autoFocus focus name="value" placeholder="搜索" onChange={onSearch} className="search_input_act" />
                </View>
                <Text className="cancel_search" onClick={onCancel}>取消</Text>
            </View>
            <ScrollView scrollY style={{height: getHeight()}}>
                <View className="search_scroll_container">
                    {
                        searchList.map((value, index) => (
                            <View className="search_type_item" key={index+""}>
                                <View className="more">
                                    <Text className="tit">{value.name}</Text>
                                    <Text className="more_txt"
                                          onClick={() => Taro.navigateTo({url: updateChannelCode(`/pages/search/result?tpl_category_id=${value.tpl_category_id}&title=${value.name}`)})}>
                                        更多 <IconFont name="24_xiayiye" size={32} color="#9C9DA6" />
                                    </Text>
                                </View>
                                <ScrollView className="x_scroll_search_item" scrollX style={{width: deviceInfo.screenWidth + "px"}}>
                                    <View className="scroll_view_x">
                                        {
                                            value.list.map((item, childIdx) => (
                                                <View className="search_item_wrap" key={childIdx+""}>
                                                    <View className="search_item circle" onClick={() => onItemClick(item)}>
                                                        <Image src={item.thumb_image} className="search_item_img" mode="aspectFill" />
                                                    </View>
                                                </View>
                                            ))
                                        }
                                    </View>
                                </ScrollView>
                            </View>
                        ))
                    }
                    {
                        touched && searchList.length === 0 ? <Empty icon={`${options.sourceUrl}appsource/empty/searchnull.png`} content="什么都没有，换个词试试呢" /> : null
                    }
                </View>
            </ScrollView>
        </View>
    )
}

export default Search
