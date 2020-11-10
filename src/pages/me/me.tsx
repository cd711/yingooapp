import Taro, {Component, Config} from '@tarojs/taro'
import {Image, Text, View} from '@tarojs/components'
import './me.less'
import IconFont from '../../components/iconfont';
import {userStore} from "../../store/user";
import {inject, observer} from '@tarojs/mobx'
import Popover from "../../components/popover";
import {api} from "../../utils/net";
import moment from "moment";
import {ossUrl} from "../../utils/common";

const switchBottom = require("../../source/switchBottom.png");

interface MeProps {
    switchActive: number;
    works: Array<{id: number, name: string, thumbnail: string, create_time: number, order_sn?: any}>
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
            works: []
        }
    }

    private total: number = 0;
    async getWorksList(data:{start?: number, size?: number, loadMore?: boolean}) {
        const opt = {
            start: data.start || 0,
            size: data.size || 15,
            loadMore: data.size || false
        }
        try {
            const res = await api("editor.user_tpl/index", {
                page: opt.start,
                size: opt.size,
            });
            this.total = Number(res.total);
            let works: any[] = [];
            if (opt.loadMore) {
                works = [...res.list, this.state.works]
            } else {
                works = [...res.list]
            }

            this.setState({works})
        }catch (e) {
            console.log("获取作品出错：", e)
        }
    }

    componentDidMount() {
        this.getWorksList({start: 0})
    }

    onTabItem = (item) => {
        console.log(item)
    }

    private popItems = [
        {
            title: "保存到相册",
            value: 1,
            customRender: <View className='sub-menu'>
                <View className='list'>
                    <View className='item'>
                        <IconFont name='24_baocundaoxiangce' size={40} color='#121314' />
                        <Text className='item-text'>保存到相册</Text>
                    </View>
                </View>
            </View>
        },
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
            customRender: <View className='sub-menu'>
                <View className='list'>
                    <View className='item'>
                        <IconFont name='24_shanchu' size={40} color='#FF4966' />
                        <Text className='item-text'>删除</Text>
                    </View>
                </View>
            </View>
        },
    ]

    render() {
        const {switchActive, works} = this.state;
        const {id, nickname, avatar} = userStore;
        return (
            <View className='me'>
                <View className='topBox'>
                    <View className='top'>
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
                    <View className='switchBox'>
                        <View className='switchBar'>
                            {
                                ["作品", "喜欢", "收藏"].map((item, index) => (
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
                        <Text className='total'>共18个</Text>

                    </View>
                    <View className='content'>
                        {
                            works.map((value, index) => (
                                <View className='item' key={index}>
                                    <View className='dates'>
                                        <View className='day'>
                                            <View className='circle'>
                                                <Text className='text'>{moment(value.create_time).date()}</Text>
                                            </View>
                                        </View>
                                        <Text className='date'>{moment(value.create_time).format("MM月DD日")}</Text>

                                        <Popover className="more" popoverItem={this.popItems} offsetBottom={30}
                                                 onChange={v => console.log(v)}>
                                            <IconFont name='24_gengduo' size={48} color='#9C9DA6'/>
                                        </Popover>
                                    </View>
                                    <View className='box'>
                                        <View className='cns'>
                                            <Text className='neir'>{value.name}</Text>
                                            <View className='docker'>
                                                {value.order_sn ? <Text className='nook'>已打印</Text> : null}
                                                <Image src={ossUrl(value.thumbnail, 1)} className='pic'/>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))
                        }

                        {/*<View className='years'>*/}
                        {/*    <Text className='text'>2019</Text>*/}
                        {/*</View>*/}
                    </View>
                </View>
            </View>
        )
    }
}
