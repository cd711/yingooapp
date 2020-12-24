import Taro, {Component, Config} from '@tarojs/taro'
import {Image, ScrollView, Text, View} from '@tarojs/components'
import './detail.less';
import IconFont from '../../../../components/iconfont';
import {api} from '../../../../utils/net'
import {inject, observer} from '@tarojs/mobx';
import {deviceInfo, fixStatusBarHeight, jumpToEditor, notNull, ossUrl, urlDeCode} from '../../../../utils/common'

import LoginModal from '../../../../components/login/loginModal';
import {userStore} from '../../../../store/user';

@inject("templateStore", "userStore")
@observer

export default class Detail extends Component<{}, {
    isLike: boolean;
    likeList: Array<any>;
    currentItem: any;
    isOpened: boolean;
    scrollTop: number;
    centerPartyHeight: number
}> {

    config: Config = {
        navigationBarTitleText: '模板详情'
    }

    constructor(props) {
        super(props);
        this.state = {
            isLike: false,
            likeList: [],
            currentItem: {},
            isOpened: false,
            scrollTop: 0,
            centerPartyHeight: 530
        }
    }

    // private lastBottomTime = 0;

    componentDidMount() {
        // const {selectItem} = templateStore;
        // centerPartyHeight
        if (process.env.TARO_ENV != 'h5') {
            Taro.createSelectorQuery().select(".nav-bar").boundingClientRect((nav_rect) => {
                Taro.createSelectorQuery().select(".bottom_bar").boundingClientRect((bottom_rect) => {
                    this.setState({
                        centerPartyHeight: Taro.getSystemInfoSync().windowHeight - nav_rect.height - bottom_rect.height
                    });
                }).exec();
            }).exec();
        }

        if (process.env.TARO_ENV === 'h5') {
            const url = window.location.href;
            window.history.pushState(null, null, '/pages/order/pages/template/index');
            window.history.pushState(null, '模板详情', url);
        }
        const {id, cid} = this.$router.params
        console.log(id, cid)
        if (!id || !cid) {
            Taro.navigateBack();
        }
        if (parseInt(id) > 0) {
            this.getCurrentItem(id);
        }
        // this.lastBottomTime = moment().unix();

    }

    getCurrentItem(id) {
        Taro.showLoading({title: "加载中..."});
        api('app.product_tpl/info', {id}).then((res) => {
            if (this.$router.params.id != res.id && process.env.TARO_ENV === 'h5') {
                // window.history.replaceState(null, null, `/pages/order/pages/template/detail?id=${res.id}&cid=${this.$router.params.cid}`)
            }
            this.setState({
                currentItem: res,
                isLike: res.favorite !== 0
            });
            this.getLikeList(res.category_id);
        }).catch((e) => {
            Taro.hideLoading();
            Taro.showToast({
                title: e,
                icon: 'none',
                duration: 2000
            })
            setTimeout(() => {
                Taro.navigateBack();
            }, 2000);
        })
    }

    getLikeList = (id) => {
        api("app.product_tpl/like", {
            size: 20,
            start: 0,
            category_id: id
        }).then((res) => {
            Taro.hideLoading();
            this.setState({
                likeList: res
            })
        }).catch((e) => {
            Taro.showToast({
                title: e,
                icon: 'none',
                duration: 2000
            })
        })
    }

    // onPageScroll(){
    //     const query = Taro.createSelectorQuery;
    //     query().select(".taro-tabbar__panel").fields({
    //         scrollOffset: true,
    //     },(e)=>{
    //         const scrollHeight = e.scrollHeight;
    //         const scrollTop = e.scrollTop;
    //         const clientHeight = Taro.getSystemInfoSync().windowHeight;
    //         const distance = 300;  //距离视窗还用50的时候，开始触发；
    //         const nowUnixTime = moment().unix();
    //         if ((scrollTop + clientHeight) >= (scrollHeight - distance) && nowUnixTime - this.lastBottomTime>2) {
    //             this.lastBottomTime = nowUnixTime;
    //             console.log("触及底线了...");
    //         }
    //     }).exec();
    // }

    onEditor = () => {
        if (userStore.isLogin) {
            const {currentItem} = this.state;
            jumpToEditor({
                tpl_id: currentItem.id,
                cid: currentItem.category_id
            })
        } else {
            userStore.showLoginModal = true;
        }
    }

    collectedProd = async () => {
        const {isLike, currentItem} = this.state;
        try {
            await api("app.profile/favorite", {
                id: currentItem.id,
                model: "tpl_product",
                status: isLike ? 0 : 1
            })
            Taro.showToast({
                title: `${isLike ? "取消收藏成功" : "收藏成功"}`
            })
            this.setState({isLike: !isLike})
        } catch (e) {
            console.log(`${isLike ? "取消收藏失败" : "收藏失败"}：`, e)
        }
    }

    goBack = () => {
        console.log(Taro.getCurrentPages())
        const status = !notNull(this.$router.params.cp);
        const {cp}: any = urlDeCode(this.$router.params);
        if (status) {
            Taro.redirectTo({
                url: cp
            })
        } else {
            Taro.navigateBack()
        }
    }

    render() {
        const {isLike, likeList, currentItem, scrollTop, centerPartyHeight} = this.state;
        // @ts-ignore
        return (
            <View className='detail'>
                {/* @ts-ignore */}
                <View className='nav-bar' style={fixStatusBarHeight()}>
                    <View className='left' onClick={this.goBack}>
                        <IconFont name='24_shangyiye' size={48} color='#121314'/>
                    </View>
                    <View className='center'>
                        {!notNull(currentItem.id) ? <Text className='title'>{`ID:${currentItem.id}`}</Text> : null}
                    </View>
                </View>
                <LoginModal/>
                <ScrollView scrollY className='detail_page_scroll' scrollTop={scrollTop}
                            onScroll={({detail: {scrollTop}}) => {
                                this.setState({
                                    scrollTop: deviceInfo.env == "weapp" ? -1 : scrollTop
                                })
                            }} style={process.env.TARO_ENV === 'h5' ? "" : `height:${centerPartyHeight}px`}>
                    <View className='shell_thumb' style={`height:${Taro.pxTransform(472 / (795 / 1635))}`}>
                        <Image src={ossUrl(currentItem.thumb_image, 1)} className='thumb' mode='aspectFill'
                               style={`height:${Taro.pxTransform(472 / (795 / 1635))}`}/>
                        <Image src={require('../../../../source/ke.png')} className='shell' mode='scaleToFill'
                               style={`height:${Taro.pxTransform(472 / (795 / 1635))}`}/>
                    </View>
                    <View className='doyoulike'>
                        <View className='opsline'/>
                        <Text className='liketxt'>猜你喜欢</Text>
                        <View className='like-list'>
                            {
                                likeList && likeList.map((item) => (
                                    <View className='item' onClick={() => {
                                        this.getCurrentItem(item.id);
                                        this.setState({
                                            scrollTop: 0
                                        })
                                    }} key={item.id}>
                                        <Image src={ossUrl(item.thumb_image, 1)} className='image' mode='aspectFill'/>
                                    </View>
                                ))
                            }
                        </View>
                    </View>
                </ScrollView>
                <View className='bottom_bar'>
                    <View className='favorite' onClick={this.collectedProd}>
                        <IconFont name={isLike ? '24_shoucangB' : '24_shoucangA'} size={48}
                                  color={isLike ? '#FFAF39' : '#707177'}/>
                        <Text className='txt'>收藏</Text>
                    </View>
                    <View className='now-editor' onClick={this.onEditor}>
                        <Text className='txt'>立即编辑</Text>
                    </View>
                </View>

            </View>
        )
    }
}
