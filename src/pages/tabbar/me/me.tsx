import Taro, {Component, Config} from '@tarojs/taro'
import {Image, ScrollView, Text, View} from '@tarojs/components'
import './me.less'
import IconFont from '../../../components/iconfont';
import {userStore} from "../../../store/user";
import {inject, observer} from '@tarojs/mobx'
import Empty from "../../../components/empty";
import {api} from '../../../utils/net';
import {deviceInfo, fixStatusBarHeight, getImageSize, ListModel, notNull, ossUrl,setTempDataContainer,urlEncode,getURLParamsStr} from '../../../utils/common';

import LoadMore, {LoadMoreEnum} from "../../../components/listMore/loadMore";
import moment from "moment";
import Popover, {PopoverItemClickProps} from "../../../components/popover";
import {AtModal} from "taro-ui";
import LoginModal from "../../../components/login/loginModal";
import { observe } from 'mobx';

const switchBottom = require("../../../source/switchBottom.png");

interface CollectiongProps {
    id: number,
    name: string,
    subtitle?: string,
    thumb_image: string,
    model: string,
    relation_id: number,
    user_id: number,
    admin_id: number,
    topid: number,
    favorite_time: number,
}
interface WorksProps {
    id: number,
    name: string,
    thumbnail: string,
    create_time: number,
    order_sn?: any,
    attr: {width: number, height: number}
}
interface MultiData {
    [key: number]: ListModel
}
interface MeState {
    switchActive: number;
    pageScrollShowTop: boolean;
    switchBarFixed: boolean;
    topHeight: number;
    data: MultiData;
    loadStatus: LoadMoreEnum;
    works: Array<any>;
    collectionList: Array<CollectiongProps>;
    isOpened: boolean
}

@inject("userStore")
@observer
export default class Me extends Component<any, MeState> {

    config: Config = {
        navigationBarTitleText: '我的'
    }

    constructor(props) {
        super(props);
        this.state = {
            switchActive: 0,
            pageScrollShowTop: false,
            switchBarFixed: false,
            topHeight: 0,
            loadStatus: LoadMoreEnum.loading,
            data: null,
            works: [],
            collectionList: [],
            isOpened: false
        }
    }

    private total: number = 0;
    private isLoading: number = 0;
    // 获取作品列表
    async getWorksList(data:{start?: number, size?: number, loadMore?: boolean} = {}) {
        if (this.isLoading > 1) {
            return
        }
        this.isLoading ++;
        const opt = {
            start: data.start || 0,
            size: data.size || 15,
            loadMore: data.loadMore || false
        }
        try {
            const res = await api("editor.user_tpl/index", {
                start: opt.start,
                size: opt.size,
            });
            this.total = Number(res.total);
            let works = [];
            if (opt.loadMore) {
                works = this.state.works.concat(res.list)
            } else {
                works = res.list
            }

            works = works.map(value => {
                if (value.isRendered && value.isRendered === true) {
                    return value
                } else {
                    return {
                        ...value,
                        attr: getImageSize(180, value.attr.width || 180, value.attr.height || 200),
                        isRendered: true
                    }
                }
            })

            this.setState({
                works,
                loadStatus: this.total == works.length ? LoadMoreEnum.noMore : LoadMoreEnum.more
            }, () => {
                this.isLoading = 0
            })
        }catch (e) {
            console.log("获取作品出错：", e)
            this.isLoading = 0
        }
    }

    // 获取收藏列表
    async getCollectionList(data:{start?: number, size?: number, loadMore?: boolean} = {}) {
        if (this.isLoading > 1) {
            return
        }
        this.isLoading ++;
        const opt = {
            start: data.start || 0,
            size: data.size || 15,
            loadMore: data.loadMore || false
        }
        try {
            const res = await api("app.profile/favoriteList", {
                model: "tpl_product",
                start: opt.start,
                size: opt.size,
            });
            this.total = Number(res.total);
            let collectionList: any[] = [];
            if (opt.loadMore) {
                collectionList = this.state.collectionList.concat(res.list)
            } else {
                collectionList = res.list
            }

            this.setState({
                collectionList,
                loadStatus: this.total == collectionList.length ? LoadMoreEnum.noMore : LoadMoreEnum.more
            }, () => {
                this.isLoading = 0
            })
        }catch (e) {
            console.log("获取作品出错：", e)
            this.isLoading = 0
        }
    }

    componentDidMount() {
        observe(userStore,"id",(change)=>{
            if (change.newValue != change.oldValue && userStore.isLogin) {
                this.getWorksList({start: 0})
            }
        })
        if (userStore.isLogin) {
            this.getWorksList({start: 0})
        }
    }

    // 监听滚动
    private scrollOnce = 0;
    onMeScroll = ({detail: {scrollTop}}) => {
        if (scrollTop > 5) {
            this.setState({pageScrollShowTop: true});
            if (this.scrollOnce == 0) {
                Taro.createSelectorQuery().selectAll(".me_top").boundingClientRect((top_rect: any) => {
                    this.scrollOnce += 1;
                    if (this.scrollOnce == 1) {
                        top_rect.forEach((l_rect) => {
                            if (l_rect.height > 0) {
                                this.setState({
                                    topHeight: l_rect.height
                                })
                            }
                        });
                    }
                }).exec()
            }
        } else {
            this.setState({
                pageScrollShowTop: false
            });
        }
        if (scrollTop > 255) {
            this.setState({
                switchBarFixed: true
            })
        } else {
            this.setState({
                switchBarFixed: false
            })
        }
    }

    lodeMore = () => {
        const { works, switchActive, collectionList } = this.state;
        console.log("加载更多", this.isLoading, this.total, works.length)

        if (switchActive === 0) {
            if (this.total === works.length || this.total < works.length || this.total < 15) {
                this.setState({loadStatus: LoadMoreEnum.noMore})
                return
            }
            if (this.total > works.length) {
                this.setState({loadStatus: LoadMoreEnum.loading})
                this.getWorksList({
                    start: works.length,
                    loadMore: true
                })
            }
            return;
        }
        if (this.total === collectionList.length || this.total < collectionList.length || this.total < 15) {
            this.setState({loadStatus: LoadMoreEnum.noMore})
            return
        }
        if (this.total > collectionList.length) {
            this.setState({loadStatus: LoadMoreEnum.loading})
            this.getCollectionList({
                start: collectionList.length,
                loadMore: true
            })
        }
    }

    // 切换菜单
    changeActive = idx => {
        const {switchActive} = this.state;
        if (switchActive !== idx) {
            this.setState({switchActive: idx}, () => {
                if (notNull(userStore.id)) {
                    return
                }
                if (idx === 0) {
                    this.getWorksList({
                        start: 0
                    })
                } else {
                    this.getCollectionList({
                        start: 0
                    })
                }
            })
        }
    }

    private deleteId: any = null;
    confirmDelete = async (data: PopoverItemClickProps) => {
        console.log(2222, data.corrValue)
        if (data.corrValue) {
            this.deleteId = data.corrValue.id
            this.setState({isOpened: true})
        }
    }

    deleteWork = async () => {
        if (!this.deleteId) {
            return
        }
        Taro.showLoading({title: "请稍后"});
        try{
            await api("editor.user_tpl/del", {id: this.deleteId});
            const works = this.state.works;
            const idx = works.findIndex(v => Number(v.id) === Number(this.deleteId));
            if (idx > -1) {
                works.splice(idx, 1);
                this.setState({works})
            }
            Taro.showToast({title: "删除成功", icon: "success"});
            this.deleteId = null;
            this.setState({isOpened: false});
            this.total--;
        }catch (e) {
            console.log("删除失败：", e)
        }
        Taro.hideLoading()
    }

    downloadImage = async (data: PopoverItemClickProps) => {
        if (data.corrValue) {
            Taro.downloadFile({
                url: data.corrValue.thumbnail,
                success: _ => {
                    Taro.showToast({title: "保存成功"})
                },
                fail: _ => {
                    Taro.showToast({title: "保存失败"})
                }
            })
        }
    }

    // 跳转预览页
    previewOrder = (item: WorksProps) => {
        console.log(item.id)
        const str = getURLParamsStr(urlEncode({
            workid: item.id,
            self: "t"
        }))
        Taro.navigateTo({
            url: `/pages/order/pages/template/preview?${str}`
        })
    }

    jumpTo = (path: string) => {
        if (userStore.isLogin) {
            userStore.showLoginModal = false;
            Taro.navigateTo({url: path})
        } else {
            userStore.showLoginModal = true;
        }
    }

    private popItemsWeapp = [
        {
            title: "分享",
            value: 2,
            icon: {
                name: "24_fenxiang",
                size: 40,
                color: "#121314"
            },
        },
        {
            title: "删除",
            value: 3,
            icon: {
                name: "24_shanchu",
                size: 40,
                color: "#FF4966"
            },
            onClick: this.confirmDelete,
        }
    ];
    componentDidShow(){
        setTempDataContainer("product_preview_sku",null,()=>{});
    }
    // @ts-ignore
    render() {
        const {switchActive, pageScrollShowTop, switchBarFixed, topHeight, isOpened, loadStatus, works, collectionList} = this.state;
        const {nickname, avatar,bio,isLogin} = userStore;
        return (
            <View className='me'>
                {
                    isOpened
                        ? <AtModal
                            className="modal_confirm_container"
                            isOpened={isOpened}
                            cancelText='取消'
                            confirmText='删除'
                            onCancel={() => this.setState({isOpened: false})}
                            onConfirm={this.deleteWork}
                            content='是否删除该作品?'
                        />
                        : null
                }
                <LoginModal isTabbar />
                <ScrollView scrollY onScroll={this.onMeScroll}
                            className="me_content_scroll"
                            enable-flex="true"
                            style={`height:${Taro.getSystemInfoSync().windowHeight}px`}
                            onScrollToLower={this.lodeMore}
                >
                    <View className='me_bg'/>
                    <View className='me_top'
                            style={pageScrollShowTop ? `position: fixed;top:0;padding-top:${Taro.getSystemInfoSync().statusBarHeight}px;transition: .8s background ease-out;background:#FFF;` : `position: fixed;padding-top:${Taro.getSystemInfoSync().statusBarHeight}px;`}>
                            {
                                deviceInfo.env != "h5" ?<View className='left' onClick={() => this.jumpTo('/pages/me/pages/me/setting')}>
                                    <IconFont name='24_shezhi' size={48} color='#121314'/>
                                </View>:null
                            }
                            <Text className='me_txt' style={pageScrollShowTop ?`opacity: 1;transition: .8s opacity ease-out;`:"opacity: 0;transition: .04s opacity ease-in;"}>我的</Text>
                            {
                                deviceInfo.env == "h5" ?<View className='right' onClick={() => this.jumpTo('/pages/me/pages/me/setting')}>
                                    <IconFont name='24_shezhi' size={48} color='#121314'/>
                                </View>:null
                            }
                    </View>
                    {/* @ts-ignore */}
                    <View className='topBox' style={fixStatusBarHeight()}>
                        <View className='top_weapp' />
                        <View className='baseInfo' onClick={() => this.jumpTo('/pages/me/pages/me/profile')}>
                            <View className='avator'>
                                <Image src={avatar.length > 0 ? avatar : require('../../../source/defaultAvatar.png')}
                                       className='avatarImg'/>
                                {
                                    isLogin?<View className='see'>
                                        <Text className='txt'>查看</Text>
                                    </View>:null
                                }
                            </View>
                            <View className='nb'>
                                <Text className='nickname'>{nickname.length > 0 ? `Hi，${nickname}` : "Hi，未登录"}</Text>
                                <Text className='bio'>{bio.length > 0 ?bio:"您未设置签名"}</Text>
                            </View>
                        </View>
                        <View className='orderWarp'>
                            <View className='myorall'>
                                <Text className='myorder'>我的订单</Text>
                                <View className='allorder' onClick={() => Taro.switchTab({url:'/pages/tabbar/order/order'})}>
                                    <Text>全部订单</Text>
                                    <IconFont name='16_xiayiye' size={36} color='#9C9DA6'/>
                                </View>
                            </View>
                            <View className='orderstate'>
                                <View className='oitem' onClick={() => {
                                    Taro.getApp().tab = 1;
                                    Taro.switchTab({url:'/pages/tabbar/order/order'})
                                }}>
                                    <IconFont name='24_daifukuan' size={48} color='#121314'/>
                                    <Text className='orderText'>待付款</Text>
                                </View>
                                <View className='oitem' onClick={() => {
                                    Taro.getApp().tab = 2;
                                    Taro.switchTab({url:'/pages/tabbar/order/order'});
                                }}>
                                    <IconFont name='24_daifahuo' size={48} color='#121314'/>
                                    <Text className='orderText'>待发货</Text>
                                </View>
                                <View className='oitem' onClick={() =>{
                                    Taro.getApp().tab = 3;
                                    Taro.switchTab({url:'/pages/tabbar/order/order'})
                                }}>
                                    <IconFont name='24_daishouhuo' size={48} color='#121314'/>
                                    <Text className='orderText'>待收货</Text>
                                </View>
                                <View className='oitem' onClick={() =>{
                                    Taro.getApp().tab = 4;
                                    Taro.switchTab({url:'/pages/tabbar/order/order'})
                                }}>
                                    <IconFont name='24_shouhou' size={48} color='#121314'/>
                                    <Text className='orderText'>售后</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View className='container'>
                        {
                            switchBarFixed ? <View className='switchBox' style={{border: 0}}/> : null
                        }
                        <View className='switchBox'
                              style={switchBarFixed ? `position: fixed;top:${topHeight}px;width:100%;transition: 0.2s all ease-out;z-index:999;background: #FFF;` : ""}>
                            <View className='switchBar'>
                                {
                                    ["作品", "收藏"].map((item, index) => (
                                        <View className={index == switchActive ? 'item active' : 'item'}
                                              key={index + ""} onClick={() => this.changeActive(index)}>
                                            <Text className='text'>{item}</Text>
                                            {index == switchActive ?
                                                <Image className='icon' src={switchBottom}/> : null}
                                        </View>
                                    ))
                                }
                            </View>
                            <Text className='total'>共{this.total}个</Text>
                        </View>
                        {
                            switchActive === 0
                                ? <View className='content'>
                                    {
                                        works.map((item) => (
                                            <View className='item' key={item.id}>
                                                {
                                                    moment.unix(item.create_time).year() == moment().year() ? null :
                                                        <View className='years'>
                                                            <Text className='text'>{moment.unix(item.create_time).year()}</Text>
                                                        </View>
                                                }
                                                <View className='dates'>
                                                    <View className='day'>
                                                        <View className='circle'>
                                                            <Text className='text'>{moment.unix(item.create_time).date()}</Text>
                                                        </View>
                                                    </View>
                                                    <Text className='date'>{moment.unix(item.create_time).format("MM月DD日")}</Text>
                                                    <View className="more">
                                                        <Popover popoverItem={process.env.TARO_ENV === "h5" ? [
                                                            // {
                                                            //     title: "保存到相册",
                                                            //     value: 1,
                                                            //     onClick: this.downloadImage,
                                                            //     customRender: <View className='sub-menu'>
                                                            //         <View className='list'>
                                                            //             <View className='item'>
                                                            //                 <IconFont name='24_baocundaoxiangce' size={40} color='#121314' />
                                                            //                 <Text className='item-text'>保存到相册</Text>
                                                            //             </View>
                                                            //         </View>
                                                            //     </View>
                                                            // },
                                                            {
                                                                title: "分享",
                                                                value: 2,
                                                                customRender: <View className='sub-menu'>
                                                                    <View className='list'>
                                                                        <View className='item'>
                                                                            <IconFont name='24_fenxiang' size={40} color='#121314' />
                                                                            <Text className='item-text'>分享</Text>
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                            },
                                                            {
                                                                title: "删除",
                                                                value: 3,
                                                                onClick: this.confirmDelete,
                                                                customRender: <View className='sub-menu'>
                                                                    <View className='list'>
                                                                        <View className='item'>
                                                                            <IconFont name='24_shanchu' size={40} color='#FF4966' />
                                                                            <Text className='item-text' style={{color: "#FF4966"}}>删除</Text>
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                            },
                                                        ] : this.popItemsWeapp}
                                                                 value={item}
                                                                 offsetBottom={30}>
                                                            <IconFont name='24_gengduo' size={48} color='#9C9DA6'/>
                                                        </Popover>
                                                    </View>
                                                </View>
                                                <View className='box' onClick={() => this.previewOrder(item)}>
                                                    <View className='cns'>
                                                        <Text className='neir'>{item.name}</Text>
                                                        <View className='docker'>
                                                            {item.order_sn ? <Text className='nook'>已打印</Text> : null}
                                                            <Image src={ossUrl(item.thumbnail, 1)} className='pic'
                                                                   mode="widthFix"
                                                                   style={{width: item.attr.width + "px"}} />
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        ))
                                    }
                                    {
                                        works.length === 0
                                            ? <Empty button="我要创作" onClick={() => {
                                                if (userStore.isLogin) {
                                                    if (deviceInfo.env == "h5") {
                                                        window.location.href = '/pages/tabbar/index/index';
                                                    } else {
                                                        Taro.switchTab({
                                                            url:'/pages/tabbar/index/index'
                                                        })
                                                    }
                                                } else {
                                                    userStore.showLoginModal = true;
                                                }
                                            }}/>
                                            : <View className="more_View">
                                                <LoadMore status={loadStatus} />
                                            </View>
                                    }
                                </View>
                                : <View className="collection_container">
                                    {
                                        collectionList.map((value: CollectiongProps, index) => (
                                            <View className="collection_item" key={index+""}
                                                  style={{
                                                      width: deviceInfo.windowWidth / 2 - 10 + "px"
                                                  }}
                                            >
                                                <View className="collection_pic"
                                                      style={{
                                                          width: deviceInfo.screenWidth / 2 - 15 + "px",
                                                          height: deviceInfo.screenWidth / 2 - 15 + "px",
                                                      }}
                                                >
                                                    <Image src={ossUrl(value.thumb_image, 1)} mode="aspectFill"
                                                           style={{
                                                               width: deviceInfo.screenWidth / 2 - 15 + "px",
                                                               height: deviceInfo.screenWidth / 2 - 15 + "px",
                                                           }}
                                                    />
                                                </View>
                                            </View>
                                        ))
                                    }
                                    {
                                        collectionList.length === 0
                                            ? <View className="more_View">
                                                <Empty content="暂无收藏"/>
                                            </View>
                                            : <View className="more_View">
                                                <LoadMore status={loadStatus} />
                                            </View>
                                    }
                                </View>
                        }
                    </View>
                </ScrollView>

            </View>
        )
    }
}
