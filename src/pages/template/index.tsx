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
    tagData:TagData
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
            }
        }
    }
    componentWillMount() { }

    componentDidMount() {
        // api("app.product/tplList",{

        // })
        console.log(Taro.getSystemInfoSync())

        api("app.product/cate").then((res)=>{
            console.log(res);
            this.setState({
                cates:res,
            },()=>{
                this.getTagContext(res[0].tags[0])
            })
            Taro.createSelectorQuery().selectViewport().boundingClientRect((vres)=>{
                Taro.createSelectorQuery().select(".tops").boundingClientRect((res)=>{
                    this.setState({
                        topsHeight:res.height,
                        otherHeight:vres.height-res.height-50
                    })
                }).exec()
            }).exec();
            
        }).catch((e)=>{
            console.log(e);
        })
    }

    componentWillUnmount() { }

    componentDidShow() { }

    componentDidHide() { }
    getTagContext = (tag) => {
        const {switchActive,cates} = this.state;
        console.log(switchActive,cates,cates[switchActive]);
        api("app.product_tpl/list",{
            start:0,
            size:20,
            category_id:cates[switchActive].tpl_category_id,
            tag_id:tag.id
        }).then((res)=>{
            console.log(res);
            this.setState({
                tagData:res
            })
        })
    }
    render() {
        const {switchActive,cates,topsHeight,otherHeight,switchTagActive,tagData} = this.state;
        const tags = cates && cates[switchActive]?cates[switchActive].tags:[];
        const tagList = tagData && tagData.list && tagData.list.length>0?tagData.list:[];
        return (
            <View className='template'>
                <View className='tops'>
                    <View className='top-search'>
                        <View className='search-box'>
                            <IconFont name='20_sousuo' size={40} color="#9C9DA6" />
                            <Text className='placeholders'>搜索海量模板</Text>
                        </View>
                    </View>
                    <View className='top-switch'>
                        <ScrollView scrollX className='switch-scroll'>
                            <View className='warp' style={`width:${Taro.pxTransform((cates.length+1)*128)}`}>
                                {
                                    cates.length>0 && cates.map((item,index)=>(
                                        <View className={index==switchActive?'item active':'item'} key={item.id} onClick={()=>{
                                            this.setState({switchActive:index});
                                            const tags = cates && cates[index]?cates[index].tags:[];
                                            if (tags.length>0) {
                                                this.getTagContext(tags[0]);
                                            }
                                        }}>
                                            <Text className='text'>{item.name}</Text>
                                            {index==switchActive?<Image className='icon' src={require("../../source/switchBottom.png")} />:null}
                                        </View>
                                    ))
                                }
                            </View>

                        </ScrollView>
                        <View className='all'>
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
                                        this.setState({switchTagActive:index});
                                        this.getTagContext(item)
                                    }}>
                                        <Text className='txt'>{item.name}</Text>
                                    </View>
                                ))
                            }
                        </ScrollView>
                    </View>
                    <ScrollView scrollY className='right-scroll' style={`height:${otherHeight}px;flex:1`}>
                        <View className='warp'>
                            {
                                tagList.map((item)=>(
                                    <View className='pic-box' style={`width:${Taro.pxTransform(244)};height:${Taro.pxTransform(244/(item.attr.width/item.attr.height))};`}>
                                        <Image src={item.thumb_image} className='item' style={`width:${Taro.pxTransform(244)};height:${Taro.pxTransform(244/(item.attr.width/item.attr.height))};border-radius: 16px;`}/>
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
