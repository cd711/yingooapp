import Taro, {Component, Config} from '@tarojs/taro'
import {Image, ScrollView, Text, View} from '@tarojs/components'
import './me.less'
import IconFont from '../../components/iconfont';
import {userStore} from "../../store/user";
import {inject, observer} from '@tarojs/mobx'
import Empty from "../../components/empty";
import {api} from '../../utils/net';
import {getImageSize, ListModel, notNull, ossUrl} from '../../utils/common';
import LoadMore, {LoadMoreEnum} from "../../components/listMore/loadMore";
import moment from "moment";
import Fragment from '../../components/Fragment';
import Popover from "../../components/popover";

const switchBottom = require("../../source/switchBottom.png");

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
    collectionList: Array<any>;
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

    onTabItem = (item) => {
        console.log(item)
    }

    componentDidMount() {
        if (userStore.id) {
            this.getWorksList({start: 0})
        }
        // this.setState({
        //     loadStatus: LoadMoreEnum.loading
        // })
        // api("editor.user_tpl/index", {
        //     start: 0,
        //     size: 15
        // }).then((res) => {
        //     console.log(res);
        //     this.setState({
        //         data: {
        //             0: res
        //         },
        //         loadStatus: res.list.length == res.total ? LoadMoreEnum.noMore : LoadMoreEnum.more
        //     })
        // }).catch((e) => {
        //     console.log(e);
        // });
    }

    // 监听滚动
    private scrollOnce = 0;
    onMeScroll = ({detail: {scrollTop}}) => {
        if (scrollTop > 5) {
            this.setState({pageScrollShowTop: true});
            if (this.scrollOnce == 0) {
                Taro.createSelectorQuery().selectAll(".top").boundingClientRect((top_rect: any) => {
                    this.scrollOnce += 1;
                    if (this.scrollOnce == 1) {
                        top_rect.forEach((l_rect) => {
                            if (l_rect.height > 0) {
                                this.setState({
                                    topHeight: l_rect.height + Taro.getSystemInfoSync().statusBarHeight
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

    private popItems: Array<any> = [
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
        // {
        //     title: "分享",
        //     value: 2,
        //     customRender: <View className='sub-menu'>
        //         <View className='list'>
        //             <View className='item'>
        //                 <IconFont name='24_fenxiang' size={40} color='#121314' />
        //                 <Text className='item-text'>分享</Text>
        //             </View>
        //         </View>
        //     </View>
        // },
        // {
        //     title: "删除",
        //     value: 3,
        //     onClick: () => {},
        //     customRender: <View className='sub-menu'>
        //         <View className='list'>
        //             <View className='item'>
        //                 <IconFont name='24_shanchu' size={40} color='#FF4966' />
        //                 <Text className='item-text' style={{color: "#FF4966"}}>删除</Text>
        //             </View>
        //         </View>
        //     </View>
        // },
    ]

    render() {
        const {switchActive, pageScrollShowTop, switchBarFixed, topHeight, data, loadStatus, works, collectionList} = this.state;
        const {id, nickname, avatar} = userStore;
        // const wlist = data && data[switchActive] && data[switchActive].list && switchActive == 0 && data[switchActive].list.length > 0 ? data[switchActive].list : [];
        const wlist = switchActive == 0 ? works : collectionList;
        // const total = data && data[switchActive] && data[switchActive].total > 0 ? data[switchActive].total : 0;
        return (
            <View className='me'>
                <ScrollView scrollY onScroll={this.onMeScroll}
                            className="me_content_scroll"
                            enable-flex="true"
                            style={`height:${Taro.getSystemInfoSync().windowHeight}px`}
                            onScrollToLower={this.lodeMore}
                >
                    <View className='topBox'
                          style={process.env.TARO_ENV === 'h5' ? '' : `padding-top:${Taro.getSystemInfoSync().statusBarHeight}px;`}>
                        {
                            pageScrollShowTop ? <View className='top_weapp'></View> : null
                        }
                        <View className={process.env.TARO_ENV === 'h5' ? 'top' : 'top top_weapp'}
                              style={pageScrollShowTop ? `position: fixed;top:0;width:100%;background:#FFF;padding-top:${Taro.getSystemInfoSync().statusBarHeight}px;transition: 0.3s all ease-out;z-index:999` : ""}>
                            {
                                process.env.TARO_ENV === 'h5' ? <View className='ops'>
                                    <View className='cart'><IconFont name='24_gouwuche' size={48}
                                                                     color='#121314'/></View>
                                    <View className='coupon'><IconFont name='24_youhuiquan' size={48} color='#121314'/></View>
                                    <View className='set' onClick={() => {
                                        Taro.navigateTo({
                                            url: '/pages/me/setting'
                                        })
                                    }}><IconFont name='24_shezhi' size={48} color='#121314'/></View>
                                </View> : <View className='ops'>
                                    <View className='set' onClick={() => {
                                        Taro.navigateTo({
                                            url: '/pages/me/setting'
                                        })
                                    }}><IconFont name='24_shezhi' size={48} color='#121314'/></View>
                                    <View className='cart'><IconFont name='24_gouwuche' size={48}
                                                                     color='#121314'/></View>
                                    <View className='coupon'><IconFont name='24_youhuiquan' size={48} color='#121314'/></View>
                                </View>
                            }

                        </View>
                        <View className='baseInfo' onClick={() => {
                            if (id > 0) {
                                return;
                            }
                            Taro.redirectTo({
                                url: '/pages/login/index'
                            })
                        }}>
                            <View className='avator'>
                                <Image src={avatar.length > 0 ? avatar : require('../../source/defaultAvatar.png')}
                                       className='avatarImg'/>
                            </View>
                            {/* todo: 昵称6个字 */}
                            <Text className='nickname'>{nickname.length > 0 ? `Hi，${nickname}` : "Hi，未登录"}</Text>
                        </View>
                        <View className='orderWarp'>
                            <View className='myorall'>
                                <Text className='myorder'>我的订单</Text>
                                <View className='allorder' onClick={() => {
                                    Taro.navigateTo({
                                        url: '/pages/me/order'
                                    })
                                }}>
                                    <Text>全部订单</Text>
                                    <IconFont name='16_xiayiye' size={36} color='#9C9DA6'/>
                                </View>
                            </View>
                            <View className='orderstate'>
                                <View className='oitem' onClick={() => {
                                    Taro.navigateTo({
                                        url: '/pages/me/order?switch=1'
                                    })
                                }}>
                                    <IconFont name='24_daifukuan' size={48} color='#121314'/>
                                    <Text className='orderText'>待付款</Text>
                                </View>
                                <View className='oitem' onClick={() => {
                                    Taro.navigateTo({
                                        url: '/pages/me/order?switch=2'
                                    })
                                }}>
                                    <IconFont name='24_daifahuo' size={48} color='#121314'/>
                                    <Text className='orderText'>待发货</Text>
                                </View>
                                <View className='oitem' onClick={() => {
                                    Taro.navigateTo({
                                        url: '/pages/me/order?switch=3'
                                    })
                                }}>
                                    <IconFont name='24_daishouhuo' size={48} color='#121314'/>
                                    <Text className='orderText'>待收货</Text>
                                </View>
                                <View className='oitem'>
                                    <IconFont name='24_shouhou' size={48} color='#121314'/>
                                    <Text className='orderText'>售后</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View className='container'>
                        {
                            switchBarFixed ? <View className='switchBox' style={{border: 0}}></View> : null
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
                        <View className='content'>
                            {
                                wlist.length > 0 ? wlist.map((item) => (
                                    <Fragment key={item.id}>
                                        {
                                            moment.unix(item.create_time).year() == moment().year() ? null :
                                                <View className='years'>
                                                    <Text className='text'>{moment.unix(item.create_time).year()}</Text>
                                                </View>
                                        }
                                        <View className='item'>
                                            <View className='dates'>
                                                <View className='day'>
                                                    <View className='circle'>
                                                        <Text className='text'>{moment.unix(item.create_time).date()}</Text>
                                                    </View>
                                                </View>
                                                <Text className='date'>{moment.unix(item.create_time).format("MM月DD日")}</Text>
                                                <View className="more">
                                                    <Popover popoverItem={[]} offsetBottom={30}>
                                                        <IconFont name='24_gengduo' size={48} color='#9C9DA6'/>
                                                    </Popover>
                                                </View>
                                            </View>
                                            <View className='box'>
                                                <View className='cns'>
                                                    <Text className='neir'>{item.name}</Text>
                                                    <View className='docker'>
                                                        {/* <Text className='nook'>已打印</Text> */}
                                                        <Image src={ossUrl(item.thumbnail, 1)} className='pic'
                                                               mode='widthFix' style='width:190px;height:100%'/>
                                                    </View>

                                                </View>
                                            </View>
                                        </View>
                                    </Fragment>

                                )) : null
                            }
                        </View>
                        {
                            (wlist.length == 0) && loadStatus != LoadMoreEnum.loading ? (switchActive == 0 ?
                                <Empty button="我要创作" onClick={() => {
                                    Taro.navigateTo({
                                        url: "pages/template/index"
                                    })
                                }}/> : <View className="more_View">
                                    <Empty content="暂无收藏"/>
                                </View>) : <LoadMore status={loadStatus}/>
                        }
                    </View>
                </ScrollView>
            </View>
        )
    }
}
