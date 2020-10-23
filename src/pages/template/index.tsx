import { ComponentType } from 'react'
import Taro, { Component, Config, pxTransform } from '@tarojs/taro'
import { View, Text,Image,ScrollView } from '@tarojs/components'
import './index.less'
import IconFont from '../../components/iconfont'
import { api } from '../../utils/net'

interface TagData{
    list:Array<any>,
    size:number,
    start:number,
    total:number
}

export default class Template extends Component<any,{
    switchActive:number;
    cates:Array<any>;
    topsHeight:number;
    otherHeight:number;
    switchTagActive:number;
    tagData:TagData | any;
    mainRightWidth:number;
    showAllCates:boolean;
}> {
    config: Config = {
        navigationBarTitleText: '模板'
    }
    constructor(props) {
        super(props);
        this.state = {
            switchActive:0,
            cates:[],
            topsHeight:208,
            otherHeight:500,
            switchTagActive:0,
            tagData:{
                list:[],
                size:0,
                start:0,
                total:0
            },
            mainRightWidth:0,
            showAllCates:false
        }
    }
    componentWillMount() { }

    componentDidMount() {
        if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
            window.addEventListener("resize", ()=>{
                this.calcDeviceRota();
            }, false)
        }
        Taro.showLoading({title:"加载中..."});
        api("app.product/cate").then((res)=>{
            this.setState({
                cates:res,
            },()=>{
                this.getTagContext(res[0].tags[0])
            })
            this.calcDeviceRota();
            Taro.hideLoading();
        }).catch((e)=>{
            Taro.hideLoading();
            Taro.showToast({
                title:e,
                icon:"none",
                duration:2000
            }).then(()=>{
                Taro.switchTab({
                    url:'/pages/index/index'
                })
            });
        })
    }
    calcDeviceRota = () => {
        const query = Taro.createSelectorQuery;
        query().selectViewport().boundingClientRect((vres)=>{
            query().select(".tops").boundingClientRect((res)=>{
                this.setState({
                    topsHeight:res.height,
                    otherHeight:vres.height-res.height-50
                });
            }).exec();
        }).exec();
        const ww = Taro.getSystemInfoSync().windowWidth;
        query().select('.left-menu').boundingClientRect((rect)=>{
            this.setState({
                mainRightWidth:ww-rect.width
            });
        }).exec();
    }
    componentWillUnmount() {
        if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
            window.removeEventListener("resize",()=>{}, false)
        }
    }

    componentDidShow() { }

    componentDidHide() { }
    getTagContext = (tag) => {
        const {switchActive,cates} = this.state;
        api("app.product_tpl/list",{
            start:0,
            size:20,
            category_id:cates[switchActive].tpl_category_id,
            tag_id:tag.id
        }).then((res)=>{
            this.setState({
                tagData:res
            })
        })
    }
    render() {
        const {switchActive,cates,topsHeight,otherHeight,switchTagActive,tagData,mainRightWidth,showAllCates} = this.state;
        const tags = cates && cates[switchActive]?cates[switchActive].tags:[];
        console.log(tags)
        const tagList = tagData && tagData.list && tagData.list.length>0?tagData.list:[];
        let searchBox = <View className='top-search'>
            <View className='search-box'>
                <IconFont name='20_sousuo' size={40} color="#9C9DA6" />
                <Text className='placeholders'>搜索海量模板</Text>
            </View>
        </View>
        return (
            <View className='template'>
                <View className='tops'>
                    {
                        showAllCates?<View className='all-category-warp'>
                            {searchBox}
                            <View className='all-category'>
                                <View className='title-box'>
                                    <Text className='txt'>全部品类</Text>
                                    <View onClick={()=>{
                                        this.setState({
                                            showAllCates:false
                                        })
                                    }}><IconFont name='24_guanbi' size={48} color='#121314' /></View>
                                </View>
                                <View className='all-item'>
                                    {
                                        cates.length>0 && cates.map((item,index)=>(
                                            <View className='item' key={item.id}>
                                                <Image src={item.image} className='img'/>
                                                <Text className='name'>{item.name}</Text>
                                            </View>
                                        ))
                                    }
                                </View>
                            </View>
                        </View>:null
                    }
                    {searchBox}
                    <View className='top-switch'>
                        <ScrollView scrollX className='switch-scroll'>
                            <View className='warp' style={`width:${Taro.pxTransform((cates.length+1)*128)}`}>
                                {
                                    cates.length>0 && cates.map((item,index)=>(
                                        <View className={index==switchActive?'item active':'item'} key={item.id} onClick={()=>{
                                            this.setState({
                                                switchActive:index,
                                                switchTagActive:0,
                                                tagData:{}
                                            },()=>{
                                                const tags = cates && cates[index]?cates[index].tags:[];
                                                
                                                if (tags.length>0) {
                                                    this.getTagContext(tags[0]);
                                                }
                                            });

                                        }}>
                                            <Text className='text'>{item.name}</Text>
                                            {index==switchActive?<Image className='icon' src={require("../../source/switchBottom.png")} />:null}
                                        </View>
                                    ))
                                }
                            </View>
                        </ScrollView>
                        <View className='all' onClick={()=>{
                            this.setState({
                                showAllCates:true
                            })
                        }}>
                            <IconFont name='24_gengduofenlei' size={48} color='#121314' />
                        </View>
                    </View>
                </View>

                <View className='main' style={`top:${topsHeight}px;height:${otherHeight}px;width:100vw;`}>
                    <View className='left-menu' style={`height:${otherHeight}px;background:#FFF`}>
                        <ScrollView scrollY className='left-scroll' style={`height:${otherHeight}px;background:#FFF`}>
                            {
                                tags && tags.map((item,index)=>(
                                    <View className={switchTagActive==index?'item active':"item"} key={item.id} onClick={()=>{
                                        this.setState({
                                            switchTagActive:index,
                                            tagData:{}
                                        });
                                        this.getTagContext(item)
                                    }}>
                                        <Text className='txt'>{item.name}</Text>
                                    </View>
                                ))
                            }
                        </ScrollView>
                    </View>
                    <ScrollView scrollY className='right-scroll' style={`width:${mainRightWidth}px;padding-top:${Taro.pxTransform(32)}`}>
                        <View className='warp' style={`width:${mainRightWidth}px;padding:0 14px;box-sizing:border-box;column-gap:14px`}>
                            <View className='print-box' style={`width:${(mainRightWidth-(14*3))/2}px;height:${(mainRightWidth-(14*3))/2}px;`} onClick={()=>{
                                // Taro.navigateTo({
                                //     url:`/pages/editor/index`
                                // })
                            }}>
                                <View className='print-warp' style={`width:${(mainRightWidth-(14*3))/2}px;height:${(mainRightWidth-(14*3))/2}px;`}>
                                    <Image src={require("../../source/editor-print.png")} className='print'/>
                                    <Text className='print-txt'>直接冲印</Text>
                                </View>
                                <View className='nook'>
                                    <Text className='ntxt'>快速</Text>
                                </View>
                            </View>
                            {
                                tagList.map((item)=>(
                                    <View className='pic-box' style={`width:${(mainRightWidth-(14*3))/2}px;height:${((mainRightWidth-(14*3))/2)/(item.attr.width/item.attr.height)}px;`} onClick={()=>{
                                        Taro.navigateTo({
                                            url:`/pages/editor/index?tpl_id=${item.id}`
                                        })
                                    }}>
                                        <Image src={item.thumb_image} className='item' style={`width:${(mainRightWidth-(14*3))/2}px;height:${((mainRightWidth-(14*3))/2)/(item.attr.width/item.attr.height)}px;border-radius: ${Taro.pxTransform(16)};`}/>
                                    </View>
                                ))
                            }
                        </View>
                    </ScrollView>
                </View>
            </View>
        )
    }
}
