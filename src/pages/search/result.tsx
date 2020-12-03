import "./result.less";
import Taro, {useState, useEffect, useRouter} from "@tarojs/taro";
import {View, Image, ScrollView} from "@tarojs/components";
import {AtNavBar} from "taro-ui";
import {api} from "../../utils/net";
import LoadMore from "../../components/listMore/loadMore";
import {getURLParamsStr, ossUrl, urlEncode} from "../../utils/common";

const SearchResult:Taro.FC<any> = () => {

    const [list, setList] = useState([]);
    const total = Taro.useRef(0);
    const [status, setStatus] = useState<"more" | "noMore" | "loading">("more");
    const router = useRouter();
    const screen = Taro.getSystemInfoSync();

    async function getList(data) {
        const opt = {
            start: data.start || 0,
            size: data.size || 15,
            loadMore: data.loadMore || false
        };
        const category_id = router.params.tpl_category_id;
        try {
            if (category_id) {
                const res = await api("app.product_tpl/list", {
                    start: opt.start,
                    size: opt.size,
                    category_id
                });
                total.current = Number(res.total || 0)
                let arr = [];
                if (opt.loadMore) {
                    arr = [...list, ...res.list]
                } else {
                    arr = [...res.list]
                }
                setList([...arr]);
                setStatus(arr.length === Number(res.total || 0) ? "more" : "noMore")
            }
        } catch (e) {
            console.log("获取列表出错：", e)
            setStatus("more")
        }
    }

    useEffect(() => {
        getList({
            start: 0
        })
    }, [])

    const loadMore = () => {
        if (total.current === list.length || total.current === 15) {
            setStatus("noMore")
            return
        }
        setStatus("loading")
        getList({
            start: list.length,
            loadMore: true
        })
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
        <View className="search_result_container">
            <AtNavBar
                onClickLeftIcon={()=>{
                    Taro.navigateBack();
                }}
                color='#121314'
                title={router.params.title ? decodeURI(router.params.title) : " "}
                border
                leftIconType={{
                    value:'chevron-left',
                    color:'#121314',
                    size:24
                }}
            />
            <ScrollView scrollY style={{height: screen.windowHeight - 50}} onScrollToLower={loadMore} >
                <View className="search_item_container">
                    {
                        list.map((value, index) => (
                            <View className="search_item_wrap" key={index+""} style={{
                                width: window.screen.width / 2
                            }}>
                                <View className="search_item"
                                      onClick={() => onItemClick(value)}
                                      style={{
                                          width: window.screen.width / 2 - 8,
                                      }}
                                >
                                    <Image className="search_img" src={ossUrl(value.thumb_image, 1)} mode="aspectFill"
                                           style={{
                                               width: window.screen.width / 2 - 8,
                                           }}
                                    />
                                </View>
                            </View>
                        ))
                    }
                </View>
                {list.length > 0 ? <LoadMore status={status} /> : null}
            </ScrollView>
        </View>
    )
}

export default SearchResult
