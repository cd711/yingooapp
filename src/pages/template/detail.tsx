import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image,ScrollView } from '@tarojs/components'
import './detail.less';
import IconFont from '../../components/iconfont';
import { api } from '../../utils/net'
import { observer, inject } from '@tarojs/mobx';
// import moment from 'moment';
import {ossUrl} from '../../utils/common'

import page from '../../utils/ext';

@inject("templateStore")
@observer
@page({wechatAutoLogin:true})
export default class Detail extends Component<{},{
    isLike:boolean;
    likeList:Array<any>;
    currentItem:any;
    isOpened: boolean;
    scrollTop:number
}> {

    config: Config = {
        navigationBarTitleText: '模板详情'
    }
    constructor(props){
        super(props);
        this.state = {
            isLike:false,
            likeList:[],
            currentItem:{},
            isOpened: false,
            scrollTop:0
        }
    }
    // private lastBottomTime = 0;

    componentDidMount() {
        // const {selectItem} = templateStore;
        const url = window.location.href;
        window.history.pushState(null,null,'/pages/template/index');
        window.history.pushState(null,'模板详情',url);
        const { id,cid } = this.$router.params
        if (!id || !cid) {
            Taro.navigateBack();
        }

        if (parseInt(id)>0) {
            this.getCurrentItem(id);
        }

        // this.lastBottomTime = moment().unix();

    }
    getCurrentItem(id){
        Taro.showLoading({title:"加载中..."});
        api('app.product_tpl/info',{id}).then((res)=>{
            if (this.$router.params.id != res.id) {
                window.history.replaceState(null,null,`/pages/template/detail?id=${res.id}&cid=${this.$router.params.cid}`)
            }

            this.setState({

                currentItem: res,
                isLike: res.favorite !== 0
            });
            this.getLikeList(res.category_id);
        }).catch((e)=>{
            Taro.hideLoading();
            Taro.showToast({
                title:e,
                icon:'none',
                duration:2000
            })
            setTimeout(() => {
                Taro.navigateBack();
            }, 2000);
        })
    }
    getLikeList = (id) => {
        api("app.product_tpl/like",{
            size:20,
            start:0,
            category_id:id
        }).then((res)=>{
            Taro.hideLoading();
            this.setState({
                likeList:res
            })
        }).catch((e)=>{
            Taro.showToast({
                title:e,
                icon:'none',
                duration:2000
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
        // @ts-ignore
        if (!this.showLoginModal()) {
            return
        }
        const {currentItem} = this.state;
        Taro.navigateTo({
            url:`/pages/editor/index?tpl_id=${currentItem.id}&cid=${currentItem.category_id}`
        });
    }

    collectedProd = async () => {
        const {isLike, currentItem} = this.state;
        try{
            await api("app.profile/favorite", {
                id: currentItem.id,
                model: "tpl_product",
                status: isLike ? 0 : 1
            })
            Taro.showToast({
                title: `${isLike ? "取消收藏成功" : "收藏成功"}`
            })
            this.setState({isLike: !isLike})
        }catch (e) {
            console.log(`${isLike ? "取消收藏失败" : "收藏失败"}：`, e)
        }
    }

    render() {
        const { isLike,likeList,currentItem, scrollTop } = this.state;
        return (
            <View className='detail'>
                <View className='nav-bar'>
                    <View className='left' onClick={() => {
                        window.location.href = '/template';
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314'/>
                    </View>
                    <View className='center'>
                        <Text className='title'>{`ID:${currentItem.id}`}</Text>
                    </View>
                </View>
                <ScrollView scrollY className='detail_page_scroll' scrollTop={scrollTop}>
                    <View className='shell_thumb' style={`height:${Taro.pxTransform(472/(795/1635))}`}>
                        <Image src={ossUrl(currentItem.thumb_image,1)} className='thumb' mode='aspectFill' style={`height:${Taro.pxTransform(472/(795/1635))}`}/>
                        <Image src={require('../../source/ke.png')} className='shell' mode='scaleToFill' style={`height:${Taro.pxTransform(472/(795/1635))}`}/>
                    </View>
                    <View className='doyoulike'>
                        <View className='opsline'></View>
                        <Text className='liketxt'>猜你喜欢</Text>
                        <View className='like-list'>
                            {
                                likeList && likeList.map((item)=>(
                                    <View className='item' onClick={()=>{
                                        this.getCurrentItem(item.id);
                                        this.setState({
                                            scrollTop:0
                                        })
                                    }} key={item.id}>
                                        <Image src={ossUrl(item.thumb_image,1)} className='image' mode='aspectFill' />
                                    </View>
                                ))
                            }
                        </View>
                    </View>
                </ScrollView>
                <View className='bottom_bar'>
                    <View className='favorite' onClick={this.collectedProd}>
                        <IconFont name={isLike?'24_shoucangB':'24_shoucangA'} size={48} color={isLike?'#FFAF39':'#707177'} />
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
