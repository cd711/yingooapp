import {ComponentType} from 'react'
import Taro, {Component, Config} from '@tarojs/taro'
import {Button, Image, ScrollView, Swiper, SwiperItem, Text, View} from '@tarojs/components'
import {inject, observer} from '@tarojs/mobx'
import './index.less'
import IconFont from '../../../components/iconfont'
import {api} from "../../../utils/net";
import {deviceInfo, getEvenArr, getURLParamsStr, notNull, ossUrl, urlEncode} from "../../../utils/common";
import Fragment from "../../../components/Fragment";
import Uncultivated from "../../../components/uncultivated";
import PhotoSwiper from "./photoSwiper";
import PhoneSwiper from "./phoneSwiper";


interface IndexState {
    data: any;
    centerPartyHeight: number;
    banners: [];
    showUnc: boolean;
    cateInfo: any[]
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
            banners: [],
            showUnc: false,
            cateInfo: []
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
            Taro.createSelectorQuery().select(".top-search").boundingClientRect((top_rect) => {
                this.setState({
                    centerPartyHeight: deviceInfo.windowHeight - top_rect.height
                });
            }).exec();
        }
        this.getIndexList();

        // 获取首页banner
        api("app.index/banner", {size: 10}).then(res => {
            this.setState({banners: res || []})
        }).catch(e => {
            console.log("首页banner获取失败：", e)
        })

        api("app.product/cate").then(res => {
            this.setState({cateInfo: [...res]})
        }).catch(_ => {

        })
    }

    onItemClick = (item, _) => {
        console.log(item)
        if (item.info.jump_url) {
            Taro.navigateTo({url: item.info.jump_url});
            return
        }
        if (item.info.category.type === "photo") {
            const str = getURLParamsStr(urlEncode({
                id: 34,
                tplid: item.info.id,
            }))
            Taro.navigateTo({
                url: `/pages/editor/pages/printing/index?${str}`
            });
        } else if (item.info.category.type === "phone") {
            const str = getURLParamsStr(urlEncode({
                id: item.info.id,
                cid: item.info.category.id
            }))
            Taro.navigateTo({
                url: `/pages/order/pages/template/detail?${str}`
            });
        }
    }

    viewMoreSpecial = (item) => {
        console.log(item)
        if (item.more_url) {
            Taro.navigateTo({url: item.more_url});
            return
        }
        const type = item.clist[0].info.category.type;
        if (type === "photo") {
            Taro.navigateTo({url: `/pages/home/pages/special?specialid=${item.id}&type=photo`})
        } else if (type === "phone") {
            Taro.navigateTo({url: `/pages/home/pages/special?specialid=${item.id}&type=phone`})
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

    singleProdAndReceiveCoupon = async (prod, coupon) => {
        console.log(prod)
        if (!notNull(coupon) && Object.keys(coupon).length > 0) {
            try {
                await api("app.coupon/add", {id: coupon.id});
            }catch (e) {
                console.log("领取优惠券失败：", e)
            }
        }
        Taro.navigateTo({
            url: prod.info.jump_url ? prod.info.jump_url : `/pages/order/pages/product/detail?id=${prod.id}`
        })
    }

    jumpToDetail = item => {
        console.log(item)
        Taro.navigateTo({
            url: `/pages/order/pages/product/detail?id=${item.info.id}`
        })
    }

    uncClose = () => {
        this.setState({showUnc: false});
        Taro.showTabBar()
    }

    uncShow = () => {
        this.setState({showUnc: true});
        Taro.hideTabBar()
    }

    jumpToTemplate = type => {
        let url = "";
        let picID = "63";
        let firstPicID = "";
        let phoneID = "41";
        let firstPhoneID = "";

        const {cateInfo} = this.state;

        for (const item of cateInfo) {
            if (item.tpl_type === "phone") {
                phoneID = item.tpl_category_id;
                if (item.tags.length > 0) {
                    firstPhoneID = item.tags[0].id
                }
            }
            if (item.tpl_type === "photo") {
                picID = item.tpl_category_id;
                if (item.tags.length > 0) {
                    firstPicID = item.tags[0].id
                }
            }
        }


        switch (type) {
            case 1: url = `c=${picID}&t=${firstPicID}&j=t`; break;  // 照片
            case 2: url = `c=${phoneID}&t=${firstPhoneID}&j=t`; break;  // 手机壳
            case 3: url = `c=${cateInfo[0].tpl_category_id}&t=${cateInfo[0].tags[0].id}`; break;  // 全部
        }

        Taro.navigateTo({
            url: `/pages/order/pages/template/index?${url}`
        })
    }

    filterArrForType = (arr = [], type: "photo" | "phone") => {
        return arr.filter((value) => {
            return value.model === "tpl_product" && value.info.category.type === type
        })
    }

    render() {
        const {data, centerPartyHeight, banners, showUnc} = this.state;
        return (
            <View className='index'>
                {
                    showUnc
                        ? <Uncultivated visible={showUnc} onClose={this.uncClose} />
                        : null
                }
                <View className='top-search'
                      style={{
                          paddingTop: deviceInfo.statusBarHeight + 5 + "px",
                          height: 52 + deviceInfo.statusBarHeight + "px"
                      }}
                >
                    <View className='search-box'
                          style={{
                              width: deviceInfo.windowWidth - deviceInfo.menu.width - 40 + "px",
                          }}
                          onClick={() => Taro.navigateTo({url: "/pages/search/index"})}>
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
                            <View className="read_fast_link" onClick={this.uncShow}>
                                <Image src={require("../../../source/il.svg")} className="fast_img" />
                                <View className="info">
                                    <Text className="h2">当面冲印照片</Text>
                                    <Text className="txt">高清冲印照片</Text>
                                </View>
                            </View>
                            <View className="read_fast_link" onClick={this.uncShow}>
                                <Image src={require("../../../source/cnxh.svg")} className="fast_img" />
                                <View className="info">
                                    <Text className="h2">当面冲印文档</Text>
                                    <Text className="txt">极速打印文档</Text>
                                </View>
                            </View>
                        </View>
                        <View className="index_fast_link_view">
                            <View className="fast_order_link" onClick={() => this.jumpToTemplate(1)}>
                                <Image src={require("../../../source/pz.svg")} className="fast_img" />
                                <Text className="h2">照片冲印</Text>
                                <Text className="info">高清盐印冲印</Text>
                            </View>
                            <View className="fast_order_link" onClick={() => this.jumpToTemplate(2)}>
                                <Image src={require("../../../source/az.svg")} className="fast_img" />
                                <Text className="h2">手机壳定制</Text>
                                <Text className="info">多种精美模板</Text>
                            </View>
                            <View className="fast_order_link" onClick={() => this.jumpToTemplate(3)}>
                                <Image src={require("../../../source/iall.svg")} className="fast_img" />
                                <Text className="h2">更多定制</Text>
                                <Text className="info">各种惊喜不断</Text>
                            </View>
                        </View>
                        <View className="remmond_your_love">
                            <Image src={require("../../../source/ir.svg")} className="love" />
                        </View>
                        {
                            data.map((item, index) => {
                                let list = item.clist;
                                const len = list.length;
                                if (item.model === "tpl_product") {
                                    list = item.clist.length > 6 ? item.clist.slice(1, 7) : item.clist
                                }
                                const evenArr = getEvenArr(item.clist);
                                const phoneArr = this.filterArrForType(list, "phone");  // 手机壳
                                const photoArr = this.filterArrForType(list, "photo");  // 照片
                                const onlyFourPhoto = photoArr.length > 3 ? photoArr.slice(0, 4) : [];

                                return <Fragment key={index}>
                                    {
                                        item.model === "product"
                                            ? len === 1
                                                ? <View className="single_index_product_item">
                                                    <View className="single_img_view">
                                                        <Image src={list[0].info.thumb_image} className="single_img" />
                                                    </View>
                                                    <View className="single_index_prod_info">
                                                        <Text className="h1">{list[0].title}</Text>
                                                    </View>
                                                    <View className="prod_bugs">
                                                        <View className="left">
                                                            <Text className="red">￥<Text className="price">{list[0].info.price}</Text></Text>
                                                            <Text className="p_price">￥{list[0].info.cost_price}</Text>
                                                        </View>
                                                        <View className="right">
                                                            <Text className="txt">{list[0].info.sold_count}人已抢</Text>
                                                        </View>
                                                    </View>
                                                    {
                                                        !notNull(list[0].coupon) && Object.keys(list[0].coupon).length > 0
                                                            ? <View className="single_prod_coupon">
                                                                <Image src={require("../../../source/yhq.svg")} className="prod_yhq" />
                                                                <View className="single_prod_info">
                                                                    <View className="left">
                                                                        <Text className="pri">￥<Text className="pr">{list[0].coupon.money}</Text></Text>
                                                                    </View>
                                                                    <View className="mid">
                                                                        <Text className="h1">{list[0].coupon.name}</Text>
                                                                        <Text className="txt">{list[0].coupon.use_end_time_text}</Text>
                                                                    </View>
                                                                    <View className="right">
                                                                        <View className="get_btn"
                                                                              onClick={() => this.singleProdAndReceiveCoupon(list[0], list[0].coupon)}>
                                                                            <Text className="txt">立即领取</Text>
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                            : null
                                                    }
                                                    <View className="get_submit" onClick={() => this.singleProdAndReceiveCoupon(list[0], list[0].coupon)}>
                                                        <Text className="txt">立即购买</Text>
                                                    </View>
                                                </View>
                                                : <View className="product_more_list_main" key={index + ""}>
                                                    <View className="title">{item.title || " "}</View>
                                                    <View className="sub_tit">{item.subtitle}</View>
                                                    <View className="product_more_list">
                                                        {
                                                            evenArr.map((product, prodIndex) => {
                                                                return <View className="product_list_item_wrap" key={prodIndex + ""}>
                                                                    <View className="prod_list" onClick={() => this.jumpToDetail(product)}>
                                                                        <View className="img">
                                                                            <Image src={product.thumb_image} className="prod_img" mode="widthFix" />
                                                                        </View>
                                                                        <View className="prod_tit">
                                                                            <Text className="txt">{product.title}</Text>
                                                                        </View>
                                                                        <View className="prod_bugs">
                                                                            <View className="left">
                                                                                <Text className="red">￥<Text className="price">{product.info.price}</Text></Text>
                                                                                <Text className="p_price">￥{product.info.cost_price}</Text>
                                                                            </View>
                                                                            <View className="right">
                                                                                <Text className="txt">{product.info.sold_count}人已抢</Text>
                                                                            </View>
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                            })
                                                        }
                                                    </View>
                                                </View>
                                            : null
                                    }
                                    {
                                        item.model === "tpl_product"
                                            ? <Fragment>
                                                {
                                                    phoneArr.length === 1
                                                        ? <View className='temp-warp' key={index + ""}>
                                                            <View className='masks'>
                                                                <View className='title'>
                                                                    <Text className='txt'>{item.title}</Text>
                                                                    {item.subtitle ? <Text
                                                                        className='sub-title'>{item.subtitle}</Text> : null}
                                                                </View>
                                                                <View className="single_phone_shell_view">
                                                                    <View className="single_phone_shell"
                                                                          onClick={() => this.onItemClick(item.clist[0], index)}>
                                                                        <Image src={require("../../../source/ke.png")} className="shell_ke" />
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
                                                    phoneArr.length > 1 && phoneArr.length < 6
                                                        ? <PhoneSwiper key={index + ""}
                                                                       data={phoneArr}
                                                                       title={item.title}
                                                                       subtitle={item.subtitle}
                                                                       onItemClick={current => this.onItemClick(current, index)}/>
                                                        : null
                                                }
                                                {
                                                    phoneArr.length >= 6
                                                        ? <View className='temp-warp' key={index + ""}>
                                                            <View className='title'>
                                                                <Text className='txt'>{item.title}</Text>
                                                                {item.subtitle ? <Text className='sub-title'>{item.subtitle}</Text> : null}
                                                            </View>
                                                            <View className='grid'>
                                                                <View className="phone_shell_view_list">
                                                                    {
                                                                        phoneArr.map((phone, phoneIdx) => (
                                                                            <View className="single_phone_shell_wrap" key={phoneIdx}>
                                                                                <View className="single_phone_shell rectangle_ke" key={phoneIdx}
                                                                                      onClick={() => this.onItemClick(phone, index)}>
                                                                                    <Image src={require("../../../source/ke.png")} className="shell_ke rectangle_ke" />
                                                                                    <Image src={ossUrl(phone.thumb_image, 1)}
                                                                                           className='photo rectangle_ke' mode='aspectFill'/>
                                                                                </View>
                                                                            </View>
                                                                        ))
                                                                    }
                                                                </View>
                                                            </View>
                                                            {
                                                                phoneArr.length > 6
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
                                                {
                                                    photoArr.length === 1
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
                                                    photoArr.length > 1 && photoArr.length < 4
                                                        ? <PhotoSwiper key={index + ""}
                                                                       title={item.title}
                                                                       subtitle={item.subtitle}
                                                                       onItemClick={c => this.onItemClick(c, index)}
                                                                       data={photoArr} />
                                                        : null
                                                }
                                                {
                                                    photoArr.length > 3
                                                        ? <View className='temp-warp' key={index + ""}>
                                                            <View className='title'>
                                                                <Text className='txt'>{item.title}</Text>
                                                                {item.subtitle ? <Text className='sub-title'>{item.subtitle}</Text> : null}
                                                            </View>
                                                            <View className="photo_item_view_container">
                                                                {
                                                                    onlyFourPhoto.map((childPhoto, photoIdx) => (
                                                                        <View className="photo_item_view_wrap" key={photoIdx}>
                                                                            <View className="photo_item_view" onClick={() => this.onItemClick(childPhoto, index)}>
                                                                                <View className="photo_item_hidden transverse">
                                                                                    <Image src={require("../../../source/transverse.svg")} className="hidden_view transverse" />
                                                                                    <Image src={ossUrl(childPhoto.thumb_image, 1)} className="transverse_img" mode="aspectFill" />
                                                                                </View>
                                                                            </View>
                                                                        </View>
                                                                    ))
                                                                }
                                                            </View>
                                                            {
                                                                photoArr.length > 4
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
                                                    <Image src={ossUrl(coupon.thumb_image, 1)} className="coupon_img" mode="widthFix" />
                                                    {/*<View className="receive_btn">*/}
                                                    {/*    <View className="anim_btn_receive">*/}
                                                    {/*        <Text className="txt">立即领取</Text>*/}
                                                    {/*        <View className="icon"><IconFont name="16_xiayiye" color="#fff" size={32}/></View>*/}
                                                    {/*    </View>*/}
                                                    {/*</View>*/}
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
