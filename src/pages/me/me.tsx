import Taro, {Component, Config} from '@tarojs/taro'
import {Image, ScrollView, Text, View} from '@tarojs/components'
import './me.less'
import IconFont from '../../components/iconfont';
import {userStore} from "../../store/user";
import {inject, observer} from '@tarojs/mobx'
import Empty from "../../components/empty";
import {api} from '../../utils/net';
import {ListModel, ossUrl} from '../../utils/common';
import LoadMore, {LoadMoreEnum} from "../../components/listMore/loadMore";
import moment from "moment";
import Fragment from '../../components/Fragment';

const switchBottom = require("../../source/switchBottom.png");

interface MultiData {
    [key: number]: ListModel

}

@inject("userStore")
@observer
export default class Me extends Component<any, {
    switchActive: number;
    pageScrollShowTop: boolean;
    switchBarFixed: boolean;
    topHeight: number;
    data: MultiData;
    loadStatus: LoadMoreEnum
}> {
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
            data: null
        }
    }

    onTabItem = (item) => {
        console.log(item)
    }

    componentDidMount() {
        this.setState({
            loadStatus: LoadMoreEnum.loading
        })
        api("editor.user_tpl/index?token=a235dfdd-f21c-47b9-adea-8553d79aba67", {
            start: 0,
            size: 15
        }).then((res) => {
            console.log(res);
            this.setState({
                data: {
                    0: res
                },
                loadStatus: res.list.length == res.total ? LoadMoreEnum.noMore : LoadMoreEnum.more
            })
        }).catch((e) => {
            console.log(e);
        });
    }

    private scrollOnce = 0;
    onMeScroll = ({detail: {scrollTop}}) => {
        if (scrollTop > 5) {
            this.setState({
                pageScrollShowTop: true
            });
            if (this.scrollOnce == 0) {
                Taro.createSelectorQuery().selectAll(".top").boundingClientRect((top_rect) => {
                    this.scrollOnce += 1;
                    if (this.scrollOnce == 1) {
                        // @ts-ignore
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

    render() {
        const {switchActive, pageScrollShowTop, switchBarFixed, topHeight, data, loadStatus} = this.state;
        const {id, nickname, avatar} = userStore;
        const wlist = data && data[switchActive] && data[switchActive].list && switchActive == 0 && data[switchActive].list.length > 0 ? data[switchActive].list : [];
        const total = data && data[switchActive] && data[switchActive].total > 0 ? data[switchActive].total : 0;
        return (
            <View className='me'>
                <ScrollView scrollY onScroll={this.onMeScroll}
                            style={`height:${Taro.getSystemInfoSync().windowHeight}px`}>
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
                                              key={index + ""} onClick={() => {
                                            this.setState({switchActive: index})
                                        }}>
                                            <Text className='text'>{item}</Text>
                                            {index == switchActive ?
                                                <Image className='icon' src={switchBottom}/> : null}
                                        </View>
                                    ))
                                }
                            </View>
                            <Text className='total'>共{total}个</Text>
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
                                                        <Text
                                                            className='text'>{moment.unix(item.create_time).date()}</Text>
                                                    </View>
                                                </View>
                                                <Text
                                                    className='date'>{moment.unix(item.create_time).format("MM月DD日")}</Text>
                                                <View className='more' onClick={(e) => {
                                                    // @ts-ignore
                                                }}>
                                                    {/* <TaroPopover list={list} label='label' onTabItem={this.onTabItem}> */}
                                                    <IconFont name='24_gengduo' size={48} color='#9C9DA6'/>
                                                    {/* </TaroPopover> */}
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
