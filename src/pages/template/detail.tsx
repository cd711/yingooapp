import { ComponentType } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input,Image } from '@tarojs/components'
import './detail.less';
import IconFont from '../../components/iconfont';
import { api } from '../../utils/net'
import { AtNavBar} from 'taro-ui'
import {templateStore} from '../../store/template';
import { observer, inject } from '@tarojs/mobx';
// import { AtLoadMore } from 'taro-ui';
// import lodash from 'lodash';
import moment from 'moment';
import {ossUrl} from '../../utils/common'
// interface LikeData{
//     list:Array<any>,
//     size:number,
//     start:number,
//     total:number
// }

@inject("templateStore")
@observer
export default class Detail extends Component<any,{
    isLike:boolean;
    likeList:Array<any>;
    loadLikeList:boolean;
    currentItem:any;
}> {

    config: Config = {
        navigationBarTitleText: '模板详情'
    }
    constructor(props){
        super(props);
        this.state = {
            isLike:false,
            likeList:[],
            loadLikeList:false,
            currentItem:{}
        }
    }
    private lastBottomTime = 0;
    componentWillMount() { }

    componentDidMount() { 
        // const {selectItem} = templateStore;
        const { id } = this.$router.params
        if (!id) {
            Taro.navigateBack();
        }
        api('app.product_tpl/info',{id}).then((res)=>{
            console.log(res);
            this.setState({
                currentItem:res
            })
        }).catch((e)=>{
            console.log(e);
        })
        this.lastBottomTime = moment().unix();
        this.getLikeList();
    }

    getLikeList = () => {
        Taro.showLoading({title:"加载中..."});
        api("app.product_tpl/like",{
            size:20,
            start:0
        }).then((res)=>{
            Taro.hideLoading();
            this.setState({
                likeList:res
            })
        }).catch((e)=>{
            Taro.hideLoading();
            Taro.showToast({
                title:e,
                icon:'none',
                duration:2000
            })
        })
    }
    
    onPageScroll(){
        const query = Taro.createSelectorQuery;
        query().select(".taro-tabbar__panel").fields({
            scrollOffset: true,
        },(e)=>{
            // console.log(e.scrollHeight);
            let scrollHeight = e.scrollHeight;
            let scrollTop = e.scrollTop;
            const clientHeight = Taro.getSystemInfoSync().windowHeight;
            let distance = 300;  //距离视窗还用50的时候，开始触发；
            const nowUnixTime = moment().unix();
            if ((scrollTop + clientHeight) >= (scrollHeight - distance) && nowUnixTime - this.lastBottomTime>2) {
                this.lastBottomTime = nowUnixTime;
                // this.getLikeList();
                console.log("触及底线了...")
                // Taro.setNavigationBarTitle({
                //     title:`${nowUnixTime}`
                // })
            }
          }).exec();        
    }
    

    render() {
        const { isLike,likeList,currentItem } = this.state;
        return (
            <View className='detail'>
                <AtNavBar
                    onClickLeftIcon={()=>{
                        Taro.navigateBack();
                    }}
                    color='#121314'
                    title={`ID:${currentItem.id}`}
                    border={false}
                    fixed
                    leftIconType={{
                        value:'chevron-left',
                        color:'#121314',
                        size:24
                    }}
                />
                {/* style={`height:${236/(selectItem.attr.width/selectItem.attr.height)}px`} */}
                <Image src={ossUrl(currentItem.thumb_image,1)} className='thumb' mode="aspectFill" />
                <View className='doyoulike'>
                    <View className='opsline'></View>
                    <Text className='liketxt'>猜你喜欢</Text>
                    <View className='like-list'>
                        {
                            likeList && likeList.map((item)=>(
                                <View className='item' onClick={()=>{

                                }}>
                                    <Image src={ossUrl(item.thumb_image,1)} className='image' mode='aspectFill'/>
                                </View>
                            ))
                        }
                    </View>
                </View>
                <View className='bottom_bar'>
                    <View className='favorite' onClick={()=>{
                        this.setState({
                            isLike:!isLike
                        })
                    }}>
                        <IconFont name={isLike?'24_shoucangB':'24_shoucangA'} size={48} color="#707177" />
                        <Text className='txt'>收藏</Text>
                    </View>
                    <View className='now-editor' onClick={()=>{
                        Taro.navigateTo({
                            url:`/pages/editor/index?tpl_id=${currentItem.id}`
                        })
                    }}>
                        <Text className='txt'>立即编辑</Text>
                    </View>
                </View>

            </View>
        )
    }
}
