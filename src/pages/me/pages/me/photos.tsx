import Taro, { Component, Config } from '@tarojs/taro'
import {View, Text, Image, Button, ScrollView} from '@tarojs/components'
import './photos.less'
import IconFont from '../../../../components/iconfont';
import {AtActivityIndicator, AtModal} from 'taro-ui'
import {api} from "../../../../utils/net";
import UploadFile from "../../../../components/Upload/Upload";
import {ossUrl, deviceInfo, notNull} from "../../../../utils/common";
import LoadMore from "../../../../components/listMore/loadMore";
import Popover, {PopoverItemClickProps, PopoverItemProps} from "../../../../components/popover";
import {ScrollViewProps} from "@tarojs/components/types/ScrollView";
import {observer} from "@tarojs/mobx";
import {templateStore} from "../../../../store/template";
import {userStore} from "../../../../store/user";
import moment from "moment";


interface PhotosProps {
    editSelect?: boolean;
    onPhotoSelect?: ({ids: [], imgs: [], attrs: []}) => void;
    defaultSelect?: Array<{id: string | number, img: string}>;
    onClose?: () => void;
    // 选择图片必选多少张
    count?: number;
    // 选择图片最大多少张
    max?: number;
    // 小程序专用字段
    extraProps?: {[key: string] : any}
}
interface PhotosState {
    navSwitchActive:number;
    loading: boolean;
    imageList: any[];
    videoList: any[];
    selects: number[];
    loadStatus: 'more' | 'loading' | 'noMore';
    isEdit: boolean;
    isOpened: boolean;
    sortActive: object;
    editSelectImgs: string[];
    editSelectImgIds: any[];
    editSelectAttr: string[];
    _editSelect: boolean;
    _count: number;
    _max: number;
}
@observer
export default class Photos extends Component<PhotosProps, PhotosState> {

    static defaultProps = {
        editSelect: false,
        count: 0,
        max: 100
    }

    config: Config = {
        navigationBarTitleText: '首页'
    }

    // 小程序专用props,解析extraProps的内容,详情：https://nervjs.github.io/taro/docs/miniprogram-plugin#taro-v13-%E7%BB%84%E4%BB%B6%E6%8F%92%E4%BB%B6%E6%8E%A5%E5%8F%97%E5%A4%96%E9%83%A8-props-%E7%9A%84%E9%97%AE%E9%A2%98
    private _props: any = {};

    private scrollView: ScrollViewProps;
    constructor(props){
        super(props);
        this.state = {
            navSwitchActive: 0,
            loading: true,
            imageList: [],
            videoList: [],
            selects: [],
            loadStatus: "noMore",
            isEdit: false,
            isOpened: false,
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
    private notComponent: boolean = false;
    private setLocal: boolean = false;

    async getList(data) {

        const opt = {
            start: data.start || 0,
            size: data.size || 15,
            type: data.type || this.state.navSwitchActive,
            loadMore: data.loadMore || false
        };
        const temp = {
            start: opt.start, size: opt.size, type: opt.type === 0 ? "image" : "video"
        }
        if (data.sort) {
            Object.assign(temp, {sort: data.sort})
        }
        if (data.order) {
            Object.assign(temp, {order: data.order})
        }
        try{
            const res = await api("app.profile/imgs", temp);
            this.total = Number(res.total);
            console.log(res);
            this.setState({loading: false});
            let list = [];
            if (opt.type === 0) {
                list = opt.loadMore ? this.state.imageList.concat(res.list) : res.list;
                this.setState({imageList : list, loadStatus: Number(res.total) === list.length ? "noMore" : "more"})
            } else {
                list = opt.loadMore ? this.state.videoList.concat(res.list) : res.list;
                this.setState({videoList: list, loadStatus: Number(res.total) === list.length ? "noMore" : "more"})
            }
        }catch (e) {
            console.log("获取图库出错：", e)
            this.setState({loadStatus: "noMore"})
        }
        this.setState({loading: false})
    }

    initPropsToState = () => {
        let _props: any = {};
        if (deviceInfo.env === "h5") {
            _props = {...this.props}
        } else {
            _props = {...this.props.extraProps};
        }
        console.log(this.props)
        if (deviceInfo.env === "weapp") {
            this.notComponent = true;
        }
        const {editSelect, count, max, extraProps} = _props;
        // 读取router的参数是因为小程序是页面跳转
        const router = this.$router;
        const {edit, c, m, l} = router.params;
        const _editSelect = templateStore.printStatus || (edit && edit === "t") || editSelect || false;
        const _count = count || (!notNull(c) && parseInt(c)) || 0;
        const _max = max || (!notNull(m) && parseInt(m)) || 100;
        this.setLocal = !notNull(l) && l === "t"
        this.setState({
            _editSelect,
            _count,
            _max
        });
        this._props = {...extraProps}
    }

    componentWillMount() {
        if (deviceInfo.env === "weapp") {
            this.initPropsToState()
            this.getList({start: 0}).then(() => {
                const {defaultSelect} = this._props;
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
            const {defaultSelect} = this._props;
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

        const selects = this.state.selects;
        const idx = selects.indexOf(Number(id));
        if (idx > -1) {
            selects.splice(idx, 1)
        } else {
            selects.push(Number(id))
        }
        this.setState({selects})
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
        const {onPhotoSelect} = this._props;
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

        templateStore.printStatus = false
        templateStore.printWxPhotoData = data as any;

        if (this.setLocal) {
            const path = [];
            for (let i = 0; i < data.ids.length; i++) {
                path.push({
                    id: data.ids[i],
                    url: data.imgs[i],
                    attr: data.attrs[i],
                    edited: false,
                    doc: ""
                })
            }
            this.updateLocalPhotos(path)
        }

        setTimeout(() => {
            if (this.notComponent) {
                Taro.navigateBack()
            } else {
                onPhotoSelect && onPhotoSelect(data)
            }
        }, 100)
    }

    updateLocalPhotos = (arr = []) => {
        try {
            const res = Taro.getStorageSync(`${userStore.id}_photo_${moment().date()}`);
            if (res) {
                let temp = JSON.parse(res);
                const _arr = [...temp.path, ...arr];
                temp = {...temp, path: _arr}
                Taro.setStorageSync(`${userStore.id}_photo_${moment().date()}`, JSON.stringify(temp))
            } else {
                console.log("选图没有本地存储")
            }
        }catch (e) {
            console.log("选图本地存储失败")
        }
    }

    changeType = idx => {
        const {navSwitchActive} = this.state;
        if (navSwitchActive === idx) {
            return
        }
        this.setState({loading: true});
        this.setState({navSwitchActive: idx}, () => {
            this.getList({start: 0})
        });
    }

    loadMore = () => {
        const {navSwitchActive, imageList, videoList, sortActive} = this.state;
        const len = navSwitchActive === 0 ? imageList.length : videoList.length;
        console.log(len, this.total)
        if (this.total === len) {
            this.setState({loadStatus: "noMore"})
            return
        }
        if (len < 15) {
            this.setState({loadStatus: "noMore"});
            return;
        }
        this.setState({loadStatus: "loading"});
        const temp = {start: len, loadMore: true};
        if (Object.keys(sortActive).length > 0) {
            Object.assign(temp, sortActive)
        }
        this.getList(temp);
    }

    onEdit = (isEdit) => {
        this.setState({isEdit})
        if (!isEdit) {
            this.setState({selects: []})
        }
    }

    selectAll = () => {
        const {navSwitchActive, imageList, videoList} = this.state;
        const len = navSwitchActive === 0 ? imageList.length : videoList.length;
        const list = navSwitchActive === 0 ? imageList : videoList;
        let selects = this.state.selects;
        if (len === selects.length) {
            selects = []
        } else {
            selects = list.map(value => Number(value.id))
        }
        this.setState({selects})
    }

    onDeleteSelect = async () => {
        this.setState({isOpened: true})
    }

    handleConfirm = async () => {
        const {selects} = this.state;
        try {
            await api("app.profile/delImgs", {ids: selects.join(",")});
            this.setState({selects: []})
            this.getList({start: 0})
        }catch (e) {
            console.log("删除出错：", e)
        }
        this.setState({isOpened: false})
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
        const {editSelectImgIds, imageList, videoList,navSwitchActive} = this.state;
        const list = navSwitchActive === 0 ? imageList : videoList;
        const h = _editSelect && (list.length > 0) && editSelectImgIds.length > 0 ? deviceInfo.windowHeight - 130 - 45 : deviceInfo.windowHeight - 45;
        return deviceInfo.env === "h5" ? h : h + deviceInfo.statusBarHeight + deviceInfo.menu.height
    }

    render() {
        const {onClose} = this._props;
        const {_editSelect, _count} = this.state;
        const { navSwitchActive, loading, imageList, selects, videoList, loadStatus, isEdit, isOpened, editSelectImgs, editSelectImgIds} = this.state;
        const list = navSwitchActive === 0 ? imageList : videoList;
        const tabs = ["图片","视频"];
        return (
            <View className='photos'>
                <View className='photos_nav_bar' style={
                    deviceInfo.env === "weapp"
                        ? `padding-top: ${deviceInfo.statusBarHeight}px;height: 64px`
                        : ""
                }>
                    <View className='left' onClick={()=>{
                        if (!_editSelect || this.notComponent) {
                            Taro.navigateBack()
                        } else {
                            onClose && onClose()
                        }
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314' />
                    </View>
                    <View className='center'>
                        <View className='nav-switch'>
                            {
                                tabs.map((item,index)=>(
                                    <View className={navSwitchActive==index?'item active':'item'} key={index+""} onClick={() => this.changeType(index)}>
                                        <Text className='txt'>{item}</Text>
                                    </View>
                                ))
                            }
                        </View>
                    </View>
                    {
                        list.length > 0 && deviceInfo.env === "h5"
                            ? _editSelect
                                ? <View className="right">
                                    <Popover popoverItem={this.popoverItem}>
                                        <View><IconFont size={48} name="24_tupianpaixu"/></View>
                                    </Popover>
                                </View>
                                : <View className="right" onClick={() => this.onEdit(!isEdit)}>
                                    <Text>{isEdit ? "完成" : "编辑"}</Text>
                                </View>
                            : <View className="right"/>
                    }
                </View>
                <View className='container'>
                    <ScrollView className='list_scrollview'
                                style={{height: this.getScrollHeight() + "px"}}
                                scrollY
                                scrollWithAnimation
                                ref={r => this.scrollView = r}
                                onScrollToLower={this.loadMore}>
                        {
                            list.length === 0
                                ? <View className='empty'>
                                    <Image src={require('../../../../source/empty/nophoto.png')} className='img' />
                                    <Text className='txt'>暂无素材</Text>
                                    <UploadFile extraType={navSwitchActive === 0 ? 3 : 4}
                                                uploadType={navSwitchActive === 0 ? "image" : "video"}
                                                title={navSwitchActive === 0 ? "上传图片" : "上传视频"}
                                                type="button"
                                                count={9}
                                                onChange={this.uploadFile}>
                                        <Button className='btn'>上传素材</Button>
                                    </UploadFile>
                                </View>
                                : <View className="list_container">
                                    {
                                        deviceInfo.env === "weapp"
                                            ? !_editSelect
                                                ? <View className="list_filter">
                                                    <Text className="tit" onClick={() => this.onEdit(!isEdit)}>{isEdit ? "完成" : "管理"}</Text>
                                                    {
                                                        isEdit
                                                            ? <View className="weapp_list_filter_act">
                                                                <Text onClick={() => this.onEdit(!isEdit)}>取消</Text>
                                                            </View>
                                                            : <Popover popoverItem={this.popoverItem}>
                                                                <View className="weapp_list_filter_act">
                                                                    <Text className="txt">排序</Text>
                                                                    <IconFont size={48} name="24_tupianpaixu"/>
                                                                </View>
                                                            </Popover>
                                                    }
                                                </View>
                                                : null
                                            : <View className="list_filter">
                                                <Text className="tit">排序</Text>
                                                <Popover popoverItem={this.popoverItem}>
                                                    <View><IconFont size={48} name="24_tupianpaixu"/></View>
                                                </Popover>
                                            </View>
                                    }
                                    <View className="list_main">
                                        <View className="list_item">
                                            <UploadFile
                                                extraType={navSwitchActive}
                                                type="card"
                                                count={9}
                                                uploadType={navSwitchActive === 0 ? "image" : "video"}
                                                style={"width: 248rpx"}
                                                onChange={this.uploadFile}/>
                                        </View>
                                        {
                                            list.map((item, idx) => {
                                                return <View className="list_item" key={idx+""}>
                                                    <View className="img_item" key={idx+""}
                                                          onClick={() => this.imageSelect(item.id, item.url, `${item.width}*${item.height}`)}>
                                                        <Image src={item.imagetype === "video" ? `${item.url}?x-oss-process=video/snapshot,t_1000,w_360,h_0,f_jpg,m_fast` : ossUrl(item.url, 1)}
                                                               mode="aspectFill"
                                                               className="img"/>
                                                    </View>
                                                    {_editSelect && editSelectImgIds.indexOf(item.id) > -1
                                                        ? <View className="edit_select_index" onClick={() => this.imageSelect(item.id, item.url, `${item.width}*${item.height}`)}>
                                                            <Text className="txt">{editSelectImgIds.indexOf(item.id) + 1}</Text>
                                                        </View>
                                                        : null}
                                                    {
                                                        isEdit
                                                            ? <View className="act_btn">
                                                                <IconFont name={selects.indexOf(Number(item.id)) > -1 ? "22_yixuanzhong" : "22_touming-weixuanzhong"}
                                                                          size={44} />
                                                            </View>
                                                            : null
                                                    }
                                                </View>
                                            })
                                        }
                                    </View>
                                </View>
                        }
                        {list.length > 0 ? <LoadMore status={loadStatus} /> : null}
                    </ScrollView>
                    {
                        _editSelect && list.length > 0 && editSelectImgIds.length > 0
                            ? <View className="photo_edit_selector_container">
                                <View className="select_head">
                                    <View className="left">
                                        <Text className="txt">已选择<Text className="red">{editSelectImgs.length}</Text>个素材{_count > 0 ? `，需选择${_count}张` : null}</Text>
                                        {/*<Text className="ext">长按拖动排序</Text>*/}
                                    </View>
                                    <View className="right">
                                        <View className="submit" onClick={this.submitEditSelect}>
                                            <Text className="txt">使用</Text>
                                        </View>
                                    </View>
                                </View>
                                <ScrollView scrollX className="select_items_scroll_view">
                                    <View className="select_items">
                                        {
                                            editSelectImgs.map((value, index) => (
                                                <View className="select_items_wrap" key={index+""}>
                                                    <View className="clear" onClick={() => this.delEditSelectImg(index)}>
                                                        <IconFont name="16_qingkong" size={32} />
                                                    </View>
                                                    <Image src={ossUrl(value, 1)} mode="aspectFill" className="select_img" />
                                                </View>
                                            ))
                                        }
                                    </View>
                                </ScrollView>
                            </View>
                            : null
                    }
                    {loading ? <AtActivityIndicator mode='center' /> : null}
                    {
                        isEdit
                            ? <View className="select_all_container">
                                <View className="left">
                                    <View onClick={this.selectAll}>
                                        <IconFont name={selects.length === list.length ? "22_yixuanzhong" : "22_touming-weixuanzhong"} size={44}/>
                                        <Text>全选</Text>
                                    </View>
                                </View>
                                <View className="right">
                                    <View className="btn" onClick={this.onDeleteSelect}>删除{selects.length > 0 ? `(${selects.length})` : null}</View>
                                </View>
                            </View>
                            : null
                    }
                </View>
                {
                    isOpened
                        ? <AtModal
                            className="modal_confirm_container"
                            isOpened={isOpened}
                            cancelText='取消'
                            confirmText='确认'
                            onCancel={() => this.setState({isOpened: false})}
                            onConfirm={this.handleConfirm}
                            content={`是否删除这${selects.length}${navSwitchActive === 0 ? "张照片" : "个视频"}?`}
                        />
                        : null
                }
            </View>
        )
    }
}
