import Taro, {Component, Config} from '@tarojs/taro'
import {Button, Image, ScrollView, Text, View} from '@tarojs/components'
import './photos.less'
import IconFont from '../../../../components/iconfont';
import {AtActivityIndicator, AtModal} from 'taro-ui'
import {api,options} from "../../../../utils/net";
import {chooseImageFromSystem, debuglog, deviceInfo, ossUrl, photoGetItemStyle} from "../../../../utils/common";
import LoadMore from "../../../../components/listMore/loadMore";
import Popover, {PopoverItemClickProps, PopoverItemProps} from "../../../../components/popover";
import {ScrollViewProps} from "@tarojs/components/types/ScrollView";
import {observer} from "@tarojs/mobx";
import {userStore} from "../../../../store/user";
import dayjs from "dayjs";
import page from "../../../../utils/ext";
import DocumentTransfer from "../../../../components/documentTransfer";
import {Files} from "../../../../modal/modal";


interface PhotosState {
    navSwitchActive: number;
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
    visible: boolean;
    tempFiles: Array<Files>;
}

@observer
@page({
    share: true
})
export default class Photos extends Component<{}, PhotosState> {

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
            videoList: [],
            selects: [],
            loadStatus: "noMore",
            isEdit: false,
            isOpened: false,
            sortActive: {},
            editSelectImgs: [],
            editSelectImgIds: [],
            editSelectAttr: [],
            visible: false,
            tempFiles: []
        }
    }

    private total: number = 0;

    async getList(data) {

        const opt = {
            start: data.start || 0,
            size: data.size || 30,
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
        try {
            const res = await api("app.profile/imgs", temp);
            this.total = Number(res.total);
            debuglog(res);
            this.setState({loading: false});
            let list = [];
            if (opt.type === 0) {
                list = opt.loadMore ? this.state.imageList.concat(res.list) : res.list;
                this.setState({imageList: list, loadStatus: Number(res.total) === list.length ? "noMore" : "more"})
            } else {
                list = opt.loadMore ? this.state.videoList.concat(res.list) : res.list;
                this.setState({videoList: list, loadStatus: Number(res.total) === list.length ? "noMore" : "more"})
            }
        } catch (e) {
            debuglog("获取图库出错：", e)
            this.setState({loadStatus: "noMore"})
        }
        this.setState({loading: false})
    }


    componentDidMount() {
        this.getList({start: 0})
    }

    uploadFile = async files => {
        debuglog(files)
        this.getList({start: 0})
    }

    imageSelect = (id: any) => {
        const selects = this.state.selects;
        const idx = selects.indexOf(Number(id));
        if (idx > -1) {
            selects.splice(idx, 1)
        } else {
            selects.push(Number(id))
        }
        this.setState({selects})
    }

    updateLocalPhotos = (arr = []) => {
        try {
            const res = Taro.getStorageSync(`${userStore.id}_photo_${dayjs().date()}`);
            if (res) {
                let temp = JSON.parse(res);
                const _arr = [...temp.path, ...arr];
                temp = {...temp, path: _arr}
                Taro.setStorageSync(`${userStore.id}_photo_${dayjs().date()}`, JSON.stringify(temp))
            } else {
                debuglog("选图没有本地存储")
            }
        } catch (e) {
            debuglog("选图本地存储失败")
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
        debuglog(len, this.total)
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
            this.setState({selects: [], isEdit: false})
            this.getList({start: 0})
        } catch (e) {
            debuglog("删除出错：", e)
        }
        this.setState({isOpened: false})
    }

    changeSort = (data: PopoverItemClickProps) => {
        debuglog(data.value)
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

    onUploadComplete = () => {
        this.getList({start: 0, findUseful: false})
    }

    startChooseImg = async () => {
        try {
            const arr = await chooseImageFromSystem();
            this.setState({tempFiles: [...arr]}, () => {
                this.setState({visible: true})
            })
        }catch (e) {

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
        const {isEdit} = this.state;
        const h = isEdit ? deviceInfo.windowHeight - 105 : deviceInfo.windowHeight - 45;
        return deviceInfo.env === "h5" ? h : isEdit ? deviceInfo.windowHeight - deviceInfo.safeBottomHeight - 60 - 45 : deviceInfo.screenHeight - deviceInfo.safeArea.top - deviceInfo.statusBarHeight
    }

    render() {
        const {navSwitchActive, loading, imageList, selects, videoList, loadStatus, isEdit, isOpened, visible, tempFiles} = this.state;
        const list = navSwitchActive === 0 ? imageList : videoList;
        const tabs = ["图片", "视频"];
        return (
            <View className='photos'>
                <View className='photos_nav_bar' style={{
                    paddingTop: `${deviceInfo.env === "weapp" ? deviceInfo.menu.top + (deviceInfo.menu.height / 5) : 10}px`,
                }}>
                    <View className='left' onClick={() => {
                        Taro.navigateBack()
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314'/>
                    </View>
                    <View className='center'>
                        <View className='nav-switch'>
                            {
                                tabs.map((item, index) => (
                                    <View className={navSwitchActive == index ? 'item active' : 'item'} key={index + ""}
                                          onClick={() => this.changeType(index)}>
                                        <Text className='txt'>{item}</Text>
                                    </View>
                                ))
                            }
                        </View>
                    </View>
                    {
                        list.length > 0 && deviceInfo.env === "h5"
                            ? <View className="right" onClick={() => this.onEdit(!isEdit)}>
                                <Text>{isEdit ? "完成" : "编辑"}</Text>
                            </View>
                            : <View className="right"/>
                    }
                </View>
                <View className='container'>
                    <ScrollView className='list_scrollview'
                                style={`
                                height: ${this.getScrollHeight()}px;
                                padding-bottom:${isEdit && deviceInfo.env === "h5" ? "constant(safe-area-inset-bottom)" : 0};
                                padding-bottom:${isEdit && deviceInfo.env === "h5" ? "env(safe-area-inset-bottom)" : 0};
                                box-sizing: ${isEdit && deviceInfo.env === "h5" ? "border-box" : "initial"}`}
                                scrollY
                                scrollWithAnimation
                                ref={r => this.scrollView = r}
                                onScrollToLower={this.loadMore}>
                        {
                            list.length === 0
                                ? <View className='empty'>
                                    <Image src={`${options.sourceUrl}appsource/empty/nophoto.png`} className='img'/>
                                    <Text className='txt'>暂无素材</Text>
                                    {/*<UploadFile extraType={navSwitchActive === 0 ? 3 : 4}*/}
                                    {/*            uploadType={navSwitchActive === 0 ? "image" : "video"}*/}
                                    {/*            title={navSwitchActive === 0 ? "上传图片" : "上传视频"}*/}
                                    {/*            type="button"*/}
                                    {/*            count={9}*/}
                                    {/*            onChange={this.uploadFile}>*/}
                                    {/*    <Button className='btn'>上传素材</Button>*/}
                                    {/*</UploadFile>*/}
                                    <Button className='btn' onClick={this.startChooseImg}>上传素材</Button>
                                </View>
                                : <View className="list_container">
                                    {
                                        deviceInfo.env === "weapp"
                                            ? <View className="list_filter">
                                                <Text className="tit"
                                                      onClick={() => this.onEdit(!isEdit)}>{isEdit ? "完成" : "管理"}</Text>
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
                                            : <View className="list_filter">
                                                <Text className="tit">排序</Text>
                                                <Popover popoverItem={this.popoverItem}>
                                                    <View><IconFont size={48} name="24_tupianpaixu"/></View>
                                                </Popover>
                                            </View>
                                    }
                                    <View className="list_main">
                                        <View className="list_item" onClick={this.startChooseImg}>
                                            {/*<UploadFile*/}
                                            {/*    extraType={navSwitchActive}*/}
                                            {/*    type="card"*/}
                                            {/*    count={9}*/}
                                            {/*    uploadType={navSwitchActive === 0 ? "image" : "video"}*/}
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
                                        {
                                            list.map((item, idx) => {
                                                return <View className="list_item" key={idx + ""}>
                                                    <View className="img_item" key={idx + ""}
                                                          style={photoGetItemStyle()}
                                                          onClick={() => this.imageSelect(item.id)}>
                                                        <Image src={item.imagetype === "video"
                                                            ? `${item.url}?x-oss-process=video/snapshot,t_1000,w_360,h_0,f_jpg,m_fast`
                                                            : ossUrl(item.url, 1)}
                                                               mode="aspectFill"
                                                               style={photoGetItemStyle()}
                                                               className="img"/>
                                                    </View>
                                                    {
                                                        isEdit
                                                            ? <View className="act_btn">
                                                                <IconFont
                                                                    name={selects.indexOf(Number(item.id)) > -1
                                                                        ? "22_yixuanzhong"
                                                                        : "22_touming-weixuanzhong"
                                                                    }
                                                                    size={44}/>
                                                            </View>
                                                            : null
                                                    }
                                                </View>
                                            })
                                        }
                                    </View>
                                </View>
                        }
                        {list.length > 0 ? <LoadMore status={loadStatus} allowFix={!isEdit} /> : null}
                    </ScrollView>
                    {loading ? <AtActivityIndicator mode='center'/> : null}
                    {
                        isEdit
                            ? <View className="select_all_container">
                                <View className="select_all_main">
                                    <View className="left">
                                        <View onClick={this.selectAll}>
                                            <IconFont
                                                name={selects.length === list.length ? "22_yixuanzhong" : "22_touming-weixuanzhong"}
                                                size={44}/>
                                            <Text>全选</Text>
                                        </View>
                                    </View>
                                    <View className="right">
                                        <View className="btn"
                                              onClick={this.onDeleteSelect}>删除{selects.length > 0 ? `(${selects.length})` : null}</View>
                                    </View>
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
                {
                    visible
                        ? <DocumentTransfer
                            useTotal={this.total}
                            defaultFiles={tempFiles}
                            onUploadComplete={this.onUploadComplete}
                            visible={visible}
                            onClose={() => this.setState({visible: false})} />
                        : null
                }
            </View>
        )
    }
}
