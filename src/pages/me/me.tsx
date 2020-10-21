import { ComponentType } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image } from '@tarojs/components'
import './me.less'
import IconFont from '../../components/iconfont';

import {TaroPopover} from '../../components/popmenu';
// import { AtModal } from 'taro-ui';
// / npx iconfont-taro
import {userStore} from "../../store/user";
import { observer, inject } from '@tarojs/mobx'


const switchBottom = require("../../source/switchBottom.png");
const list=[
    {
      id: 1,
      label: 'item1'
    },
    {
      id: 2,
      label: 'item2'
    },
    {
      id: 3,
      label: 'item3'
    }
];

@inject("userStore")
@observer
export default class Me extends Component<any,{
    switchActive:number;
}> {
    config: Config = {
        navigationBarTitleText: '我的'
      }
    constructor(props){
        super(props);
        this.state = {
            switchActive:0
        }
    }

    componentWillMount() { }

    componentDidMount() { 

    }

    componentWillUnmount() { }

    componentDidShow() { }
    
    componentDidHide() { }
    onTabItem=(item)=>{
        console.log(item)
      }
    
    render() {
        const {switchActive} = this.state;
        const {id,nickname} = userStore;
        return (
            <View className='me'>
                <View className='topBox' ref={(node) =>{
                    // console.log(node)
                }}>
                    <View className='top'>
                        {/* <IconFont name={"iconsaoyisao"} size={48} color="#121314"/> */}
                        <View className="ops">
                            <View className='cart'><IconFont name={"24_gouwuche"} size={24} color="#121314"/></View>
                            <View className='coupon'><IconFont name={"24_youhuiquan"} size={24} color="#121314"/></View>
                            <View className='set'><IconFont name={"24_shezhi"} size={24} color="#121314"/></View>
                        </View>
                    </View>
                    <View className='baseInfo' onClick={()=>{
                        if (id>0) {
                            return;
                        }
                        Taro.redirectTo({
                            url:'/pages/login/index'
                        })
                    }}>
                        <View className="avator">
                            <Image src={require('../../source/defaultAvatar.png')} className='avatarImg'/>
                        </View>
                        {/* todo: 昵称6个字 */}
                        <Text className='nickname'>{nickname.length>0?`Hi，${nickname}`:"Hi，未登录"}</Text>
                    </View>
                    <View className='orderWarp'>
                        <View className='myorall'>
                            <Text className='myorder'>我的订单</Text>
                            <View className='allorder'>
                                <Text>全部订单</Text>
                                <IconFont name={"16_xiayiye"} size={18} color="#9C9DA6"/>
                            </View>
                        </View>
                        <View className='orderstate'>
                            <View className='oitem'>
                                <IconFont name={"24_daifukuan"} size={24} color="#121314"/>
                                <Text className='orderText'>待付款</Text>
                            </View>
                            <View className='oitem'>
                                <IconFont name={"24_daifahuo"} size={24} color="#121314"/>
                                <Text className='orderText'>待发货</Text>
                            </View>
                            <View className='oitem'>
                                <IconFont name={"24_daishouhuo"} size={24} color="#121314"/>
                                <Text className='orderText'>待收货</Text>
                            </View>
                            <View className='oitem'>
                                <IconFont name={"24_shouhou"} size={24} color="#121314"/>
                                <Text className='orderText'>售后</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View className="container">
                    <View className='switchBox'>
                        <View className='switchBar'>
                            {
                                ["作品","喜欢","收藏"].map((item,index)=>(
                                    <View className={index==switchActive?'item active':'item'} key={index+""} onClick={()=>{
                                        this.setState({switchActive:index})
                                    }}>
                                        <Text className='text'>{item}</Text>
                                        {index==switchActive?<Image className='icon' src={switchBottom} />:null}
                                    </View>
                                ))
                            }
                        </View>
                        <Text className='total'>共18个</Text>
                    </View>
                    <View className='content'>
                        <View className='item'>
                            <View className='dates'>
                                <View className='day'>
                                    <View className='circle'>
                                        <Text className='text'>23</Text>
                                    </View>
                                </View>
                                <Text className='date'>9月23日</Text>
                                <View className='more' onClick={(e)=>{
                                    // @ts-ignore
                                    console.log(e.y,e.currentTarget.clientWidth)
                                    Taro.createSelectorQuery().select(".taro-tabbar__panel").scrollOffset((_view: any) => {

                                        console.log(_view.scrollTop)
                                    }).exec();
                                }}>
                                    {/* <TaroPopover list={list} label='label' onTabItem={this.onTabItem}> */}
                                        <IconFont name="24_gengduo" size={24} color="#9C9DA6"/>
                                    {/* </TaroPopover> */}
                                </View>
                                
                            </View>
                            <View className="box">
                                <View className="cns">
                                    <Text className='neir'>发布作品《映果果饮品日记》</Text>
                                    <View className="docker">
                                        <Text className="nook">已打印</Text>
                                        <Image src="" className='pic'/>
                                    </View>
                                    
                                </View>
                            </View>
                        </View> 

                        <View className='item'>
                            <View className='dates'>
                                <View className='day'>
                                    <View className='circle'>
                                        <Text className='text'>23</Text>
                                    </View>
                                </View>
                                <Text className='date'>9月23日</Text>
                                <View className='more'>
                                    <TaroPopover list={list} label='label' onTabItem={this.onTabItem}>
                                        <IconFont name="24_gengduo" size={24} color="#9C9DA6"/>
                                    </TaroPopover>
                                </View>
                            </View>
                            <View className="box">
                                <View className="cns">
                                    <Text className='neir'>发布作品《映果果饮品日记》</Text>
                                    <Image src="" className='pic'/>
                                </View>
                            </View>
                        </View> 

                        <View className="years">
                            <Text className="text">2019</Text>
                        </View>

                        
                    </View>

                </View>

                <View className='sub-menu'>
                    <View className='list'>
                        <View className='triangle'></View>
                        <View className='item'>
                            <IconFont name='24_baocundaoxiangce' size={20} color='#121314' />
                            <Text className='item-text'>保存到相册</Text>
                        </View>
                        <View className='item'>
                            <IconFont name='24_fenxiang' size={20} color='#121314' />
                            <Text className='item-text'>分享</Text>
                        </View>
                        <View className='item'>
                            <IconFont name='24_shanchu' size={20} color='#FF4966' />
                            <Text className='item-text'>删除</Text>
                        </View>
                    </View>
                </View>

            </View>
        )
    }
}
