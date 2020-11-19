import {ComponentType} from 'react'
import Taro, {Component, Config} from '@tarojs/taro'
import {Button, Image, ScrollView, Swiper, SwiperItem, Text, View} from '@tarojs/components'
import {inject, observer} from '@tarojs/mobx'
import './index.less'
import IconFont from '../../components/iconfont'
import {api} from "../../utils/net";
import {deviceInfo, ossUrl} from "../../utils/common";
import RGBAster from 'rgbaster';
import Fragment from "../../components/Fragment";

const pics = [
    "https://i.ibb.co/sK68FQ0/c6a8dc33e8a84646b4cdc30f5cea391efc8a141c2bef0-UJ8-MBJ.jpg",
    "https://i.ibb.co/n6Ky6bV/cfff57e742254d16d383aa0e580ca03baa37099fed129-PZBbzk-fw1200.jpg",
    "https://i.ibb.co/sK68FQ0/c6a8dc33e8a84646b4cdc30f5cea391efc8a141c2bef0-UJ8-MBJ.jpg",
    "https://i.ibb.co/n6Ky6bV/cfff57e742254d16d383aa0e580ca03baa37099fed129-PZBbzk-fw1200.jpg",
    "https://i.ibb.co/sK68FQ0/c6a8dc33e8a84646b4cdc30f5cea391efc8a141c2bef0-UJ8-MBJ.jpg",
    "https://i.ibb.co/n6Ky6bV/cfff57e742254d16d383aa0e580ca03baa37099fed129-PZBbzk-fw1200.jpg",
]

interface IndexState {
    currentColor: any[];
    colorWarp: string;
    swiperCurrent: number;
    data: any[]
}

@inject("userStore")
@observer
class Index extends Component<any, IndexState> {

    /**
     * 指定config的类型声明为: Taro.Config
     *
     * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
     * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
     * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
     */
    config: Config = {
        navigationBarTitleText: '发现'
    }

    constructor(props) {
        super(props);
        this.state = {
            currentColor: [],
            colorWarp: "",
            swiperCurrent: 0,
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

    renderTemplateItem = (item, index) => {
        let ele = null;
        let currentColor = this.state.currentColor;

        if (item.clist instanceof Array) {
            // 商品模板
            if (item.model === "tpl_product") {
                if (item.clist.length > 0) {
                    const itemLen = item.clist.length;
                    if (itemLen === 1) {
                        ele = (
                            <View className='temp-warp' style={`background: #ff000030`} key={index}>
                                <View style='background:rgba(0, 0, 0, 0.03);' className='mask'>
                                    <View className='title'>
                                        <Text className='txt'>{item.title}</Text>
                                        {item.subtitle ? <Text className='sub-title'>{item.subtitle}</Text> : null}
                                    </View>
                                    <View className='swiper-back'>
                                        <View className='temp-swiper'>
                                            <Image src={ossUrl(item.clist[0].thumb_image, 1)} className='photo' mode='aspectFill'/>
                                        </View>
                                    </View>
                                    <Button className='now-design-btn'>立即设计</Button>
                                </View>
                            </View>
                        )
                    } else if (itemLen > 1 && itemLen < 6) {
                        // let temp = {
                        //     [`${index}`]: {}
                        // }
                        // for (let i = 0; i < itemLen; i++) {
                        //     temp[`${index}`] = {current: i, color: "transparent"};
                        //     currentColor.push(temp)
                        // }
                        ele = (
                            <View className='temp-warp' style={`background: #25632130`} key={index}>
                                <View style='background:rgba(0, 0, 0, 0.03);' className='mask'>
                                    <View className='title'>
                                        <Text className='txt'>{item.title}</Text>
                                        {item.subtitle ? <Text className='sub-title'>{item.subtitle}</Text> : null}
                                    </View>
                                    <View className='swiper-back'>
                                        <Swiper className='temp-swiper' vertical autoplay={false} circular={false} indicatorDots={false}
                                                onChange={({detail: {current}}) => {
                                                    this.setState({
                                                        colorWarp: this.state.tempColors[current],
                                                        swiperCurrent: current
                                                    })
                                                }}
                                        >
                                            {
                                                item.clist.map((child, cIdx) => (
                                                    <SwiperItem key={`child_${cIdx}`}>
                                                        <Image src={ossUrl(child.thumb_image, 1)} className='photo' mode='aspectFill'/>
                                                    </SwiperItem>
                                                ))
                                            }
                                        </Swiper>

                                        <View className='indicatorDots'>
                                            {
                                                item.clist.map((_, index) => (
                                                    <View className={this.state.swiperCurrent == index ? 'dot active' : 'dot'} key={index} />
                                                ))
                                            }
                                        </View>
                                    </View>
                                    <Button className='now-design-btn'>立即设计</Button>
                                </View>
                            </View>
                        )
                    } else {
                        ele = (
                            <View className='temp-warp' key={index}>
                                <View className='title'>
                                    <Text className='txt'>{item.title}</Text>
                                    {item.subtitle ? <Text className='sub-title'>{item.subtitle}</Text> : null}
                                </View>
                                <View className='grid'>
                                    {
                                        item.clist.slice(1, 7).map((child, cIdx) => (
                                            <View className='photo-warp' key={`tel_${cIdx}`}>
                                                <Image src={ossUrl(child.thumb_image, 1)} className='photo' mode='aspectFill'/>
                                            </View>
                                        ))
                                    }
                                </View>
                                {
                                    item.clist.length > 6
                                        ? <View className='seemore'>
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
                        item.clist.map((product, prodIndex) => (
                            <View className='product-item' key={prodIndex}>
                                <Image src={ossUrl(product.thumb_image, 1)} className='image' mode='aspectFill'/>
                                <View className='bottom'>
                                    <View className='left'>
                                        <Text className='title'>{product.title || " "}</Text>
                                        {product.subtitle ? <Text className='subtitle'>{product.subtitle}</Text> : null}
                                    </View>
                                    <View className='right-btn' onClick={() => {
                                        // value.info.jump_url
                                    }}>
                                        <Text className='txt'>我要定制</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    }
                </Fragment>
            }
        }

        console.log("初始化的色值：", currentColor)
        // this.setState({currentColor})
        return ele
    }


    render() {
        const {colorWarp, swiperCurrent, data} = this.state;
        return (
            <View className='index'>
                <View className='top-search'>
                    <View className='search-box' onClick={() => Taro.navigateTo({url: "/pages/search/index"})}>
                        <IconFont name='20_sousuo' size={40} color='#9C9DA6'/>
                        <Text className='placeholders'>搜索海量模板</Text>
                    </View>
                </View>
                <ScrollView scrollY style={{height: deviceInfo.windowHeight - 102}}>
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
