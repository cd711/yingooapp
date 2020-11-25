import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image,ScrollView } from '@tarojs/components'
import './index.less'
import IconFont from '../../components/iconfont'
import { api } from '../../utils/net'
import {AtActivityIndicator} from 'taro-ui'
import { observer, inject } from '@tarojs/mobx'
import {ossUrl} from '../../utils/common'
import page from "../../utils/ext";

interface TagData{
    list:Array<any>,
    size:number,
    start:number,
    total:number
}

@inject("templateStore")
@observer
@page({
    wechatAutoLogin: false
})
export default class Template extends Component<any,{
    switchActive:number;
    cates:Array<any>;
    topsHeight:number;
    otherHeight:number;
    switchTagActive:number;
    tagData:TagData | any;
    mainRightWidth:number;
    showAllCates:boolean;
    showTemplateLoading:boolean;
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
            showAllCates:false,
            showTemplateLoading:false
        }
    }

    componentDidMount() {
        
        if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
            window.addEventListener("resize", ()=>{
                Taro.removeStorage({key:'template_tops'})
                this.calcDeviceRota();
            }, false)
        }
        Taro.showLoading({title:"加载中..."});
        api("app.product/cate").then((res)=>{
            res = res.map((item)=>{
                item.tags.unshift({
                    id:0,
                    name:"全部"
                });
                return item
            });
            const {c,t} = this.$router.params;
            let ca = 0;
            let ta = 0;
            const cid = c?parseInt(c):0;
            const tid = t?parseInt(t):0;
            for (let index = 0; index < res.length; index++) {
                const element = res[index];
                ca = parseInt(element.id+"") == cid ? index : 0; 
                for (let i = 0; i < element.tags.length; i++) {
                    const tag = element.tags[i];
                    if (parseInt(tag.id+"") == tid) {
                        ta = i;
                        break;
                    }
                }
            }
            this.setState({
                cates:res,
                switchActive:ca,
                switchTagActive:ta
            },()=>{
                this.getTagContext(res[ca].tags[ta]);
                this.calcDeviceRota();                
                Taro.hideLoading();
            })
        }).catch((e)=>{
            console.log(e)
            Taro.hideLoading();
            Taro.showToast({
                title:e,
                icon:"none",
                duration:2000
            }).then(()=>{
                Taro.reLaunch({
                    url:'/pages/index/index'
                })
            });
        })
    }

    calcDeviceRota = () => {
        const template_tops = Taro.getStorageSync('template_tops');
        const template_left_menu = Taro.getStorageSync('template_left_menu');
        if (template_tops && template_left_menu) {
            this.setState(Object.assign(template_tops,template_left_menu))
            return;
        }
        const query = Taro.createSelectorQuery;
        query().selectViewport().boundingClientRect((vres)=>{
            query().select(".t_tops").boundingClientRect((res)=>{
                this.setState({
                    topsHeight:res.height>0?res.height:104,
                    otherHeight:vres.height-res.height-50
                });
                Taro.setStorage({
                    key:'template_tops',
                    data:{
                        topsHeight:res.height>0?res.height:104,
                        otherHeight:vres.height-res.height-50
                    }
                })
            }).exec();
        }).exec();
        const ww = Taro.getSystemInfoSync().windowWidth;
        query().select('#template_left_menu').boundingClientRect((rect)=>{
            this.setState({
                mainRightWidth:ww-rect.width
            });
            Taro.setStorage({
                key:"template_left_menu",
                data:{
                    mainRightWidth:ww-rect.width
                }
            })
        }).exec();

    }
    componentWillUnmount() {
        if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            window.removeEventListener("resize",()=>{},false)
        }
    }

    getTagContext = (tag) => {
        const {switchActive,cates,tagData} = this.state;
        if (tag) {
            const tagList = tagData && tagData.list && tagData.list.length>0?tagData.list:[];
            // const tagTotal = tagData && tagData.total && tagData.total>=0?tagData.total:0;
            this.setState({
                showTemplateLoading:true
            })
            api("app.product_tpl/list",{
                start:tagList.length,
                size:10,
                category_id:cates[switchActive].tpl_category_id,
                tag_id:tag.id
            }).then((res)=>{
                res.list = tagList.concat(res.list);
                this.setState({
                    tagData:res,
                    showTemplateLoading:false
                });
                Taro.hideLoading();
            }).catch((e)=>{
                this.setState({
                    showTemplateLoading:false
                });
                Taro.showToast({
                    title:e,
                    icon:"none",
                    duration:1500
                });
            })
        }
    }

    onScrollToLower = () => {
        const {switchActive,cates,switchTagActive,tagData} = this.state;
        const tags = cates && cates[switchActive]?cates[switchActive].tags:[];
        const tagList = tagData && tagData.list && tagData.list.length>0?tagData.list:[];
        const tagTotal = tagData && tagData.total && tagData.total>=0?tagData.total:0;
        if (tags.length>0 && tagList.length<tagTotal) {
            const tag = tags[switchTagActive];
            this.getTagContext(tag)
        }
    }

    render() {
        const {switchActive,cates,topsHeight,otherHeight,switchTagActive,tagData,mainRightWidth,showAllCates,showTemplateLoading} = this.state;
        const tags = cates && cates[switchActive]?cates[switchActive].tags:[];
        const tagList = tagData && tagData.list && tagData.list.length>0?tagData.list:[];
        
        const searchBox = <View className='top-search'>
            <View className='search-box' onClick={() => Taro.navigateTo({url: "/pages/search/index"})}>
                <IconFont name='20_sousuo' size={40} color='#9C9DA6' />
                <Text className='placeholders'>搜索海量模板</Text>
            </View>
        </View>
        return (
            <View className='template'>
                <View className='t_tops'>
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
                                            <View className='item' key={item.id} onClick={()=>{
                                                this.setState({
                                                    switchActive:index,
                                                    switchTagActive:0,
                                                    tagData:{},
                                                    showAllCates:false
                                                },()=>{

                                                    const tagsa = cates && cates[index]?cates[index].tags:[];

                                                    if (tagsa.length>0) {
                                                        this.getTagContext(tagsa[0]);
                                                    }
                                                });
                                            }}>
                                                <Image src={item.image} className='img' />
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
                                                const tagsa = cates && cates[index]?cates[index].tags:[];
                                                if (tagsa.length>0) {
                                                    this.getTagContext(tagsa[0]);
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
                    <View className='left-menu' id="template_left_menu" style={`height:${otherHeight}px;background:#FFF`}>
                        <ScrollView scrollY className='left-scroll' style={`height:${otherHeight}px;background:#FFF`}>
                            {
                                tags && tags.map((item,index)=>(
                                    <View className={switchTagActive==index?'item active':"item"} key={item.id} onClick={()=>{
                                        if (switchTagActive != index) {
                                            this.setState({
                                                switchTagActive:index,
                                                tagData:{}
                                            },()=>{
                                                this.getTagContext(item)
                                            });
                                        }
                                    }}>
                                        <Text className='txt'>{item.name}</Text>
                                    </View>
                                ))
                            }
                        </ScrollView>
                    </View>
                    <ScrollView scrollY className='right-scroll' style={`width:${mainRightWidth}px;padding-top:${Taro.pxTransform(32)}`} onScrollToLower={this.onScrollToLower}>
                        <View className='warp' style={`width:${mainRightWidth}px;padding:0 14px;box-sizing:border-box;column-gap:14px`}>
                            {
                                !showTemplateLoading && cates && cates[switchActive] &&cates[switchActive].tpl_type == "photo"?<View className='print-box' style={`width:${(mainRightWidth-(14*3))/2}px;height:${(mainRightWidth-(14*3))/2}px;`} onClick={()=>{
                                    // @ts-ignore
                                    if (!this.showLoginModal()) {
                                        return
                                    }
                                    Taro.navigateTo({
                                        url:`pages/printing/index?id=34`
                                    })
                                }}>
                                    <View className='print-warp' style={`width:${(mainRightWidth-(14*3))/2}px;height:${(mainRightWidth-(14*3))/2}px;`}>
                                        <Image src={require("../../source/editor-print.png")} className='print' />
                                        <Text className='print-txt'>直接冲印</Text>
                                    </View>
                                    <View className='nook'>
                                        <Text className='ntxt'>快速</Text>
                                    </View>
                                </View>:<AtActivityIndicator isOpened={showTemplateLoading} mode='center'></AtActivityIndicator>
                            }

                            {
                                tagList.map((item)=>(

                                    <View className='pic-box' style={cates && cates[switchActive] &&cates[switchActive].tpl_type == "phone" ?`width:${(mainRightWidth-(14*3))/2}px;height:${((mainRightWidth-(14*3))/2)/(795/1635)}px;`:`width:${(mainRightWidth-(14*3))/2}px;height:${((mainRightWidth-(14*3))/2)/(item.attr.width/item.attr.height)}px;`} onClick={()=>{
                                        // templateStore.selectItem = item;
                                        if (cates && cates[switchActive] &&cates[switchActive].tpl_type == "phone") {
                                            Taro.navigateTo({
                                                url:`/pages/template/detail?id=${item.id}&cid=${cates[switchActive].tpl_category_id}`
                                            });
                                        }
                                        if (cates && cates[switchActive] &&cates[switchActive].tpl_type == "photo") {
                                            // @ts-ignore
                                            if (!this.showLoginModal()) {
                                                return
                                            }
                                            Taro.navigateTo({
                                                url:`/pages/printing/index?id=34&imgid=${item.id}&img=${item.thumb_image}&attr=${item.attr.width+"*"+item.attr.height}&status=t`
                                            });
                                        }
                                    }} key={item.id}>
                                        {
                                            cates && cates[switchActive] &&cates[switchActive].tpl_type == "phone" ?<View className='ke' style={`width:${(mainRightWidth-(14*3))/2}px;height:${((mainRightWidth-(14*3))/2)/(795/1635)}px;`}>
                                                <Image src={ossUrl(item.thumb_image,1)} className='item' style={`width:${(mainRightWidth-(14*3))/2}px;height:${((mainRightWidth-(14*3))/2)/(795/1635)}px;border-radius: ${Taro.pxTransform(48)};`} mode='scaleToFill' />
                                                <Image src={require('../../source/ke.png')} className='phone' style={`width:${(mainRightWidth-(14*3))/2}px;height:${((mainRightWidth-(14*3))/2)/(795/1635)}px;`} mode='scaleToFill' />
                                            </View>:<Image src={ossUrl(item.thumb_image,1)} className='item' style={`width:${(mainRightWidth-(14*3))/2}px;height:${((mainRightWidth-(14*3))/2)/(item.attr.width/item.attr.height)}px;border-radius: ${Taro.pxTransform(16)};`} />
                                        }
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
