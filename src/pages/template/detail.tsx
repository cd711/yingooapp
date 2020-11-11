import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image } from '@tarojs/components'
import './detail.less';
import IconFont from '../../components/iconfont';
import { api } from '../../utils/net'
import {AtModal, AtNavBar} from 'taro-ui'
// import {templateStore} from '../../store/template';
import { observer, inject } from '@tarojs/mobx';
// import { AtLoadMore } from 'taro-ui';
// import lodash from 'lodash';
import moment from 'moment';
import {notNull, ossUrl} from '../../utils/common'
import {userStore} from "../../store/user";
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
    currentItem:any;
    isOpened: boolean
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
            isOpened: false
        }
    }
    private lastBottomTime = 0;

    componentDidMount() {
        // const {selectItem} = templateStore;
        const { id,cid } = this.$router.params
        if (!id || !cid) {
            Taro.navigateBack();
        }
        this.getCurrentItem(id);
        this.lastBottomTime = moment().unix();
        this.getLikeList();
    }
    getCurrentItem(id){
        api('app.product_tpl/info',{id}).then((res)=>{
            if (this.$router.params.id != res.id) {
                window.history.replaceState(null,null,`/pages/template/detail?id=${res.id}&cid=${this.$router.params.cid}`)
            }
            console.log("info",res)
            this.setState({
                currentItem:res
            })
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
            const scrollHeight = e.scrollHeight;
            const scrollTop = e.scrollTop;
            const clientHeight = Taro.getSystemInfoSync().windowHeight;
            const distance = 300;  //距离视窗还用50的时候，开始触发；
            const nowUnixTime = moment().unix();
            if ((scrollTop + clientHeight) >= (scrollHeight - distance) && nowUnixTime - this.lastBottomTime>2) {
                this.lastBottomTime = nowUnixTime;
                console.log("触及底线了...");
            }
          }).exec();
    }

    onEditor = () => {
        const {currentItem} = this.state;
        const {id} = userStore;
        if (notNull(id)) {
            this.setState({isOpened: true})
            return
        }
        Taro.navigateTo({
            url:`/pages/editor/index?tpl_id=${currentItem.id}&cid=${currentItem.category_id}`
        });
    }

    render() {
        const { isLike,likeList,currentItem, isOpened } = this.state;
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
                {
                    isOpened
                        ? <AtModal
                            className="modal_confirm_container"
                            isOpened={isOpened}
                            cancelText='取消'
                            confirmText='前往登录'
                            onCancel={() => this.setState({isOpened: false})}
                            onConfirm={() => window.location.replace(`/pages/login/index`)}
                            content='检测到您还未登录，请登录后操作!'
                        />
                        : null
                }
                {/* style={`height:${236/(selectItem.attr.width/selectItem.attr.height)}px`} */}
                <Image src={ossUrl(currentItem.thumb_image,1)} className='thumb' mode='aspectFill' />
                <View className='doyoulike'>
                    <View className='opsline'></View>
                    <Text className='liketxt'>猜你喜欢</Text>
                    <View className='like-list'>
                        {
                            likeList && likeList.map((item)=>(
                                <View className='item' onClick={()=>{
                                    this.getCurrentItem(item.id);
                                    Taro.pageScrollTo({
                                        scrollTop:0,
                                        duration:100
                                    })
                                }} key={item.id}>
                                    <Image src={ossUrl(item.thumb_image,1)} className='image' mode='aspectFill' />
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
                        <IconFont name={isLike?'24_shoucangB':'24_shoucangA'} size={48} color='#707177' />
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
