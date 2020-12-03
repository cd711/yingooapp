import {ComponentType} from 'react'
import Taro, {Component, Config} from '@tarojs/taro'
import {Button, Image, ScrollView, Text, View} from '@tarojs/components'
import {inject, observer} from '@tarojs/mobx'
import './index.less'
import IconFont from '../../components/iconfont'
import {api} from "../../utils/net";
import {deviceInfo, ossUrl} from "../../utils/common";
import Fragment from "../../components/Fragment";
import ImageSwiper from "./ImageSwiper";
import page from "../../utils/ext";


interface IndexState {
    data: any
}


@inject("userStore")
@observer
@page({
    wechatAutoLogin: true
})
class Index extends Component<any, IndexState> {

    config: Config = {
        navigationBarTitleText: '发现'
    }


    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
    }

    private total: number = 0;
    getIndexList = async (data: {start?: number, size?: number, loadMore?: boolean} = {}) => {
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
        }catch (e) {
            console.log("首页获取列表出错：", e)
        }

    }

    componentDidMount() {
        this.getIndexList()
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
            Taro.navigateTo({url: `/pages/index/special?specialid=${item.id}`})
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
        }catch (e) {
            Taro.hideLoading()
            Taro.showToast({
                title: e,
                icon: "none"
            })
        }
    }

    renderTemplateItem = (item, index) => {
        let ele = null;

        if (item.clist instanceof Array) {
            // 商品模板
            if (item.model === "tpl_product") {
                if (item.clist.length > 0) {
                    const itemLen = item.clist.length;
                    if (itemLen === 1) {
                        ele = (
                            <View className='temp-warp' key={index+""}>
                                <View className='masks'>
                                    <View className='title'>
                                        <Text className='txt'>{item.title}</Text>
                                        {item.subtitle ? <Text className='sub-title'>{item.subtitle}</Text> : null}
                                    </View>
                                    <View className='swiper-back' onClick={() => this.onItemClick(item.clist[0], index)}>
                                        <View className='temp-swiper'>
                                            <Image src={ossUrl(item.clist[0].thumb_image, 1)} className='photo' mode='aspectFill'/>
                                        </View>
                                    </View>
                                    <Button className='now-design-btn' onClick={() => this.onItemClick(item.clist[0], index)}>立即设计</Button>
                                </View>
                            </View>
                        )
                    } else if (itemLen > 1 && itemLen < 6) {
                        ele = <ImageSwiper key={index+""} item={item} onItemClick={current => this.onItemClick(current, index)} />
                    } else {
                        ele = (
                            <View className='temp-warp' key={index+""}>
                                <View className='title'>
                                    <Text className='txt'>{item.title}</Text>
                                    {item.subtitle ? <Text className='sub-title'>{item.subtitle}</Text> : null}
                                </View>
                                <View className='grid'>
                                    {
                                        item.clist.slice(1, 7).map((child, cIdx) => (
                                            <View className='photo-warp' key={`tel_${cIdx}`} onClick={() => this.onItemClick(child, index)}>
                                                <Image src={ossUrl(child.thumb_image, 1)} className='photo' mode='aspectFill'/>
                                            </View>
                                        ))
                                    }
                                </View>
                                {
                                    item.clist.length > 6
                                        ? <View className='seemore' onClick={() => this.viewMoreSpecial(item)}>
                                            <Text className='txt'>查看更多</Text>
                                            <IconFont name='20_xiayiye' size={40} color='#9C9DA6'/>
                                        </View>
                                        : null
                                }
                            </View>
                        )
                    }
                }
            } else if (item.model === "product") {  // 商品
                ele = <Fragment>
                    {
                        item.clist.map((product, prodIndex) => {
                            return product.info.jump_url && <View className='product-item' key={prodIndex+""}>
                                <Image src={ossUrl(product.thumb_image, 1)} className='image' mode='aspectFill'/>
                                <View className='bottom'>
                                    <View className='left'>
                                        <Text className='title'>{product.title || " "}</Text>
                                        {product.subtitle ? <Text className='subtitle'>{product.subtitle}</Text> : null}
                                    </View>
                                    <View className='right-btn' onClick={() => this.onCustomized(product, index)}>
                                        <Text className='txt'>我要定制</Text>
                                    </View>
                                </View>
                            </View>
                        })
                    }
                </Fragment>
            } else if (item.model === "coupon") {
                ele = <Fragment>
                    {
                        item.clist.map((coupon, cIndex) => (
                            <View className="index_coupon_main" key={`${index}_${cIndex}`} onClick={() => this.receiveCoupon(coupon)}>
                                <Image src={ossUrl(coupon.thumb_image, 1)} className="coupon_img" />
                                <View className="receive_btn">
                                    <View className="anim_btn_receive">
                                        <Text className="txt">立即领取</Text>
                                        <View className="icon">
                                            <IconFont name="16_xiayiye" color="#fff" size={32} />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))
                    }
                </Fragment>
            }
        }

        return ele
    }


    render() {
        const {data} = this.state;
        return (
            <View className='index'>
                <View className='top-search'>
                    <View className='search-box' onClick={() => Taro.navigateTo({url: "/pages/search/index"})}>
                        <IconFont name='20_sousuo' size={40} color='#9C9DA6'/>
                        <Text className='placeholders'>搜索海量模板</Text>
                    </View>
                </View>
                <ScrollView scrollY style={{height: deviceInfo.windowHeight - 102}} onScrollToLower={this.loadMore}>
                    <View className='inde_page_container'>
                        {
                            data.map((value, index) => this.renderTemplateItem(value, index))
                        }
                    </View>
                </ScrollView>
            </View>
        )
    }
}

export default Index as ComponentType
