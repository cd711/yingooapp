import "./index.less";
import Taro, {useState, useEffect, useRef} from "@tarojs/taro";
import {View, Text, ScrollView} from "@tarojs/components";
import {chooseImageFromSystem, debuglog, deviceInfo, notNull} from "../../utils/common";
import {getToken, options} from "../../utils/net";
import {AtActivityIndicator} from "taro-ui";
import ImgFileItem from "./imgFileItem";
import TransferTip from "./transferTip";
import ResultTip from "./resultTip";
import {Files} from "../../modal/modal";

interface DocumentTransferProps {
    visible: boolean;
    // 已使用总数
    useTotal: number;
    // 选图模式生效,已选择的总数
    selectedCount?: number;
    // 最大使用数; 选图模式生效
    max?: number;
    // 已选择的图片;
    defaultFiles: Files[];
    // 如果是选图的话可能会有上传成功返回的ID
    onClose?: (completedArr?: Array<string | number>) => void;
    // 是否是选图模式
    selectPictureMode?: boolean;
    // 单次上传完成的回调
    onUploadComplete?: () => void;
}

const DocumentTransfer: Taro.FC<DocumentTransferProps> = props => {

    const {
        onClose,
        useTotal = 0,
        max = 0,
        selectedCount = 0,
        selectPictureMode = false,
        onUploadComplete,
        defaultFiles
    } = props;

    const [files, setFiles] = useState<Array<Files>>([]);
    const [starting, setStarting] = useState<boolean>(false);
    const [uploadedInfo, setUploadedInfo] = useState({uploading: 0, succeed: 0, failed: 0});
    const [uploadTimes, setUploadTimes] = useState(0);
    const [hasSelected, setHasSelected] = useState(false);
    const [showTip, setTipStatus] = useState(false);
    const [showResult, setResultStatus] = useState(false);

    const completedArr = useRef([]);

    useEffect(() => {
        debuglog(
            "--------#----------------------文件中转站-------------------#------------\n",
            "files: ", files, "\n",
            "starting: ", starting, "\n",
            "uploadedInfo: ", uploadedInfo, "\n",
            "uploadTimes: ", uploadTimes, "\n",
            "hasSelected: ", hasSelected, "\n",
            "completedArr: ", completedArr.current, "\n",
        )
    }, [files, starting, uploadedInfo, uploadTimes, hasSelected, completedArr.current])

    useEffect(() => {
        if (!notNull(defaultFiles) && defaultFiles instanceof Array && defaultFiles.length > 0) {
            setFiles(prev => [...prev, ...defaultFiles])
        }
    }, [])

    useEffect(() => {
        if (selectPictureMode && uploadedInfo.succeed > 0) {
            setResultStatus(true)
        }
    }, [starting])

    const onChooseImage = async () => {
        if (files.length > 100) {
            Taro.showToast({title: "列表最多选择100张", icon: "none"})
            return
        }
        try {
            const arr = await chooseImageFromSystem();
            setFiles([...files, ...arr]);
            setHasSelected(true);
            debuglog("选择的图片列表：", arr);
        }catch (e) {

        }

    }

    // 在所有图片上传完成后清理上传成功的图片
    function clearCompletedFile(fileArr: Files[] = []) {
        const tempArr = [];
        for (let i = 0; i < fileArr.length; i++) {
            if (!fileArr[i].completed) {
                tempArr.push(fileArr[i]);
            }
        }
        if (onUploadComplete) {
            onUploadComplete()
        }
        setFiles([...tempArr])
    }

    // 上传成功的图把id存起来作为在选图模式下自动选择的依据
    function saveCompletedFileToArr(id) {
        const arr = [...completedArr.current];
        if (id) {
            const has = arr.findIndex(value => parseInt(value) == parseInt(id));
            debuglog("已有ID：", has, id)
            if (has === -1) {
                arr.push(id);
                completedArr.current = arr;
            }
        }
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

        if (!notNull(tempFiles[i].outOfSize) && tempFiles[i].outOfSize === true) {
            _fail++;
            setUploadedInfo(prev => ({...prev, failed: _fail}));
            i++;
            if (i === files.length) {

                debuglog("多图上传---成功：", _success, "  失败：", _fail)
                setFiles([...tempFiles]);
                setStarting(false);
                setHasSelected(false);

                clearCompletedFile([...tempFiles])

            } else {
                uploadFileFn(fileArr, i, _success, _fail)
            }
            return
        }

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
                    saveCompletedFileToArr(jsonRes.data.id)
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
                if (i === files.length) {

                    debuglog("多图上传---成功：", _success, "  失败：", _fail)
                    setUploadedInfo(prev => ({...prev, uploading: i}));
                    setStarting(false);
                    setHasSelected(false)

                    clearCompletedFile([...tempFiles])

                } else {
                    setUploadedInfo(prev => ({...prev, uploading: i, failed: _fail, succeed: _success}))
                    uploadFileFn(fileArr, i, _success, _fail)
                }
            }
        });

        upload.progress(res => {
            tempFiles[i].progress = res.totalBytesSent;
            setFiles([...tempFiles]);
        })
    }

    const onStartUpload = () => {
        if (files.length === 0) {
            Taro.showToast({title: "请选择图片", icon: "none"});
            return
        }
        if (useTotal + files.length > 500) {
            setTipStatus(true)
            return;
        }
        setUploadedInfo({
            succeed: 0,
            uploading: 0,
            failed: 0
        })
        setStarting(true);
        let count = uploadTimes;
        count += 1;
        setUploadTimes(count)
        uploadFileFn(files, 0, 0, 0);
    }

    // 上传错误的图片点击重试
    const onErrorClick = (file: Files) => {
        if (starting) {
            Taro.showToast({
                title: "还有未上传完成的图片，请稍后",
                icon: "none"
            })
            return
        }
        const tArr = [...files];
        const idx = tArr.findIndex(val => val.key === file.key);
        if (idx > -1) {
            tArr[idx] = {
                ...tArr[idx],
                error: false
            }
            setFiles([...tArr]);
            uploadFileFn([...tArr], 0, 0, 0)
        }
    }

    // 删除图片
    const onDelete = (file: Files) => {
        if (starting) {
            return
        }
        const tArr = [...files];
        const idx = tArr.findIndex(val => val.key === file.key);
        if (idx > -1) {
            tArr.splice(idx, 1);
            setFiles([...tArr]);
        }
    }

    const onResultTipClose = (type: 1 | 2 | 3) => {
        if (type === 1) {
            if (completedArr.current.length + selectedCount > max) {
                Taro.showToast({title: "上传成功的图片总数大于商品所需照片数",icon:"none"})
                return;
            }
            onClose && onClose(completedArr.current)
            return
        }
        setResultStatus(false)
    }

    const getHeight = () => {
        const wh = deviceInfo.windowHeight * 0.85;
        return wh - 48 - 93
    }

    const _onClose = () => {
        onClose && onClose()
    }

    return (
        <View className="document_transfer_container">
            <View className="document_transfer_main">
                <View className="action_bar">
                    <View className="cancel" onClick={_onClose}><Text className="txt">取消</Text></View>
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
                        uploadTimes === 0
                            ? starting
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
                                    {
                                        files.length <= 100
                                            ? <View className="choose_btn" onClick={onChooseImage}><Text className="txt">添加图片</Text></View>
                                            : null
                                    }
                                    {
                                        files.length > 0 ? <Text className="ext_txt">本次等待上传{files.length}张</Text> : null
                                    }
                                </View>
                            : uploadTimes > 0
                            ? starting
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
                                    {
                                        files.length <= 100
                                            ? <View className="choose_btn" onClick={onChooseImage}><Text className="txt">添加图片</Text></View>
                                            : null
                                    }
                                    {
                                        hasSelected
                                            ? <Text className="ext_txt">本次等待上传{files.length}张</Text>
                                            : <View className="ext_txt">
                                                <Text className="txt">已上传</Text>
                                                <Text className="blue">{uploadedInfo.succeed}</Text>
                                                <Text className="txt">张，失败</Text>
                                                <Text className="red">{uploadedInfo.failed}</Text>
                                                <Text className="txt">张</Text>
                                            </View>
                                    }
                                </View>
                            : null
                    }
                </View>
                <ScrollView scrollY className="wait_upload_list_scroll_view" style={{height: `${getHeight()}px`}}>
                    <View className="wait_upload_list_main">
                        {
                            files.map((item, index) => {
                                return <ImgFileItem
                                    currentFile={item}
                                    starting={starting}
                                    key={index.toString()}
                                    onErrorClick={onErrorClick}
                                    onDelete={onDelete}
                                />
                            })
                        }
                    </View>
                </ScrollView>
            </View>
            {
                showTip
                    ? <TransferTip total={500 - parseInt(useTotal.toString())} onClose={() => setTipStatus(false)} />
                    : null
            }
            {
                showResult
                    ? <ResultTip result={uploadedInfo} onClose={onResultTipClose} />
                    : null
            }
        </View>
    )
}

export default DocumentTransfer
