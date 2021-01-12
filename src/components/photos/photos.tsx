import Taro, {Component, Config} from '@tarojs/taro'
import {Button, Image, ScrollView, Text, View} from '@tarojs/components'
import './photos.less'
import IconFont from '../../components/iconfont';
import {AtActivityIndicator} from 'taro-ui'
import {api} from "../../utils/net";
import UploadFile from "../../components/Upload/Upload";
import {deviceInfo, ossUrl, photoGetItemStyle} from "../../utils/common";
import LoadMore from "../../components/listMore/loadMore";
import Popover, {PopoverItemClickProps, PopoverItemProps} from "../../components/popover";
import {ScrollViewProps} from "@tarojs/components/types/ScrollView";
import {observer} from "@tarojs/mobx";


interface PhotosEleProps {
    editSelect?: boolean;
    onPhotoSelect?: ({ids: [], imgs: [], attrs: []}) => void;
    defaultSelect?: Array<{ id: string | number, img: string }>;
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
}

@observer
export default class PhotosEle extends Component<PhotosEleProps, PhotosEleState> {

    static defaultProps = {
        editSelect: false,
        count: 0,
        max: 100,
        mandatory: false
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
            editSelectImgs: [],
            editSelectImgIds: [],
            editSelectAttr: [],
            _editSelect: false,
            _count: 0,
            _max: 100
        }
    }

    private total: number = 0;

    async getList(data) {

        const opt = {
            start: data.start || 0,
            size: data.size || 25,
            type: data.type || this.state.navSwitchActive,
            loadMore: data.loadMore || false
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
            console.log(res);
            this.setState({loading: false});
            let list = [];
            list = opt.loadMore ? this.state.imageList.concat(res.list) : res.list;
            this.setState({imageList: list, loadStatus: Number(res.total) === list.length ? "noMore" : "more"})
        } catch (e) {
            console.log("获取图库出错：", e)
            this.setState({loadStatus: "noMore"})
        }
        this.setState({loading: false})
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

    componentWillMount() {
        if (deviceInfo.env === "weapp") {
            this.initPropsToState()
            this.getList({start: 0}).then(() => {
                const {defaultSelect} = this.props;
                const {navSwitchActive} = this.state;

                if (defaultSelect && navSwitchActive === 0) {
                    // const editSelectImgs = this.state.editSelectImgs;
                    // const editSelectImgIds = this.state.editSelectImgIds;
                    // for (const p of imageList) {
                    //     for (const c of defaultSelect) {
                    //         if (c.id == p.id) {
                    //             editSelectImgIds.push(c.id);
                    //             editSelectImgs.push(c.img);
                    //         }
                    //     }
                    // }
                    // this.setState({editSelectImgs, editSelectImgIds})
                }
            })
        }
    }


    componentDidMount() {
        this.initPropsToState()
        this.getList({start: 0}).then(() => {
            const {defaultSelect} = this.props;
            const {navSwitchActive} = this.state;

            if (defaultSelect && navSwitchActive === 0) {
                // const editSelectImgs = this.state.editSelectImgs;
                // const editSelectImgIds = this.state.editSelectImgIds;
                // for (const p of imageList) {
                //     for (const c of defaultSelect) {
                //         if (c.id == p.id) {
                //             editSelectImgIds.push(c.id);
                //             editSelectImgs.push(c.img);
                //         }
                //     }
                // }
                // this.setState({editSelectImgs, editSelectImgIds})
            }
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
        console.log(files)
        this.getList({start: 0})
    }

    imageSelect = (id: any, url, attr) => {
        const {_editSelect, _count} = this.state;

        if (_editSelect) {
            const editSelectImgs = this.state.editSelectImgs;
            const editSelectImgIds = this.state.editSelectImgIds;
            const editSelectAttr = this.state.editSelectAttr;
            const idx = editSelectImgIds.findIndex(v => v == id);
            if (idx > -1) {
                editSelectImgs.splice(idx, 1);
                editSelectImgIds.splice(idx, 1);
                editSelectAttr.splice(idx, 1)
            } else {
                if (_count > 0 && editSelectImgs.length === _count) {
                    Taro.showToast({title: `只能选择${_count}张`, icon: "none"})
                    return;
                }
                if (editSelectImgIds.length >= 100) {
                    Taro.showToast({title: `最多选择100张`, icon: "none"})
                    return;
                }
                editSelectImgs.push(url);
                editSelectImgIds.push(id);
                editSelectAttr.push(attr)
            }
            this.setState({editSelectImgs, editSelectImgIds, editSelectAttr})
            return
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


    changeSort = (data: PopoverItemClickProps) => {
        console.log(data.value)
        if (data.value) {
            let sort = {};
            if (typeof data.value === "string") {
                sort = JSON.parse(data.value);
            }
            this.setState({sortActive: sort})
            this.scrollView.scrollTop = 0;
            this.getList({
                start: 0,
                ...sort
            })
        }
    }

    private popoverItem: PopoverItemProps[] = [
        {
            title: "时间从远到近排序",
            value: JSON.stringify({sort: "createtime", order: "asc"}),
            onClick: this.changeSort,
        },
        {
            title: "时间从近到远排序",
            value: JSON.stringify({sort: "createtime", order: "desc"}),
            onClick: this.changeSort,
        },
        {
            title: "从大到小降序",
            value: JSON.stringify({sort: "filesize", order: "desc"}),
            onClick: this.changeSort,
        },
        {
            title: "从小到大升序",
            value: JSON.stringify({sort: "filesize", order: "asc"}),
            onClick: this.changeSort,
        },
        // {
        //     title: " 时间从远到近排序",
        //     value: JSON.stringify({sort: "createtime", order: "asc"}),
        //     onClick: this.changeSort,
        //     customRender: <View className="sort_item"><Text className="txt">时间从远到近排序</Text></View>
        // },
        // {
        //     title: "时间从近到远排序",
        //     value: JSON.stringify({sort: "createtime", order: "desc"}),
        //     onClick: this.changeSort,
        //     customRender: <View className="sort_item"><Text className="txt">时间从近到远排序</Text></View>
        // },
        // {
        //     title: "从大到小降序",
        //     value: JSON.stringify({sort: "filesize", order: "desc"}),
        //     onClick: this.changeSort,
        //     customRender: <View className="sort_item"><Text className="txt">从大到小降序</Text></View>
        // },
        // {
        //     title: "从小到大升序",
        //     value: JSON.stringify({sort: "filesize", order: "asc"}),
        //     onClick: this.changeSort,
        //     customRender: <View className="sort_item"><Text className="txt">从小到大升序</Text></View>
        // }
    ]

    getScrollHeight = () => {
        const {_editSelect} = this.state;
        const {imageList, usefulList, navSwitchActive} = this.state;
        const list = navSwitchActive === 0 ? imageList : usefulList;
        const isEdit = _editSelect && (list.length > 0);
        const h = isEdit ? deviceInfo.windowHeight - 130 - 45 : deviceInfo.windowHeight - 45;
        return deviceInfo.env === "h5" ? h : isEdit ? deviceInfo.windowHeight - 130 - 45 + (deviceInfo.statusBarHeight / 2) : deviceInfo.screenHeight - deviceInfo.safeArea.top - deviceInfo.statusBarHeight
    }

    render() {
        const {_editSelect, _count} = this.state;
        const {
            navSwitchActive,
            loading,
            imageList,
            usefulList,
            loadStatus,
            editSelectImgs,
            editSelectImgIds
        } = this.state;
        // const list = navSwitchActive === 0 ? imageList : usefulList;
        const list = imageList;
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
                <View className='container'>
                    <ScrollView className="list_scrollview"
                                style={deviceInfo.env !== "h5" && !(_editSelect && list.length > 0)
                                        ? `height: ${this.getScrollHeight()}px;padding-bottom: constant(safe-area-inset-bottom);padding-bottom: env(safe-area-inset-bottom);`
                                        : {height: this.getScrollHeight() + "px"}
                                }
                                scrollY
                                scrollWithAnimation
                                ref={r => this.scrollView = r}
                                onScrollToLower={this.loadMore}>
                        {
                            list.length === 0
                                ? <View className='empty'>
                                    <Image src={require('../../source/empty/nophoto.png')} className='img'/>
                                    <Text className='txt'>暂无素材</Text>
                                    <UploadFile extraType={3}
                                                uploadType="image"
                                                title="上传图片"
                                                type="button"
                                                count={9}
                                                onChange={this.uploadFile}>
                                        <Button className='btn'>上传素材</Button>
                                    </UploadFile>
                                </View>
                                : <View className="list_container">
                                    <View className="list_filter">
                                        <View className="filter_txt">
                                            <Text className="tit">按大小排序</Text>
                                            <Image src={require("../../source/down.png")} className="filter_icon" />
                                        </View>
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
                                    <View className="list_main">
                                        <View className="list_item">
                                            <UploadFile
                                                extraType={3}
                                                type="card"
                                                count={9}
                                                image={require("../../source/car.png")}
                                                uploadType="image"
                                                style={photoGetItemStyle()}
                                                onChange={this.uploadFile}/>
                                        </View>
                                        {
                                            list.map((item, idx) => {
                                                return <View className="list_item" key={idx + ""}>
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
                                                            <Text
                                                                className="txt">{editSelectImgIds.indexOf(item.id) + 1}</Text>
                                                        </View>
                                                        : null}
                                                </View>
                                            })
                                        }
                                    </View>
                                </View>
                        }
                        {list.length > 0
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
            </View>
        )
    }
}
