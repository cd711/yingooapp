import {ComponentType} from 'react'
import Taro, {Component, Config} from '@tarojs/taro'
import {Button, Image, ScrollView, Swiper, SwiperItem, Text, View} from '@tarojs/components'
import {inject, observer} from '@tarojs/mobx'
import './index.less'
import IconFont from '../../../components/iconfont'
import {api} from "../../../utils/net";
import {deviceInfo, ossUrl} from "../../../utils/common";
import Fragment from "../../../components/Fragment";
import ImageSwiper from "./ImageSwiper";


interface IndexState {
    data: any;
    centerPartyHeight: number;
    banners: []
}

@inject("userStore")
@observer
class Index extends Component<any, IndexState> {

    config: Config = {
        navigationBarTitleText: '发现'
    }


    constructor(props) {
        super(props);
        this.state = {
            data: [],
            centerPartyHeight: 500,
            banners: []
        }
    }

    private total: number = 0;
    getIndexList = async (data: { start?: number, size?: number, loadMore?: boolean } = {}) => {
        const opt = {
            start: data.start || 0,
            size: data.size || 15,
            loadMore: data.loadMore || false
        };

        try {
            const res = await api("app.index/h5", {
                start: opt.start,
                size: opt.size
            });
            this.total = parseInt(res.total);
            let arr = [];
            if (opt.loadMore) {
                arr = this.state.data.concat(res.list || []);
            } else {
                arr = res.list || [];
            }
            this.setState({data: arr})
        } catch (e) {
            console.log("首页获取列表出错：", e)
        }

    }

    componentDidMount() {
        if (process.env.TARO_ENV != 'h5') {
            Taro.createSelectorQuery().select(".nav-bar").boundingClientRect((nav_rect) => {
                Taro.createSelectorQuery().select(".top-search").boundingClientRect((top_rect) => {
                    this.setState({
                        centerPartyHeight: Taro.getSystemInfoSync().windowHeight - nav_rect.height - top_rect.height
                    });
                }).exec();
            }).exec();
        }
        this.getIndexList();

        // 获取首页banner
        api("app.index/banner", {size: 10}).then(res => {
            this.setState({banners: res || []})
        }).catch(e => {
            console.log("首页banner获取失败：", e)
        })
    }

    onItemClick = (item, parentIdx) => {
        console.log(item, parentIdx)
        if (item.info.jump_url) {
            Taro.navigateTo({url: item.info.jump_url});
            return
        }
        Taro.navigateTo({
            url: `/pages/template/detail?id=${item.info.id}&cid=${item.info.category.id}`
        })
    }

    viewMoreSpecial = (item) => {
        if (item.more_url) {
            Taro.navigateTo({url: item.more_url})
        } else {
            Taro.navigateTo({url: `/pages/home/pages/special?specialid=${item.id}`})
        }
    }

    onCustomized = (item, _) => {
        if (item.info.jump_url) {
            Taro.navigateTo({url: item.info.jump_url});
            return
        }
    }

    loadMore = () => {
        const {data} = this.state;
        if (this.total === data.length || this.total < 15) {
            return
        }
        this.getIndexList({
            start: data.length,
            loadMore: true
        })
    }

    receiveCoupon = async item => {
        Taro.showLoading({title: "请稍后..."})
        try {
            await api("app.coupon/add", {id: item.info.id});
            Taro.hideLoading()
            Taro.showToast({
                title: '领取成功',
                icon: "none"
            })
        } catch (e) {
            Taro.hideLoading()
            Taro.showToast({
                title: e,
                icon: "none"
            })
        }
    }

    render() {
        const {data, centerPartyHeight, banners} = this.state;
        return (
            <View className='index'>
                {
                    process.env.TARO_ENV === 'h5'
                        ? null
                        : <View className='nav-bar' style={`padding-top:${deviceInfo.statusBarHeight}px;`}>
                            <View className='center'>
                                <Text className='title'>{this.config.navigationBarTitleText}</Text>
                            </View>
                        </View>
                }
                <View className='top-search'>
                    <View className='search-box' onClick={() => Taro.navigateTo({url: "/pages/search/index"})}>
                        <IconFont name='20_sousuo' size={40} color='#9C9DA6'/>
                        <Text className='placeholders'>搜索海量模板</Text>
                    </View>
                </View>
                <ScrollView scrollY
                            style={process.env.TARO_ENV === 'h5' ? {height: deviceInfo.windowHeight - 102} : `height:${centerPartyHeight}px`}
                            onScrollToLower={this.loadMore}>
                    <View className='inde_page_container'>
                        {
                            banners.length > 0
                                ? <View className="index_banner_container">
                                    <Swiper
                                        className='index_banner_swiper'
                                        indicatorColor='#00000050'
                                        indicatorActiveColor='#fff'
                                        circular
                                        interval={3000}
                                        indicatorDots autoplay>
                                        {
                                            banners.map((value: any, index) => (
                                                <SwiperItem key={index}>
                                                    <View className='index_banner_swiper_item'>
                                                        <Image src={value.image} className="index_banner_swiper_item_img" />
                                                    </View>
                                                </SwiperItem>
                                            ))
                                        }
                                    </Swiper>
                                </View>
                                : null
                        }
                        <View className="index_fast_link_view">
                            <View className="read_fast_link">
                                <Image src={require("../../../source/il.svg")} className="fast_img" />
                                <View className="info">
                                    <Text className="h2">当面冲印照片</Text>
                                    <Text className="txt">高清冲印照片</Text>
                                </View>
                            </View>
                            <View className="read_fast_link">
                                <Image src={require("../../../source/cnxh.svg")} className="fast_img" />
                                <View className="info">
                                    <Text className="h2">当面冲印文档</Text>
                                    <Text className="txt">极速打印文档</Text>
                                </View>
                            </View>
                        </View>
                        <View className="index_fast_link_view">
                            <View className="fast_order_link">
                                <Image src={require("../../../source/pz.svg")} className="fast_img" />
                                <Text className="h2">照片冲印</Text>
                                <Text className="info">高清盐印冲印</Text>
                            </View>
                            <View className="fast_order_link">
                                <Image src={require("../../../source/az.svg")} className="fast_img" />
                                <Text className="h2">照片冲印</Text>
                                <Text className="info">高清盐印冲印</Text>
                            </View>
                            <View className="fast_order_link">
                                <Image src={require("../../../source/iall.svg")} className="fast_img" />
                                <Text className="h2">手机壳定制</Text>
                                <Text className="info">多种精美模板</Text>
                            </View>
                        </View>
                        {
                            data.map((item, index) => {
                                let list = item.clist;
                                const len = list.length;
                                if (item.model === "tpl_product") {
                                    list = item.clist.length > 6 ? item.clist.slice(1, 7) : item.clist
                                }
                                return <Fragment>
                                    {
                                        item.model === "product"
                                            ? item.clist.map((product, prodIndex) => {
                                                return product.info.jump_url &&
                                                    <View className='product-item' key={prodIndex + ""}>
                                                        <Image src={ossUrl(product.thumb_image, 1)} className='image'
                                                               mode='aspectFill'/>
                                                        <View className='bottom'>
                                                            <View className='left'>
                                                                <Text className='title'>{product.title || " "}</Text>
                                                                {product.subtitle ? <Text
                                                                    className='subtitle'>{product.subtitle}</Text> : null}
                                                            </View>
                                                            <View className='right-btn'
                                                                  onClick={() => this.onCustomized(product, index)}>
                                                                <Text className='txt'>我要定制</Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                })
                                            : null
                                    }
                                    {
                                        item.model === "tpl_product"
                                            ? <Fragment>
                                                {
                                                    item.clist.length == 1
                                                        ? <View className='temp-warp' key={index + ""}>
                                                            <View className='masks'>
                                                                <View className='title'>
                                                                    <Text className='txt'>{item.title}</Text>
                                                                    {item.subtitle ? <Text
                                                                        className='sub-title'>{item.subtitle}</Text> : null}
                                                                </View>
                                                                <View className='swiper-back'
                                                                      onClick={() => this.onItemClick(item.clist[0], index)}>
                                                                    <View className='temp-swiper'>
                                                                        <Image src={ossUrl(item.clist[0].thumb_image, 1)}
                                                                               className='photo' mode='aspectFill'/>
                                                                    </View>
                                                                </View>
                                                                <Button className='now-design-btn'
                                                                        onClick={() => this.onItemClick(item.clist[0], index)}>立即设计</Button>
                                                            </View>
                                                        </View>
                                                        : null
                                                }
                                                {
                                                    item.clist.length > 1 && item.clist.length < 6
                                                        ? <ImageSwiper key={index + ""}
                                                                     item={item}
                                                                     parent={this.$scope}
                                                                     onItemClick={current => this.onItemClick(current, index)}/>
                                                        : null
                                                }
                                                {
                                                    item.clist.length > 6
                                                        ? <View className='temp-warp' key={index + ""}>
                                                            <View className='title'>
                                                                <Text className='txt'>{item.title}</Text>
                                                                {item.subtitle ? <Text className='sub-title'>{item.subtitle}</Text> : null}
                                                            </View>
                                                            <View className='grid'>
                                                                {
                                                                    list.map((child, cIdx) => {
                                                                        return <View className='photo-warp' key={`tel_${cIdx}`}
                                                                                     onClick={() => this.onItemClick(child, index)}>
                                                                            <Image src={ossUrl(child.thumb_image, 1)}
                                                                                   className='photo' mode='aspectFill'/>
                                                                        </View>
                                                                    })
                                                                }
                                                            </View>
                                                            {
                                                                item.clist.length > 6
                                                                    ? <View className='seemore'
                                                                            onClick={() => this.viewMoreSpecial(item)}>
                                                                        <Text className='txt'>查看更多</Text>
                                                                        <IconFont name='20_xiayiye' size={40} color='#9C9DA6'/>
                                                                    </View>
                                                                    : null
                                                            }
                                                        </View>
                                                        : null
                                                }
                                            </Fragment>
                                            : null
                                    }
                                    {
                                        item.model === "coupon"
                                            ? item.clist.map((coupon, cIndex) => (
                                                <View className="index_coupon_main" key={`${index}_${cIndex}`}
                                                      onClick={() => this.receiveCoupon(coupon)}>
                                                    <Image src={ossUrl(coupon.thumb_image, 1)} className="coupon_img"/>
                                                    <View className="receive_btn">
                                                        <View className="anim_btn_receive">
                                                            <Text className="txt">立即领取</Text>
                                                            <View className="icon"><IconFont name="16_xiayiye" color="#fff" size={32}/></View>
                                                        </View>
                                                    </View>
                                                </View>
                                            ))
                                            : null
                                    }
                                </Fragment>
                            })
                        }
                    </View>
                </ScrollView>
            </View>
        )
    }
}

export default Index as ComponentType
