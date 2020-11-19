import {ComponentType} from 'react'
import Taro, {Component, Config} from '@tarojs/taro'
import {Button, Image, Swiper, SwiperItem, Text, View} from '@tarojs/components'
import {inject, observer} from '@tarojs/mobx'
import './index.less'
import IconFont from '../../components/iconfont'
import {api} from "../../utils/net";
import {ossUrl} from "../../utils/common";
import analyze from 'rgbaster'

const pics = [
    "https://i.ibb.co/sK68FQ0/c6a8dc33e8a84646b4cdc30f5cea391efc8a141c2bef0-UJ8-MBJ.jpg",
    "https://i.ibb.co/n6Ky6bV/cfff57e742254d16d383aa0e580ca03baa37099fed129-PZBbzk-fw1200.jpg",
    "https://i.ibb.co/sK68FQ0/c6a8dc33e8a84646b4cdc30f5cea391efc8a141c2bef0-UJ8-MBJ.jpg",
    "https://i.ibb.co/n6Ky6bV/cfff57e742254d16d383aa0e580ca03baa37099fed129-PZBbzk-fw1200.jpg",
    "https://i.ibb.co/sK68FQ0/c6a8dc33e8a84646b4cdc30f5cea391efc8a141c2bef0-UJ8-MBJ.jpg",
    "https://i.ibb.co/n6Ky6bV/cfff57e742254d16d383aa0e580ca03baa37099fed129-PZBbzk-fw1200.jpg",
]

interface IndexState {
    tempColors: Array<string>;
    colorWarp: string;
    swiperCurrent: number;
    data: any
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
            tempColors: [],
            colorWarp: "",
            swiperCurrent: 0,
            data: {
                special: [],
                product: [],
                tpl_product: []
            }
        }
    }

    componentDidMount() {
        api("app.index/h5", {
            area_size: JSON.stringify({
                tpl_product: 3,
                product: 9,
                special: 6
            })
        }).then(data => {
            this.setState({data})
        }).catch(e => {
            console.log("获取首页列表出错：", e)
        })
        this.test()
    }

    test = () => {
        // const colors = pics.map(async(item)=>{
        //     const result = await analyze(item);
        //     return result[0].color;
        // });
        // Promise.all(colors).then((results)=>{
        //     console.log(results);  // [1, 2, 3]
        //     this.setState({
        //         tempColors:results,
        //         colorWarp:results[0]
        //     })
        // });

        // analyze(pics[0]).then(res => {
        //     console.log(res)
        // })

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
                <View className='container'>
                    <View className='temp-warp'>
                        <View className='title'>
                            <Text className='txt'>大胆的色彩和创意</Text>
                            <Text className='sub-title'>将色彩与创意做到极致</Text>
                        </View>
                        <View className='grid'>
                            {
                                data.special.map((item, index) => (
                                    <View className='photo-warp' key={index}>
                                        <Image src={ossUrl(item.thumb_image, 1)} className='photo' mode='aspectFill'/>
                                    </View>
                                ))
                            }
                        </View>
                        <View className='seemore'>
                            <Text className='txt'>查看更多</Text>
                            <IconFont name='20_xiayiye' size={40} color='#9C9DA6'/>
                        </View>
                    </View>
                    <View className='temp-warp' style={`background: ${colorWarp}`}>
                        <View style='background:rgba(0, 0, 0, 0.03);' className='mask'>
                            <View className='title'>
                                <Text className='txt'>大胆的色彩和创意</Text>
                                <Text className='sub-title'>将色彩与创意做到极致</Text>
                            </View>
                            <View className='swiper-back'>
                                <Swiper
                                    className='temp-swiper'
                                    vertical
                                    circular={false}
                                    indicatorDots={false}
                                    onChange={({detail: {current}}) => {
                                        console.log(current)
                                        this.setState({
                                            colorWarp: this.state.tempColors[current],
                                            swiperCurrent: current
                                        })
                                    }}
                                >
                                    {
                                        data.product.map((item, index) => (
                                            <SwiperItem key={index}>
                                                <Image src={ossUrl(item.thumb_image, 1)} className='photo' mode='aspectFill'/>
                                            </SwiperItem>
                                        ))
                                    }
                                </Swiper>

                                <View className='indicatorDots'>
                                    {
                                        data.product.map((_, index) => (
                                            <View className={swiperCurrent == index ? 'dot active' : 'dot'} key={index} />
                                        ))
                                    }
                                </View>
                            </View>
                            {/* <View className='coverflow'>
                                {
                                    pics.map((item,index)=>(
                                        <View className='item' key={index}>
                                            <Image src={item} className='photo' mode='aspectFill'/>
                                        </View>
                                    ))
                                }
                            </View> */}
                            <Button className='now-design-btn'>立即设计</Button>
                        </View>
                    </View>
                    {
                        data.tpl_product.map((value, index) => (
                            <View className='product-item' key={index}>
                                <Image src={ossUrl(value.thumb_image, 1)} className='image' mode='aspectFill'/>
                                <View className='bottom'>
                                    <View className='left'>
                                        <Text className='title'>{value.title || " "}</Text>
                                        <Text className='subtitle'>定制你的专属耐克</Text>
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
                </View>
            </View>
        )
    }
}

export default Index as ComponentType
