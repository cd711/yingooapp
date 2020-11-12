import "./upload.less";
import Taro, {Component} from '@tarojs/taro';
import {View, Text} from "@tarojs/components";
import IconFont from "../iconfont";
import {getToken, options} from "../../utils/net";

interface UploadFileProps{
    type: "button" | "card",
    uploadType: "image" | "video",
    extraType: number,  // 1=普通上传，2=作品,3=照片
    onChange?: (data: {id: string, cdnUrl: string, url: string}) => void,
    onProgress?: (progress: number, currentTotal: number, total: number) => void
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
        const that = this;
        const {uploadType} = this.props;

        if (uploadType === "image") {
            Taro.chooseImage({
                count: 1,
                sourceType: ['album', 'camera'],
                success: function (res) {
                    const tempFilePaths = res.tempFilePaths
                    that.uploadFileFn(tempFilePaths[0])
                }
            })
        } else {
            Taro.chooseVideo({
                camera: "back",
                sourceType: ["album", "camera"],
                success: res => {
                    // @ts-ignore
                    const tempFilePaths = res.tempFilePaths
                    that.uploadFileFn(tempFilePaths[0])
                }
            })
        }
    }

    uploadFileFn(path: string) {
        const {extraType, onChange, onProgress} = this.props;
        let url = options.apiUrl + "common/upload";
        if (getToken()) {
            url += (url.indexOf("?") > -1 ? "&" : "?") + "token=" + getToken();
        }
        const upload = Taro.uploadFile({
            url,
            filePath: path,
            name: 'file',
            header: {
                "Access-Control-Allow-Origin": "*"
            },
            formData: {
                'type': extraType
            },
            success: res => {
                const jsonRes = JSON.parse(res.data)
                if (jsonRes.code === 1) {
                    onChange && onChange(jsonRes.data)
                }
            },
            fail: err => {
                console.log("UploadFile文件上传出错：", err)
            }
        });

        upload.progress(res => {
            // 上传进度、 已上传的数据长度、 文件总长度
            onProgress && onProgress(res.progress, res.totalBytesSent, res.totalBytesExpectedToSend)
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
