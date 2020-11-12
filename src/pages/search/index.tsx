import "./index.less";
import Taro, {useState} from "@tarojs/taro";
import {View, Text, Image, ScrollView} from "@tarojs/components";
import IconFont from "../../components/iconfont";
import {AtInput} from "taro-ui";
import Empty from "../../components/empty";

const Search:React.FC<any> = () => {

    const [touched, setTouched] = useState(false)

    const onSearch = (val, _) => {
        console.log(val)
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
                <Text className="cancel_search" onClick={() => Taro.navigateBack()}>取消</Text>
            </View>
            <ScrollView scrollY style={{height: window.screen.height - 70}}>
                <View className="search_scroll_container">
                    <View className="search_type_item">
                        <View className="more">
                            <Text className="tit">冲印</Text>
                            <Text className="more_txt">更多 <IconFont name="24_xiayiye" size={32} color="#9C9DA6" /></Text>
                        </View>
                        <ScrollView className="x_scroll_search_item" scrollX style={{width: window.screen.width}}>
                            <View className="scroll_view_x">
                                {
                                    [1,2,3,4,5].map((value, index) => (
                                        <View className="search_item_wrap" key={index}>
                                            <View className="search_item">
                                                <Image src="http://palybox-app.oss-cn-chengdu.aliyuncs.com/uploads/file/20201112/f9ae28a4490a1177ac3c48fa7394eef2.file" className="search_item_img" mode="aspectFill" />
                                            </View>
                                        </View>
                                    ))
                                }
                            </View>
                        </ScrollView>
                    </View>
                    <View className="search_type_item">
                        <View className="more">
                            <Text className="tit">手机壳</Text>
                            <Text className="more_txt">更多 <IconFont name="24_xiayiye" size={32} color="#9C9DA6" /></Text>
                        </View>
                        <ScrollView className="x_scroll_search_item" scrollX style={{width: window.screen.width}}>
                            <View className="scroll_view_x">
                                {
                                    [1,2,3,4,5].map((value, index) => (
                                        <View className="search_item_wrap" key={index}>
                                            <View className="search_item circle">
                                                <Image src="http://palybox-app.oss-cn-chengdu.aliyuncs.com/uploads/file/20201112/f9ae28a4490a1177ac3c48fa7394eef2.file" className="search_item_img" mode="aspectFill" />
                                            </View>
                                        </View>
                                    ))
                                }
                            </View>
                        </ScrollView>
                    </View>
                    {
                        touched ? <Empty icon={require("../../source/empty/searchnull.png")} content="什么都没有，换个词试试呢" /> : null
                    }
                </View>
            </ScrollView>
        </View>
    )
}

export default Search
