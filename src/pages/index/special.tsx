import Taro, {useState, useEffect} from "@tarojs/taro";
import {View, Text, Image, ScrollView} from "@tarojs/components";
import "./index.less";
import IconFont from "../../components/iconfont";
import {deviceInfo} from "../../utils/common";
import {AtNavBar} from "taro-ui";

const Special: Taro.FC<any> = () => {

    const [showBar, setBarVisible] = useState(false)


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

    return (
        <View className="special_container">
            <ScrollView className="special_scroll"
                        scrollY
                        style={{
                            height: deviceInfo.windowHeight,
                        }}
                        onScroll={onScroll}
            >
                <View className={`special_bar_ctx ${showBar ? "show_bar" : ""}`}>
                    <AtNavBar onClickLeftIcon={() => Taro.navigateBack()}
                              color='#121314' title="色彩和创意" border
                              leftIconType={{value:'chevron-left', color:'#121314', size:24}}
                    />
                </View>
                <View className="special_animate_container">
                    <View className="animate_container_bg">
                        <Image src="http://palybox-app.oss-cn-chengdu.aliyuncs.com/uploads/20201029/89d558ea19ae0edd2546967633f1e3d4.png" className="animate_img" mode="aspectFill" />
                        <View className="txt_container">
                            <View className="close_btn" onClick={() => Taro.navigateBack()}>
                                <IconFont name="32_guanbi" size={64} />
                            </View>
                            <Text className="h1">色彩和创意</Text>
                            <Text className="ext">将色彩与创意的极致</Text>
                            <View className="action_bar">
                                <View className="bar" />
                            </View>
                        </View>
                    </View>
                </View>
                <View className="special_main">
                    <View className="special_scroll_main">
                        {
                            [1,2,3,4,5,6,7,7,8].map((value, index) => (
                                <View className="special_item_wrap">
                                    <View className="special_item">
                                        <Image src="http://palybox-app.oss-cn-chengdu.aliyuncs.com/uploads/20201029/89d558ea19ae0edd2546967633f1e3d4.png" className="special_item_img" mode="aspectFill" />
                                    </View>
                                </View>
                            ))
                        }
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default Special
