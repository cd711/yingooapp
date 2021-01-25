import "./index.less";
import Taro, {useState, useEffect} from "@tarojs/taro";
import {View, Text, Image} from "@tarojs/components";
import IconFont from "../iconfont";
import {transformKB} from "../../utils/common";
import {Files} from "./index";

interface ImgFileItemProps {
    currentFile: Files;
    starting: boolean;
    onErrorClick?: (item: Files) => void;
    onAnimationEnd?: (item: Files) => void;
    onDelete?: (item: Files) => void;
}
const ImgFileItem: Taro.FC<ImgFileItemProps> = props => {

    const {
        currentFile = new Files(),
        starting,
        onErrorClick,
        onAnimationEnd,
        onDelete} = props;

    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        if (hidden) {
            onAnimationEnd && onAnimationEnd(currentFile)
        }
    }, [hidden])

    useEffect(() => {
        if (currentFile.completed) {
            setTimeout(() => {
                setHidden(true)
            }, 950)
        }
    }, [currentFile && currentFile.completed])

    const _onErrorClick = () => {
        onErrorClick && onErrorClick(currentFile)
    }

    const _onDelete = () => {
        onDelete && onDelete(currentFile);
    }

    return(
        <View className={`wait_item_wrap ${currentFile.completed ? "animate_wait_item_wrap" : ""}`}
              style={{display: hidden ? "none" : "block"}}
        >
            <View className="wait_item">
                <View className="img">
                    <Image src={currentFile.path}
                           className="i_img"
                           // mode="aspectFill"
                    />
                </View>
                <View className="action_info">
                    <View className="head">
                        <Text className="name">{currentFile.name || " "}</Text>
                        {
                            starting
                                ? <View />
                                : <View className="del" onClick={_onDelete}><IconFont name="20_guanbi" color="#999" size={32} /></View>
                        }
                    </View>
                    <View className="progress_bar"
                          style={{
                              height: "2px",
                              background: starting && !(currentFile.total / 1048576 > 10) ? "rgba(77,148,255,0.10)" : "transparent"
                          }}
                    >
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
                                ? <View className="err_upload" onClick={_onErrorClick}>
                                    <Text className="e_txt">上传出错</Text>
                                    <Image src={require("./reset.png")} className="err_icon" />
                                </View>
                                : <Text className="txt"
                                        style={{
                                            color: starting ? "#4D94FF" : "#9c9da6"
                                        }}
                                >
                                    {`${starting ? `${transformKB(currentFile.progress)} / ` : ""}${transformKB(currentFile.total)}`}
                                </Text>
                        }
                    </View>
                </View>
            </View>
        </View>
    )
}

export default ImgFileItem
