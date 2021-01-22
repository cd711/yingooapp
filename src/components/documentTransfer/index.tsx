import "./index.less";
import Taro, {useState, useEffect, useRef} from "@tarojs/taro";
import {View, Text, Image, ScrollView} from "@tarojs/components";
import {debuglog, deviceInfo, notNull, transformKB} from "../../utils/common";
import ImageFile = Taro.chooseImage.ImageFile;
import {getToken, options} from "../../utils/net";
import {AtActivityIndicator} from "taro-ui";
import ImgFileItem from "./imgFileItem";

interface DocumentTransferProps {
    visible: boolean;
    onClose?: () => void;
}
export interface Files extends ImageFile{
    // 唯一键值
    key: string;
    // 上传进度，单位bit
    progress: number;
    // 文件名字
    name: string;
    // 是否出错
    error: boolean;
    // 文件总大小
    total: number;
    // 是否上传完成
    completed: boolean;
}
const DocumentTransfer: Taro.FC<DocumentTransferProps> = props => {

    const [files, setFiles] = useState<Array<Files>>([]);
    const [starting, setStarting] = useState<boolean>(false);
    const [uploadedInfo, setUploadedInfo] = useState({uploading: 0, succeed: 0, failed: 0});


    const onChooseImage = () => {
        Taro.chooseImage({
            count: 50,
            sourceType: ["album", "camera"],
            success: result => {
                const arr = result.tempFiles.map((value, index) => {
                    return {
                        ...value,
                        key: `${index}-k-${value.size}`,
                        progress: 0,
                        name: value.originalFileObj.name,
                        error: false,
                        total: value.size,
                        completed: false
                    }
                })
                setFiles([...files, ...arr])
                debuglog("选择的图片列表：", arr);
            },
            fail: res => {

            }
        })
    }

    const uploadFileFn = (fileArr: any[], current: number, success: number, failed: number) => {
        let url = options.apiUrl + "common/upload";
        if (getToken()) {
            url += (url.indexOf("?") > -1 ? "&" : "?") + "token=" + getToken();
        }
        let i = !notNull(current) ? current : 0;  // 当前所上传的下标
        let _success = !notNull(success) ? success : 0;  // 上传成功的个数
        let _fail = !notNull(failed) ? failed : 0;  // 上传失败的个数

        const tempFiles = [...fileArr];

        setUploadedInfo(prev => ({...prev, uploading: i}));

        const upload = Taro.uploadFile({
            url,
            filePath: fileArr[i].path,
            name: "file",
            header: {
                "Access-Control-Allow-Origin": "*"
            },
            formData: {
                'type': 3
            },
            success: res => {
                const jsonRes = JSON.parse(res.data)
                if (jsonRes.code === 1) {
                    _success++;
                    tempFiles[i].completed = true;
                    setUploadedInfo(prev => ({...prev, succeed: _success}));
                } else {
                    _fail++;
                    setUploadedInfo(prev => ({...prev, failed: _fail}));
                }
            },
            fail: err => {
                debuglog("UploadFile文件上传出错：", err)
                _fail++;
                tempFiles[i].error = true;
                setUploadedInfo(prev => ({...prev, failed: _fail}));
            },
            complete: () => {
                i++;
                debuglog(i, files.length)
                if (i === files.length) {

                    debuglog("多图上传---成功：", _success, "  失败：", _fail)
                    setUploadedInfo(prev => ({...prev, uploading: i}));
                    setFiles([...tempFiles]);
                    setStarting(false)
                    if (files.length === _success) {
                        // 上传成功

                    }
                } else {
                    setUploadedInfo(prev => ({...prev, uploading: i, failed: _fail, succeed: _success}))
                    uploadFileFn(fileArr, i, _success, _fail)
                }
            }
        });

        upload.progress(res => {
            // debuglog("上传进度：", res.progress, res.totalBytesSent);
            tempFiles[i].progress = res.totalBytesSent;
            setFiles([...tempFiles]);
        })
    }

    const onStartUpload = () => {
        if (files.length === 0) {
            Taro.showToast({title: "请选择图片", icon: "none"});
            return
        }
        setStarting(true);
        uploadFileFn(files, 0, 0, 0)
    }

    const getHeight = () => {
        const wh = deviceInfo.windowHeight * 0.85;
        return wh - 48 - 93
    }

    return (
        <View className="document_transfer_container">
            <View className="document_transfer_main">
                <View className="action_bar">
                    <View className="cancel"><Text className="txt">取消</Text></View>
                    {
                        starting
                            ? <View className="up_view">
                                <Text className="txt" style={{marginRight: "8px"}}>上传中</Text>
                                <AtActivityIndicator color='#ff4966' size={40} />
                            </View>
                            : <View className="up_view" onClick={onStartUpload}><Text className="txt">开始上传</Text></View>
                    }
                </View>
                <View className="info_main">
                    {
                        starting
                            ? <View className="btn_info">
                                <View className="ext_txt">
                                    <Text className="txt">正在上传 {uploadedInfo.uploading}/{files.length} 张，已上传</Text>
                                    <Text className="blue">{uploadedInfo.succeed}</Text>
                                    <Text className="txt">张，失败</Text>
                                    <Text className="red">{uploadedInfo.failed}</Text>
                                    <Text className="txt">张</Text>
                                </View>
                            </View>
                            : <View className="btn_info">
                                <View className="choose_btn" onClick={onChooseImage}><Text className="txt">添加图片</Text></View>
                                {files.length > 0 ? <Text className="ext_txt">本次等待上传{files.length}张</Text> : null}
                            </View>
                    }
                </View>
                <ScrollView scrollY className="wait_upload_list_scroll_view" style={{height: `${getHeight()}px`}}>
                    <View className="wait_upload_list_main">
                        {
                            files.map((item) => {
                                return <ImgFileItem
                                    currentFile={item}
                                    key={item.key}
                                />
                            })
                        }
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}

export default DocumentTransfer
