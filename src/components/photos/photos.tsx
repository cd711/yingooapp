import Taro, {Component, Config} from '@tarojs/taro'
import {Button, Image, ScrollView, Text, View} from '@tarojs/components'
import './photos.less'
import IconFont from '../../components/iconfont';
import {AtActivityIndicator} from 'taro-ui'
import {api,options} from "../../utils/net";
import {chooseImageFromSystem, debuglog, deviceInfo, notNull, ossUrl, photoGetItemStyle} from "../../utils/common";
import LoadMore from "../../components/listMore/loadMore";
import {ScrollViewProps} from "@tarojs/components/types/ScrollView";
import PopLayout, {PopLayoutItemProps} from "../popLayout";
import DocumentTransfer from "../documentTransfer";
import {Files} from "../../modal/modal";


interface PhotosEleProps {
    editSelect?: boolean;
    onPhotoSelect?: ({ids: [], imgs: [], attrs: []}) => void;
    // 已使用的图片数组
    defaultSelect?: Array<{ id: string | number, url: string }>;
    onClose?: () => void;
    // 选择图片必选多少张
    count?: number;
    // 选择图片最大多少张
    max?: number;
    // 是否强制选图, 默认为false
    mandatory?: boolean;
}

interface PhotosEleState {
    navSwitchActive: number;
    loading: boolean;
    imageList: any[];
    usefulList: any[];
    loadStatus: 'more' | 'loading' | 'noMore';
    isEdit: boolean;
    sortActive: object;
    editSelectImgs: string[];
    editSelectImgIds: any[];
    editSelectAttr: string[];
    _editSelect: boolean;
    _count: number;
    _max: number;
    visible: boolean;
    active: number;
    transferVisible: boolean;
    tempFiles: Array<Files>;
}

export default class PhotosEle extends Component<PhotosEleProps, PhotosEleState> {

    static defaultProps = {
        editSelect: false,
        count: 0,
        max: 100,
        mandatory: false,

    }

    config: Config = {
        navigationBarTitleText: '首页'
    }

    private scrollView: ScrollViewProps;

    constructor(props) {
        super(props);
        this.state = {
            navSwitchActive: 0,
            loading: true,
            imageList: [],
            usefulList: [],
            loadStatus: "noMore",
            isEdit: false,
            sortActive: {},
            active: -1,
            editSelectImgs: [],
            editSelectImgIds: [],
            editSelectAttr: [],
            transferVisible: false,
            _editSelect: false,
            _count: 0,
            _max: 100,
            visible: false,
            tempFiles: []
        }
    }

    // 在排除已使用的图片后可能存在数量不够导致的不能上拉加载更多的问题
    getListAgain = async (list = []) => {
        if (list.length < 25) {
            try {
                let tempArr = [];
                const res = await api("app.profile/imgs", {
                    start: list.length,
                    size: 25 - list.length,
                    type: "image"
                });
                tempArr = list.concat(res.list);
                this.setState({imageList: tempArr})
            } catch (e) {

            }
        }

    }

    private total: number = 0;
    getList(data) {
        return new Promise<Array<any>>(async (resolve, reject) => {
            const opt = {
                start: data.start || 0,
                size: data.size || 25,
                type: data.type || this.state.navSwitchActive,
                loadMore: data.loadMore || false,
                findUseful: !notNull(data.findUseful) ? data.findUseful : true,
            };
            const temp = {
                start: opt.start, size: opt.size, type: "image"
            }
            if (data.sort) {
                Object.assign(temp, {sort: data.sort})
            }
            if (data.order) {
                Object.assign(temp, {order: data.order})
            }
            try {
                const res = await api("app.profile/imgs", temp);
                this.total = Number(res.total);
                this.setState({loading: false});
                let list = [];
                list = opt.loadMore ? this.state.imageList.concat(res.list) : res.list;

                const usefulList = this.state.usefulList;
                const {defaultSelect} = this.props;
                if (defaultSelect && defaultSelect instanceof Array) {
                    for (let i = 0; i < list.length; i++) {
                        const parent = list[i];
                        for (let d = 0; d < defaultSelect.length; d++) {
                            const child = defaultSelect[d];
                            if (parent.id == child.id) {
                                list[i].display = true;
                                if (opt.findUseful) {
                                    usefulList.push({
                                        id: parent.id,
                                        url: parent.url
                                    })
                                }
                            }
                        }
                    }
                    debuglog("进入的已使用列表：", JSON.parse(JSON.stringify(defaultSelect)), usefulList)
                    this.setState({usefulList})
                }

                this.setState({
                    imageList: list,
                    loadStatus: Number(res.total) === list.length ? "noMore" : "more"
                }, () => {
                    resolve(list)
                })
            } catch (e) {
                reject(e)
                debuglog("获取图库出错：", e)
                this.setState({loadStatus: "noMore"})
            }
            this.setState({loading: false})
        })
    }

    initPropsToState = () => {

        const {editSelect, count, max} = this.props;
        const _editSelect = editSelect || false;
        const _count = count || 0;
        const _max = max || 100;
        this.setState({
            _editSelect,
            _count,
            _max
        });
    }

    componentDidMount() {
        this.initPropsToState()
        this.getList({start: 0}).then((res) => {
            this.getListAgain(res)
        })
    }

    _onClose = () => {
        const {onClose, mandatory} = this.props;
        const {editSelectImgs} = this.state;
        if (mandatory && editSelectImgs.length === 0) {
            Taro.showToast({title: "您还未选择图片", icon: "none"})
            return
        }
        onClose && onClose()
    }

    uploadFile = async files => {
        debuglog(files)
        this.getList({start: 0})
    }

    imageSelect = (id: any, url, attr, directly = false) => {
        const {_editSelect, _count, _max} = this.state;

        if (_editSelect) {
            const editSelectImgIds = this.state.editSelectImgIds;
            const editSelectImgs = this.state.editSelectImgs;
            const editSelectAttr = this.state.editSelectAttr;
            const idx = editSelectImgIds.findIndex(v => v == id);
            if (idx > -1 && !directly) {
                editSelectImgs.splice(idx, 1);
                editSelectImgIds.splice(idx, 1);
                editSelectAttr.splice(idx, 1)
            } else {
                if (_count > 0 && editSelectImgs.length === _count) {
                    Taro.showToast({title: `只能选择${_count}张`, icon: "none"})
                    return;
                }
                if (editSelectImgIds.length >= _max) {
                    Taro.showToast({title: `最多选择${_max}张`, icon: "none"})
                    return;
                } else {
                    editSelectImgs.push(url);
                    editSelectImgIds.push(id);
                    editSelectAttr.push(attr)
                }
            }
            this.setState({editSelectImgs, editSelectImgIds, editSelectAttr})
        }
    }

    delEditSelectImg = idx => {
        const {_max, _editSelect} = this.state;
        const editSelectImgs = this.state.editSelectImgs;
        const editSelectImgIds = this.state.editSelectImgIds;
        const editSelectAttr = this.state.editSelectAttr;

        if (_editSelect && editSelectImgIds.length >= _max) {
            Taro.showToast({
                title: `最多选择${_max}张`
            })
            return
        }

        editSelectImgs.splice(idx, 1);
        editSelectImgIds.splice(idx, 1);
        editSelectAttr.splice(idx, 1);
        this.setState({editSelectImgs, editSelectImgIds, editSelectAttr})
    }

    submitEditSelect = () => {
        const {_count} = this.state;
        const {editSelectImgs, editSelectImgIds, editSelectAttr} = this.state;
        const {onPhotoSelect} = this.props;
        if (editSelectImgs.length === 0 || editSelectImgIds.length === 0) {
            Taro.showToast({title: "未选择素材", icon: "none"})
            return
        }
        if (_count > 0 && _count !== editSelectImgs.length) {
            Taro.showToast({title: `必须选择${_count}张`, icon: "none"})
            return;
        }

        const data = {
            ids: editSelectImgIds,
            imgs: editSelectImgs,
            attrs: editSelectAttr
        }

        onPhotoSelect && onPhotoSelect(data)
    }

    changeType = idx => {
        const {navSwitchActive} = this.state;
        if (navSwitchActive === idx) {
            return
        }
        // this.setState({loading: true});
        this.setState({navSwitchActive: idx});
    }

    loadMore = () => {
        const {imageList, sortActive} = this.state;

        if (this.total === imageList.length) {
            this.setState({loadStatus: "noMore"})
            return
        }
        if (imageList.length < 25) {
            this.setState({loadStatus: "noMore"});
            return;
        }
        this.setState({loadStatus: "loading"});
        const temp = {start: imageList.length, loadMore: true};
        if (Object.keys(sortActive).length > 0) {
            Object.assign(temp, sortActive)
        }
        this.getList(temp);
    }

    changeSort = (data: PopLayoutItemProps, index: number) => {
        debuglog(data, index)
        let sort = {};
        if (typeof data.value === "string") {
            sort = JSON.parse(data.value);
        }
        this.setState({
            sortActive: sort,
            visible: false,
            active: index
        })
        this.scrollView.scrollTop = 0;
        this.getList({
            start: 0,
            ...sort,
        })
    }

    startChooseImg = async () => {
        try {
            const arr = await chooseImageFromSystem();
            this.setState({tempFiles: [...arr]}, () => {
                this.setState({transferVisible: true})
            })
        }catch (e) {

        }
    }

    // 上传完成后请求一次后端数据，以保证自动选择功能的正常使用
    onUploadComplete = () => {
        this.getList({start: 0, findUseful: false}).then((res) => {
            this.getListAgain(res)
        })
    }

    onTransferClose = (arr) => {
        debuglog("关闭后进来的ID列表：", arr)
        this.setState({transferVisible: false})

        // this.imageSelect(item.id, item.url, `${item.width}*${item.height}`)

        if (arr && arr instanceof Array && arr.length > 0) {
            const {imageList} = this.state;
            const editSelectImgIds = this.state.editSelectImgIds;
            const editSelectImgs = this.state.editSelectImgs;
            const editSelectAttr = this.state.editSelectAttr;
            for (let i = 0; i < imageList.length; i++) {
                const item = imageList[i];
                let has = false;
                let repeat = false;
                for (let j = 0; j < arr.length; j++) {
                    repeat = editSelectImgIds.findIndex(val => parseInt(val) === parseInt(arr[j])) === -1;
                    if (parseInt(item.id) == parseInt(arr[j])) {
                        has = true;
                        break;
                    }
                }

                debuglog("has", has)
                if (has && repeat) {
                    editSelectImgIds.push(item.id);
                    editSelectImgs.push(item.url);
                    editSelectAttr.push(`${item.width}*${item.height}`)
                }
            }
            this.setState({
                editSelectImgs, editSelectAttr, editSelectImgIds
            })
        }
    }

    private popoverItem: PopLayoutItemProps[] = [
        {
            title: "时间从远到近排序",
            value: JSON.stringify({sort: "createtime", order: "asc"}),
            key: 1,
        },
        {
            title: "时间从近到远排序",
            value: JSON.stringify({sort: "createtime", order: "desc"}),
            key: 2,
        },
        {
            title: "从大到小降序",
            value: JSON.stringify({sort: "filesize", order: "desc"}),
            key: 3,
        },
        {
            title: "从小到大升序",
            value: JSON.stringify({sort: "filesize", order: "asc"}),
            key: 4,
        },
    ]

    getScrollHeight = () => {
        const h = deviceInfo.windowHeight - 130 - 45;
        return deviceInfo.env === "h5" ? h : deviceInfo.windowHeight - deviceInfo.menu.bottom - 45 - (deviceInfo.statusBarHeight * 1.5)
    }

    render() {
        const {_editSelect, _count} = this.state;
        const {
            navSwitchActive,
            loading,
            imageList,
            usefulList,
            active,
            loadStatus,
            editSelectImgs,
            editSelectImgIds,
            visible,
            transferVisible,
            tempFiles,
            _max,
        } = this.state;
        const list = navSwitchActive === 0 ? imageList : usefulList;
        const tabs = ["未使用", "已使用"];
        return (
            <View className='photos'>
                <View className='photos_nav_bar' style={{
                    marginTop: `${deviceInfo.env === "weapp" ? deviceInfo.menu.top + (deviceInfo.menu.height / 5) : 0}px`,
                    height: `${deviceInfo.env === "weapp" ? deviceInfo.menu.height : 44}px`,
                    paddingTop: `${deviceInfo.env === "h5" ? 10 : 0}px`
                }}>
                    <View className='left' onClick={this._onClose}>
                        <Text className="cl_t">关闭</Text>
                    </View>
                    <View className='center'>
                        <Text className="txt">素材库</Text>
                    </View>
                    <View className="right"/>
                </View>
                {
                    visible
                        ? <PopLayout
                            data={this.popoverItem}
                            onClick={this.changeSort}
                            visible={visible}
                            defaultActive={active}
                            onClose={() => this.setState({visible: false})} />
                        : null
                }
                <View className='container'>
                    <ScrollView className="list_scrollview"
                                style={deviceInfo.env !== "h5"
                                        ? `height: ${this.getScrollHeight()}px;padding-bottom: constant(safe-area-inset-bottom);padding-bottom: env(safe-area-inset-bottom);`
                                        : {height: this.getScrollHeight() + "px"}
                                }
                                scrollY
                                scrollWithAnimation
                                ref={r => this.scrollView = r}
                                onScrollToLower={this.loadMore}>
                        <View className="list_filter">
                            {
                                navSwitchActive === 0 && imageList.length > 0
                                    ? <View className="filter_txt" onClick={() => this.setState({visible: true})}>
                                        <Text className="tit">{active > -1 ? this.popoverItem[active].title : "排序"}</Text>
                                        <Image src={`${options.sourceUrl}appsource/down.png`} className="filter_icon" />
                                    </View>
                                    : <View />
                            }
                            <View className="filter_switch_bar">
                                {tabs.map((value, index) => (
                                    <View className={`filter_switch_item ${index === navSwitchActive ? "active" : ""}`}
                                          key={index.toString()}
                                          onClick={() => this.changeType(index)}>
                                        <Text className="txt">{value}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                        {
                            list.length === 0 && navSwitchActive === 0
                                ? <View className='empty'>
                                    <Image src={`${options.sourceUrl}appsource/empty/nophoto.png`} className='img'/>
                                    <Text className='txt'>暂无素材</Text>
                                    {/*<UploadFile extraType={3}*/}
                                    {/*            uploadType="image"*/}
                                    {/*            title="上传图片"*/}
                                    {/*            type="button"*/}
                                    {/*            count={9}*/}
                                    {/*            onChange={this.uploadFile}>*/}
                                    {/*    <Button className='btn'>上传素材</Button>*/}
                                    {/*</UploadFile>*/}
                                    <Button className='btn' onClick={this.startChooseImg}>上传素材</Button>
                                </View>
                                : <View className="list_container">
                                    <View className="list_main">
                                        {
                                            navSwitchActive === 0
                                                ? <View className="list_item" onClick={this.startChooseImg}>
                                                    {/*<UploadFile*/}
                                                    {/*    extraType={3}*/}
                                                    {/*    type="card"*/}
                                                    {/*    count={9}*/}
                                                    {/*    image={`${options.sourceUrl}appsource/car.png`}*/}
                                                    {/*    uploadType="image"*/}
                                                    {/*    style={photoGetItemStyle()}*/}
                                                    {/*    onChange={this.uploadFile}/>*/}
                                                    <View className="img_item" style={{
                                                        ...photoGetItemStyle(),
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        flexDirection: "column",
                                                        background: "rgba(20,20,43,0.87)"
                                                    }}>
                                                        <IconFont size={96} name="24_paizhaoshangchuan" color="#fff"/>
                                                    </View>
                                                </View>
                                                : null
                                        }
                                        {
                                            list.map((item, idx) => {
                                                return <View className="list_item" key={idx + ""} style={{display: item.display && item.display === true ? "none" : "flex"}}>
                                                    <View className="img_item" key={idx + ""}
                                                          style={photoGetItemStyle()}
                                                          onClick={() => this.imageSelect(item.id, item.url, `${item.width}*${item.height}`)}>
                                                        <Image
                                                            src={item.imagetype === "video" ? `${item.url}?x-oss-process=video/snapshot,t_1000,w_360,h_0,f_jpg,m_fast` : ossUrl(item.url, 1)}
                                                            mode="aspectFill"
                                                            style={photoGetItemStyle()}
                                                            className="img"/>
                                                    </View>
                                                    {_editSelect && editSelectImgIds.indexOf(item.id) > -1
                                                        ? <View className="edit_select_index"
                                                                onClick={() => this.imageSelect(item.id, item.url, `${item.width}*${item.height}`)}>
                                                            <Text className="txt">{editSelectImgIds.indexOf(item.id) + 1}</Text>
                                                        </View>
                                                        : null}
                                                </View>
                                            })
                                        }
                                    </View>
                                </View>
                        }
                        {list.length > 0 && navSwitchActive === 0
                            ? <LoadMore status={loadStatus} allowFix={!(_editSelect && list.length > 0)} />
                            : null}
                    </ScrollView>
                    {
                        _editSelect && list.length > 0
                            ? <View className="fix_selector_container">
                                <View className="photo_edit_selector_container">
                                    <View className="select_head">
                                        {editSelectImgIds.length > 0
                                            ? <View className="left">
                                                <Text className="txt">已选择</Text><Text className="red">{editSelectImgs.length}</Text><Text
                                                className="txt">个素材</Text><Text
                                                className="txt">{_count > 0 ? `，需选择${_count}张` : null}</Text>
                                            </View>
                                            : <View className="left">
                                                <Text className="txt">请选择需要的素材</Text>
                                            </View>}
                                        <View className="right">
                                            <View className="submit"
                                                  onClick={this.submitEditSelect}
                                                  style={{
                                                      background: editSelectImgIds.length > 0 ? "#FF4966" : "#ff91a3"
                                                  }}
                                            >
                                                <Text className="txt">使用</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <ScrollView scrollX className="select_items_scroll_view">
                                        <View className="select_items">
                                            {
                                                editSelectImgs.map((value, index) => (
                                                    <View className="select_items_wrap" key={index + ""}>
                                                        <View className="clear" onClick={() => this.delEditSelectImg(index)}>
                                                            <IconFont name="16_qingkong" size={32}/>
                                                        </View>
                                                        <Image src={ossUrl(value, 1)} mode="aspectFill" className="select_img"/>
                                                    </View>
                                                ))
                                            }
                                        </View>
                                    </ScrollView>
                                </View>
                            </View>
                            : null
                    }
                    {loading ? <AtActivityIndicator mode='center'/> : null}
                </View>
                {
                    transferVisible
                        ? <DocumentTransfer
                            visible={transferVisible}
                            useTotal={this.total}
                            defaultFiles={tempFiles}
                            max={_max}
                            selectedCount={editSelectImgIds.length}
                            selectPictureMode
                            onUploadComplete={this.onUploadComplete}
                            onClose={this.onTransferClose} />
                        : null
                }
            </View>
        )
    }
}
