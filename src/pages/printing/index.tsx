import Taro, {useState, useEffect} from "@tarojs/taro";
import {View, Image, Text, ScrollView} from "@tarojs/components";
import "./index.less";
import {AtNavBar} from "taro-ui";
import IconFont from "../../components/iconfont";
import {deviceInfo} from "../../utils/common";
import {api} from "../../utils/net";

const Index: Taro.FC<any> = props => {

    const [checked, setChecked] = useState(0);
    const router = Taro.useRouter();
    const [sizeItem, setSizeItem] = useState([]);

    useEffect(() => {
        const id = router.params.id;
        if (id) {
            api("app.product/info", {id}).then(res => {
                let arr = [];
                arr = [...res.attrItems[0]];
                setSizeItem([...arr])
            }).catch(e => {
                console.log("获取--app.product/info出错：", e)
            })
        }
    }, [])

    const selectSize = id => {
        setChecked(Number(id))
    }

    return(
        <View className="printing_container">
            <AtNavBar onClickLeftIcon={() => Taro.navigateBack()}
                      color='#121314' title="选择尺寸" border fixed
                      leftIconType={{value:'chevron-left', color:'#121314', size:24}}
            />
            <ScrollView scrollY className="printing_scroll_container" style={{height: deviceInfo.windowHeight - 110}}>
                <View className="printing_main">
                    {
                        sizeItem.map((value, index) => (
                            <View className="printing_item" key={index} onClick={() => selectSize(value.id)}>
                                <View className="left">
                                    <Image src={require("../../source/print.png")} className="icon" />
                                    <View className="info">
                                        <Text className="h2">{value.name}</Text>
                                        <Text className="txt">68*89mm</Text>
                                    </View>
                                </View>
                                <View className="right">
                                    <View className="check_icon">
                                        <IconFont name={Number(value.id) === checked ? "22_yixuanzhong" : "22_touming-weixuanzhong"} size={44}/>
                                    </View>
                                </View>
                            </View>
                        ))
                    }
                </View>
            </ScrollView>
            <View className="print_foot">
                <View className="submit">
                    <Text className="txt">添加照片</Text>
                </View>
            </View>
        </View>
    )
}

export default Index
