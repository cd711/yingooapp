import Taro, { Component, Config } from '@tarojs/taro'
import {View, Text, Image, Button, ScrollView} from '@tarojs/components'
import './photos.less'
import IconFont from '../../components/iconfont';
import {AtActivityIndicator, AtModal} from 'taro-ui'
import {api} from "../../utils/net";
import UploadFile from "../../components/Upload/Upload";
import {ossUrl} from "../../utils/common";
import LoadMore from "../../components/listMore/loadMore";

export default class Photos extends Component<any,{
    navSwitchActive:number;
    loading: boolean;
    imageList: any[];
    videoList: any[];
    selects: number[];
    loadStatus: 'more' | 'loading' | 'noMore';
    isEdit: boolean;
    isOpened: boolean
}> {

    config: Config = {
        navigationBarTitleText: '首页'
    }
    constructor(props){
        super(props);
        this.state = {
            navSwitchActive:0,
            loading: true,
            imageList: [],
            videoList: [],
            selects: [],
            loadStatus: "noMore",
            isEdit: false,
            isOpened: false
        }
    }

    componentDidMount() {
        this.getList({start: 0})
    }

    private total: number = 0;
    async getList(data) {
        const opt = {
            start: data.start || 0,
            size: data.size || 15,
            type: data.type || this.state.navSwitchActive,
            loadMore: data.loadMore || false
        };
        try{
            const res = await api("app.profile/imgs", {start: opt.start, size: opt.size, type: opt.type === 0 ? "image" : "video"});
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
        };
        this.setState({loading: false})
    }

    uploadFile = async files => {
        console.log(files)
        this.getList({start: 0})
    }

    imageSelect = id => {
        const selects = this.state.selects;
        const idx = selects.indexOf(Number(id));
        if (idx > -1) {
            selects.splice(idx, 1)
        } else {
            selects.push(Number(id))
        }
        this.setState({selects})
    }

    changeType = idx => {
        const {navSwitchActive} = this.state;
        if (navSwitchActive === idx) {
            return
        }
        this.setState({loading: true})
        this.setState({navSwitchActive: idx}, () => {
            this.getList({start: 0})
        });
    }

    loadMore = () => {
        const {navSwitchActive, imageList, videoList} = this.state;
        const len = navSwitchActive === 0 ? imageList.length : videoList.length;
        if (this.total === len) {
            this.setState({loadStatus: "noMore"})
            return
        }
        this.setState({loadStatus: "loading"});
        this.getList({start: len, loadMore: true});
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
            this.getList({start: 0})
        }catch (e) {
            console.log("删除出错：", e)
        };
        this.setState({isOpened: false})
    }


    render() {
        const { navSwitchActive, loading, imageList, selects, videoList, loadStatus, isEdit, isOpened} = this.state;
        const list = navSwitchActive === 0 ? imageList : videoList;
        const tabs = ["图片","视频"];
        return (
            <View className='photos'>
                <View className='nav-bar'>
                    <View className='left' onClick={()=>{
                        Taro.navigateBack();
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314' />
                    </View>
                    <View className='center'>
                        <View className='nav-switch'>
                            {
                                tabs.map((item,index)=>(
                                    <View className={navSwitchActive==index?'item active':'item'} key={index} onClick={() => this.changeType(index)}>
                                        <Text className='txt'>{item}</Text>
                                    </View>
                                ))
                            }
                        </View>
                    </View>
                    {
                        list.length > 0
                            ? <View className="right" onClick={() => this.onEdit(!isEdit)}>
                                <Text>{isEdit ? "完成" : "编辑"}</Text>
                            </View>
                            : null
                    }
                </View>
                <View className='container'>
                    <ScrollView className='list_scrollview'
                                style={{height: window.screen.height - 52 + 16}}
                                scrollY={true}
                                scrollWithAnimation={true}
                                onScrollToLower={this.loadMore}>
                        {
                            list.length === 0
                                ? <View className='empty'>
                                    <Image src={require('../../source/empty/nophoto.png')} className='img' />
                                    <Text className='txt'>暂无素材</Text>
                                    <UploadFile extraType={navSwitchActive === 0 ? 3 : 4}
                                                type="button"
                                                onChange={this.uploadFile}>
                                        <Button className='btn'>上传素材</Button>
                                    </UploadFile>
                                </View>
                                : <View className="list_container">
                                    <View className="list_filter">
                                        <Text className="tit">排序</Text>
                                        <View><IconFont size={48} name="24_tupianpaixu"/></View>
                                    </View>
                                    <View className="list_main">
                                        <View className="list_item">
                                            <UploadFile extraType={navSwitchActive} type="card" onChange={this.uploadFile}/>
                                        </View>
                                        {
                                            list.map((item, idx) => {
                                                return <View className="list_item" key={idx}>
                                                    <View className="img_item" key={idx} onClick={() => this.imageSelect(item.id)}>
                                                        <Image src={ossUrl(item.url, 1)} mode="aspectFill" className="img"/>
                                                    </View>
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
                    {loading ? <AtActivityIndicator mode='center'></AtActivityIndicator> : null}
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
                <AtModal
                    className="modal_confirm_container"
                    isOpened={isOpened}
                    cancelText='取消'
                    confirmText='确认'
                    onCancel={() => this.setState({isOpened: false})}
                    onConfirm={this.handleConfirm}
                    content={`是否删除这${selects.length}${navSwitchActive === 0 ? "张照片" : "个视频"}?`}
                />
            </View>
        )
    }
}
