import Taro, {Component, Config} from '@tarojs/taro'
import {Image, ScrollView, Text, View} from '@tarojs/components'
import './me.less'
import IconFont from '../../components/iconfont';
import {userStore} from "../../store/user";
import {inject, observer} from '@tarojs/mobx'
import Popover, {PopoverItemClickProps, PopoverItemProps} from "../../components/popover";
import {api} from "../../utils/net";
import moment from "moment";
import {getImageSize, ossUrl} from "../../utils/common";
import Empty from "../../components/empty";
import LoadMore, {LoadMoreEnum} from "../../components/listMore/loadMore";
import {AtModal} from "taro-ui";

const switchBottom = require("../../source/switchBottom.png");

interface WorksProps {
    id: number,
    name: string,
    thumbnail: string,
    create_time: number,
    order_sn?: any,
    attr: {width: number, height: number}
}
interface MeProps {
    switchActive: number;
    works: Array<WorksProps>;
    fixed: boolean;
    loadStatus: LoadMoreEnum;
    isOpened: boolean
}

@inject("userStore")
@observer
export default class Me extends Component<any, MeProps> {

    config: Config = {
        navigationBarTitleText: '我的'
    }

    constructor(props) {
        super(props);
        this.state = {
            switchActive: 0,
            works: [],
            fixed: false,
            loadStatus: LoadMoreEnum.more,
            isOpened: false
        }
    }

    private total: number = 0;
    private isLoading: number = 0;
    async getWorksList(data:{start?: number, size?: number, loadMore?: boolean}) {
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

            this.setState({works}, () => {
                this.isLoading = 0
            })
        }catch (e) {
            console.log("获取作品出错：", e)
            this.isLoading = 0
        }
    }

    componentDidMount() {
        this.getWorksList({start: 0})
    }

    onTabItem = (item) => {
        console.log(item)
    }

    onScroll = (e) => {
        const {fixed} = this.state;
        // 260 筛选菜单固定
        const top = e.detail.scrollTop;
        if (top > 260) {
            if (!fixed) {
                this.setState({fixed: true})
            }
        } else {
            if (fixed) {
                this.setState({fixed: false})
            }
        }
    }

    lodeMore = () => {
        const { works } = this.state;
        console.log("加载更多", this.isLoading, this.total, works.length)

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
    }

    private deleteId: any = null;
    confirmDelete = async (data: PopoverItemClickProps) => {
        console.log(data.corrValue)
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

    private popItems: Array<PopoverItemProps> = [
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
    ]

    getDateString = (item: WorksProps) => {
        const isCurrentYear = moment().isAfter(moment.unix(item.create_time));
        if (isCurrentYear) {
            return moment.unix(item.create_time).format("MM月DD日")
        }
        return moment.unix(item.create_time).format("YYYY年MM月DD日")
    }

    render() {
        const {switchActive, works, fixed, loadStatus, isOpened} = this.state;
        const {id, nickname, avatar} = userStore;
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
                <ScrollView scrollY className="content_scroll" style={{height: window.screen.height - 50}} onScrollToLower={this.lodeMore} onScroll={this.onScroll}>
                    <View className='topBox'>
                        <View className="fix_top">
                            <View className={`top ${fixed ? "fiex_set" : ""}`}>
                                {/* <IconFont name={"iconsaoyisao"} size={48} color="#121314"/> */}
                                <View className='ops'>
                                    <View className='cart'  onClick={()=>{
                                        Taro.navigateTo({
                                            url:'/pages/cart/index'
                                        })
                                    }}><IconFont name='24_gouwuche' size={48} color='#121314'/></View>
                                    <View className='coupon'><IconFont name='24_youhuiquan' size={48} color='#121314'/></View>
                                    <View className='set' onClick={() => {
                                        Taro.navigateTo({
                                            url: '/pages/me/setting'
                                        })
                                    }}><IconFont name='24_shezhi' size={48} color='#121314'/></View>
                                </View>
                            </View>
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
                        <View className="fixed_switch_bar">
                            <View className={`switchBox ${fixed ? "fiex_switch" : ""}`}>
                                <View className='switchBar'>
                                    {
                                        ["作品", "收藏"].map((item, index) => (
                                            <View className={index == switchActive ? 'item active' : 'item'} key={index + ""}
                                                  onClick={() => {
                                                      this.setState({switchActive: index})
                                                  }}>
                                                <Text className='text'>{item}</Text>
                                                {index == switchActive ? <Image className='icon' src={switchBottom}/> : null}
                                            </View>
                                        ))
                                    }
                                </View>
                                <Text className='total'>共{this.total}个</Text>
                            </View>
                        </View>
                        <View className='content'>
                            {
                                works.map((value, index) => (
                                    <View className='item' key={index}>
                                        <View className='dates'>
                                            <View className='day'>
                                                <View className='circle'>
                                                    <Text className='text'>{moment.unix(value.create_time).date()}</Text>
                                                </View>
                                            </View>
                                            <Text className='date'>{this.getDateString(value)}</Text>
                                            <Popover className="more" popoverItem={this.popItems} offsetBottom={30} value={value}>
                                                <IconFont name='24_gengduo' size={48} color='#9C9DA6'/>
                                            </Popover>
                                        </View>
                                        <View className='box'>
                                            <View className='cns'>
                                                <Text className='neir'>{value.name}</Text>
                                                <View className='docker'>
                                                    {value.order_sn ? <Text className='nook'>已打印</Text> : null}
                                                    <Image src={ossUrl(value.thumbnail, 1)} className='pic'
                                                           mode="widthFix"
                                                           style={{width: value.attr.width}} />
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ))
                            }
                            {
                                works.length === 0
                                    ? <Empty/>
                                    : null
                            }

                            {/*<View className='years'>*/}
                            {/*    <Text className='text'>2019</Text>*/}
                            {/*</View>*/}
                        </View>
                    </View>
                    <LoadMore status={loadStatus} />
                </ScrollView>
            </View>
        )
    }
}
