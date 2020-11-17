import Taro, {useState, useEffect} from "@tarojs/taro";
import {View, Image, Text, ScrollView} from "@tarojs/components";
import "./index.less";
import {AtNavBar} from "taro-ui";
import IconFont from "../../components/iconfont";
import {deviceInfo, ossUrl, urlDeCode} from "../../utils/common";
import {api} from "../../utils/net";
import UploadFile, {UploadFileChangeProps} from "../../components/Upload/Upload";
import Counter from "../../components/counter/counter";

const PrintChange:Taro.FC<any> = () => {

    const rouer = Taro.useRouter();
    const paramsObj = Taro.useRef({});
    const [photos, setPhotos] = useState([]);

    useEffect(() => {
        // 解析地址栏参数
        const params: any = urlDeCode(rouer.params);
        paramsObj.current = params || {};
        params.path = params.path.map(v => {
            return {
                ...v,
                count: 1
            }
        })
        setPhotos([...params.path] || [])
    }, [])

    const onCountChange = (num, idx) => {
        const arr = [...photos];
        arr[idx].count = Number(num);
        setPhotos([...arr])
    }

    const onDeleteImg = idx => {
        const arr = [...photos];
        arr.splice(idx, 1);
        setPhotos([...arr])
    }

    const onUpload = (files: Array<UploadFileChangeProps> | UploadFileChangeProps) => {
        if (files instanceof Array) {
            const arr = [...photos];
            const temp = files.map(val => ({id: val.id, url: val.cdnUrl, count: 1}));
            setPhotos([...arr, ...temp])
        }
    }

    return (
        <View className="printing_container">
            <AtNavBar onClickLeftIcon={() => Taro.navigateBack()}
                      color='#121314' title="照片冲印列表" border fixed
                      leftIconType={{value:'chevron-left', color:'#121314', size:24}}
            />
            <ScrollView scrollY className="printing_scroll_container" style={{height: deviceInfo.windowHeight - 110}}>
                <View className="printing_change_main">
                    {
                        photos.map((value, index) => (
                            <View className="print_change_item_wrap" key={index}
                                  style={{
                                      width: deviceInfo.windowWidth / 2
                                  }}>
                                <View className="print_change_item"
                                      style={{
                                          width: deviceInfo.windowWidth / 2 - 26
                                      }}
                                >
                                    <View className="print_change_del" onClick={() => onDeleteImg(index)}>
                                        <IconFont name="32_guanbi" size={32}/>
                                    </View>
                                    <Image src={ossUrl(value.url, 1)} className="img" mode="aspectFill" />
                                    <View className="print_change_count">
                                        <Counter num={value.count} onCounterChange={c => onCountChange(c, index)} />
                                    </View>
                                </View>
                            </View>
                        ))
                    }
                </View>
            </ScrollView>
            <View className="print_foot" style={{justifyContent: "space-around"}}>
                <View className="btn default">
                    <UploadFile uploadType="image" extraType={1} sourceType={["album"]} count={4} onChange={onUpload}>
                        <Text className="txt">添加图片</Text>
                    </UploadFile>
                </View>
                <View className="btn">
                    <Text className="txt">立即下单</Text>
                </View>
            </View>
        </View>
    )
}

export default PrintChange
