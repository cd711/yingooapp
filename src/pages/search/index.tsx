import "./index.less";
import Taro, {useState, useEffect} from "@tarojs/taro";
import {View, Text, Image, ScrollView} from "@tarojs/components";
import IconFont from "../../components/iconfont";
import {AtInput} from "taro-ui";
import Empty from "../../components/empty";
import {debounce, deviceInfo, getURLParamsStr, notNull, urlEncode} from "../../utils/common";
import {api} from "../../utils/net";
import searchStore from "../../store/search";

const Search:Taro.FC<any> = () => {

    const [touched, setTouched] = useState(false);
    const [searchList, setSearchList] = useState([]);

    async function getSearchList(keywords) {
        setTouched(true)
        try{
            const res = await api("app.product_tpl/search", {keywords});
            setSearchList([...res]);
            searchStore.searchList = [...res];
        }catch (e) {
            console.log("获取搜索数据出错：", e)
        }
    }

    useEffect(() => {
        if (searchList.length === 0 && searchStore.searchList.length > 0) {
            setSearchList([...searchStore.searchList])
        }
    }, [])

    const debounceFn = debounce(getSearchList, 1000)

    const onSearch = (val, _) => {
        console.log(val)
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
                Taro.navigateTo({
                    url: `/pages/template/detail?id=${item.id}&cid=${item.category.id}`
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
                    url: `/pages/printing/index?${str}`
                });
                break;
        }
    }

    return (
        <View className="search_index_container">
            <View className="search_top_bar">
                <View className="search_input">
                    <View className="icon">
                        <IconFont name="20_sousuo" size={40} color="#000" />
                    </View>
                    <AtInput autoFocus focus name="value" placeholder="搜索" onChange={onSearch} className="search_input_act" />
                </View>
                <Text className="cancel_search" onClick={onCancel}>取消</Text>
            </View>
            <ScrollView scrollY style={{height: deviceInfo.windowHeight - 70}}>
                <View className="search_scroll_container">
                    {
                        searchList.map((value, index) => (
                            <View className="search_type_item" key={index}>
                                <View className="more">
                                    <Text className="tit">{value.name}</Text>
                                    <Text className="more_txt"
                                          onClick={() => Taro.navigateTo({url: `/pages/search/result?tpl_category_id=${value.tpl_category_id}&title=${value.name}`})}>
                                        更多 <IconFont name="24_xiayiye" size={32} color="#9C9DA6" />
                                    </Text>
                                </View>
                                <ScrollView className="x_scroll_search_item" scrollX style={{width: window.screen.width}}>
                                    <View className="scroll_view_x">
                                        {
                                            value.list.map((item, childIdx) => (
                                                <View className="search_item_wrap" key={childIdx}>
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
                        touched && searchList.length === 0 ? <Empty icon={require("../../source/empty/searchnull.png")} content="什么都没有，换个词试试呢" /> : null
                    }
                </View>
            </ScrollView>
        </View>
    )
}

export default Search
