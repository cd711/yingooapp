import "./upload.less";
import Taro, {Component} from '@tarojs/taro';
import {View, Text} from "@tarojs/components";
import IconFont from "../iconfont";
import ImageFile = Taro.chooseImage.ImageFile;
import {getToken, options} from "../../utils/net";

interface UploadFileProps{
    type: "button" | "card",
    extraType: number,
    onChange?: (files: ImageFile[]) => void,
}
interface UploadFileState {
    files: Array<any>;
}
export default class UploadFile extends Component<UploadFileProps, UploadFileState>{

    static defaultProps = {
        type: "button"
    }
    constructor(props) {
        super(props);
        this.state = {
            files: []
        }
    }

    _upload = () => {
        const _this = this;
        let url = options.apiUrl + "common/upload";
        if (getToken()) {
            url += (url.indexOf("?") > -1 ? "&" : "?") + "token=" + getToken();
        }
        Taro.chooseImage({
            count: 1,
            sourceType: ['album', 'camera'],
            success: function (res) {
                const {onChange, extraType} = _this.props;
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                const tempFiles = res.tempFiles;
                const tempFilePaths = res.tempFilePaths
                console.log(res)
                console.log(tempFilePaths)
                Taro.uploadFile({
                    url,
                    filePath: tempFilePaths[0],
                    name: 'file',
                    header: {
                      "Access-Control-Allow-Origin": "*"
                    },
                    formData: {
                        'type': extraType
                    },
                    success: res => {
                        console.log(res)
                        // _this.setState({
                        //     files: tempFiles
                        // });
                        // onChange && onChange(res)
                    },
                    fail: err => {
                        console.log(err)
                    }
                })


            }
        })
    }

    render(): React.ReactNode {
        const {type} = this.props;
        return (
            <View className="upload_container" onClick={this._upload}>
                {
                    type === "button"
                        ? this.props.children
                        : <View className="card_view">
                            <IconFont size={96} name="24_paizhaoshangchuan" color="#fff" />
                            <Text className="title">上传图片</Text>
                        </View>
                }
            </View>
        )
    }
}
