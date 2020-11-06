import "./upload.less";
import Taro, {Component} from '@tarojs/taro';
import {View, Text} from "@tarojs/components";
import IconFont from "../iconfont";
import {getToken, options} from "../../utils/net";

interface UploadFileProps{
    type: "button" | "card",
    extraType: number,
    onChange?: (data: {id: string, cdnUrl: string, url: string}) => void,
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
        let url = options.apiUrl + "common/upload";
        if (getToken()) {
            url += (url.indexOf("?") > -1 ? "&" : "?") + "token=" + getToken();
        }
        Taro.chooseImage({
            count: 1,
            sourceType: ['album', 'camera'],
            success: function (res) {
                const {onChange, extraType} = that.props;
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                const tempFiles = res.tempFiles;
                const tempFilePaths = res.tempFilePaths
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
                        const jsonRes = JSON.parse(res.data)
                        if (jsonRes.code === 1) {
                            that.setState({
                                files: tempFiles
                            });
                            onChange && onChange(jsonRes.data)
                        }
                    },
                    fail: err => {
                        console.log("UploadFile文件上传出错：", err)
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
