import { ComponentType } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Swiper, SwiperItem, Text,Image } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import analyze from 'rgbaster'
import './index.less'
import IconFont from '../../components/iconfont'
import { userStore } from "../../store/user";

const pics = [
    "https://i.ibb.co/sK68FQ0/c6a8dc33e8a84646b4cdc30f5cea391efc8a141c2bef0-UJ8-MBJ.jpg",
    "https://i.ibb.co/n6Ky6bV/cfff57e742254d16d383aa0e580ca03baa37099fed129-PZBbzk-fw1200.jpg",
    "https://i.ibb.co/sK68FQ0/c6a8dc33e8a84646b4cdc30f5cea391efc8a141c2bef0-UJ8-MBJ.jpg",
    "https://i.ibb.co/n6Ky6bV/cfff57e742254d16d383aa0e580ca03baa37099fed129-PZBbzk-fw1200.jpg",
    "https://i.ibb.co/sK68FQ0/c6a8dc33e8a84646b4cdc30f5cea391efc8a141c2bef0-UJ8-MBJ.jpg",
    "https://i.ibb.co/n6Ky6bV/cfff57e742254d16d383aa0e580ca03baa37099fed129-PZBbzk-fw1200.jpg",
]

@inject("userStore")
@observer
class Index extends Component<any,{
    tempColors:Array<string>;
    colorWarp:string;
}> {

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
    constructor(props){
        super(props);
        this.state = {
            tempColors:[],
            colorWarp:""
        }
    }

    componentWillMount() { }

    componentWillReact() {
        console.log('componentWillReact')
    }
    
    componentDidMount() {
        this.test();

    }
    test = () => {
        const colors = pics.map(async(item)=>{
            const result = await analyze(item);
            return result[0].color;
        });
        Promise.all(colors).then((results)=>{
            console.log(results);  // [1, 2, 3]
            this.setState({
                tempColors:results,
                colorWarp:results[0]
            })  
        });
      
    }
    componentWillUnmount() { }

    componentDidShow() { }

    componentDidHide() { }



    render() {
        const { } = userStore;
        const {colorWarp} = this.state;
        return (
            <View className='index'>
                <View className='top-search'>
                    <View className='search-box'>
                        <IconFont name='20_sousuo' size={40} color="#9C9DA6" />
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
                                pics.map((item)=>(
                                    <View className='photo-warp'>
                                        <Image src={item} className='photo' mode='aspectFill'/>
                                    </View>
                                ))
                            }
                        </View>
                        <View className='seemore'>
                            <Text className='txt'>查看更多</Text>
                            <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                        </View>
                    </View>
                    <View className='temp-warp' style={`background:${colorWarp}`}>
                        <View style={'background:rgba(0, 0, 0, 0.15);'} className='mask'>
                            <View className='title'>
                                <Text className='txt'>大胆的色彩和创意</Text>
                                <Text className='sub-title'>将色彩与创意做到极致</Text>
                            </View>
                            <Swiper
                                className='temp-swiper'
                                // indicatorColor='#000000'
                                // indicatorActiveColor='#FF4966'
                                vertical
                                circular={true}
                                indicatorDots={false}
                                onChange = {({detail:{current}})=>{
                                    this.setState({
                                        colorWarp:this.state.tempColors[current]
                                    })
                                }}
                                >
                                {
                                    pics.map((item)=>(
                                        <SwiperItem>
                                            <Image src={item} className='photo' mode='aspectFill'/>
                                        </SwiperItem>
                                    ))
                                }
                            </Swiper>
                        </View>
                    </View>
                </View>
            </View>
        )
    }
}

export default Index as ComponentType
