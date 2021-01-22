import "./index.less";
import Taro, {useState, useEffect} from "@tarojs/taro";
import {View, Text, Image} from "@tarojs/components";
import IconFont from "../iconfont";
import {debuglog, transformKB} from "../../utils/common";
import {Files} from "./index";

interface ImgFileItemProps {
    currentFile: Files;
}
const ImgFileItem: Taro.FC<ImgFileItemProps> = props => {

    const {currentFile} = props;

    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        debuglog(currentFile.name, hidden)
    }, [hidden])

    useEffect(() => {
        debuglog(11111, )
        if (currentFile.completed) {
            setTimeout(() => {
                setHidden(true)
            }, 950)
        }
    }, [currentFile.completed])

    return(
        <View className={`wait_item_wrap ${currentFile.completed ? "animate_wait_item_wrap" : ""}`}
              key={currentFile.key}
              style={{display: hidden ? "none" : "block"}}
        >
            <View className="wait_item">
                <View className="img">
                    <Image src={currentFile.path} className="i_img"/>
                </View>
                <View className="action_info">
                    <View className="head">
                        <Text className="name">{currentFile.name || " "}</Text>
                        <View className="del"><IconFont name="20_guanbi" color="#999" size={32} /></View>
                    </View>
                    <View className="progress_bar" style={{height: "2px"}}>
                        <View className="progress_line"
                              style={{
                                  width: currentFile.error ? "100%" : `${currentFile.progress / currentFile.total * 100}%`,
                                  background: currentFile.error ? "#f45d5d" : "#4D94FF",
                                  height: "2px"
                              }}
                        />
                    </View>
                    <View className="progress_total">
                        {
                            currentFile.total / 1048576 > 10
                                ? <View className="file_err">
                                    <Text className="fe_txt">{transformKB(currentFile.total)}</Text>
                                    <Image src={require('./r_icon.png')} className="wa_icon"/>
                                    <Text className="fe_txt">图片大小不能超过10MB</Text>
                                </View>
                                : currentFile.error
                                ? <View className="err_upload">
                                    <Text className="e_txt">上传出错</Text>
                                    <Image src={require("./reset.png")} className="err_icon" />
                                </View>
                                : <Text className="txt">{transformKB(currentFile.progress)} / {transformKB(currentFile.total)}</Text>
                        }
                    </View>
                </View>
            </View>
        </View>
    )
}

export default ImgFileItem
