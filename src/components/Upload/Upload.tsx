import "./upload.less";
import Taro, {Component} from '@tarojs/taro';
import {View, Text} from "@tarojs/components";
import IconFont from "../iconfont";
import {getToken, options} from "../../utils/net";
import {notNull} from "../../utils/common";
import {userStore} from "../../store/user";

export interface UploadFileChangeProps {
    id: string, cdnUrl: string, url: string
}

interface UploadFileProps{
    type: "button" | "card",
    uploadType: "image" | "video",
    // 1=普通上传，2=作品,3=照片
    extraType: number,
    sourceType?: Array<"album" | "camera"> | ["camera", "album"],
    // 多选几张，仅选图片时可用
    count?: number,
    onChange?: (data: Array<UploadFileChangeProps> | UploadFileChangeProps) => void,
    // index为多图上传的下边，单张上传时始终为0
    onProgress?: (progress: number, currentTotal: number, total: number, index: number) => void,
    className?: string
    style?: any
}
interface UploadFileState {
    files: Array<any>;
}
export default class UploadFile extends Component<UploadFileProps, UploadFileState>{

    static defaultProps = {
        type: "button",
        sourceType: ['album', 'camera'],
        count: 1
    }
    constructor(props) {
        super(props);
        this.state = {
            files: []
        }
    }

    _upload = () => {
        if (notNull(userStore.id)) {
            return
        }
        const that = this;
        const {uploadType, sourceType, count} = this.props;
        if (uploadType === "image") {
            Taro.chooseImage({
                count,
                sourceType,
                success: function (res) {
                    console.log(res)
                    if (count > 1) {
                        that.uploadMultipleFile(res.tempFiles, 0, 0, 0)
                    } else {
                        const tempFilePaths = res.tempFilePaths
                        that.uploadFileFn(tempFilePaths[0])
                    }
                }
            })
        } else {
            Taro.chooseVideo({
                camera: "back",
                sourceType,
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
        Taro.showLoading({title: "上传中..."})
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
                Taro.hideLoading();
                Taro.showToast({title: "上传成功", icon: "none"})
            },
            fail: err => {
                console.log("UploadFile文件上传出错：", err)
                Taro.hideLoading();
                Taro.showToast({title: "上传失败", icon: "none"})
            }
        });

        upload.progress(res => {
            // 上传进度、 已上传的数据长度、 文件总长度
            onProgress && onProgress(res.progress, res.totalBytesSent, res.totalBytesExpectedToSend, 0)
        })
    }


    uploadMultipleFile(files: any[], current: number, success: number, fail: number) {
        const {extraType, onChange, onProgress} = this.props;
        let url = options.apiUrl + "common/upload";
        if (getToken()) {
            url += (url.indexOf("?") > -1 ? "&" : "?") + "token=" + getToken();
        }
        Taro.showLoading({title: "上传中..."})

        const that = this;
        let i = !notNull(current) ? current : 0;  // 当前所上传的下标
        let _success = !notNull(success) ? success : 0  // 上传成功的个数
        let _fail = !notNull(fail) ? fail : 0  // 上传失败的个数

        const upload = Taro.uploadFile({
            url,
            filePath: files[i].path,
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
                    _success ++;
                   // successPath.push(jsonRes.data)
                    const arr = this.state.files;
                   arr.push(jsonRes.data);
                   this.setState({files: arr})
                } else {
                    _fail++;
                }
            },
            fail: err => {
                console.log("UploadFile文件上传出错：", err)
                // Taro.hideLoading();
                // Taro.showToast({title: "上传失败", icon: "none"})
                _fail++
            },
            complete: () => {
                i++;
                console.log(i, files.length)
                if (i === files.length) {
                    Taro.hideLoading();
                    Taro.showToast({title: "上传成功", icon: "none"})
                    console.log("多图上传---成功：", _success, "  失败：", _fail)
                    onChange && onChange(this.state.files);
                    this.setState({files: []})
                } else {
                    that.uploadMultipleFile(files, i, _success, _fail)
                }
            }
        });

        upload.progress(res => {
            // 上传进度、 已上传的数据长度、 文件总长度
            onProgress && onProgress(res.progress, res.totalBytesSent, res.totalBytesExpectedToSend, i)
        })

    }

    render(): React.ReactNode {
        const {type, className, style} = this.props;
        return (
            <View className={`upload_container ${className}`} onClick={this._upload} style={style}>
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
