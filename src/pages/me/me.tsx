import { ComponentType } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image } from '@tarojs/components'
import './me.less'
import IconFont from '../../components/iconfont';

// import {TaroPopover} from '../../components/popmenu';
// import { AtModal } from 'taro-ui';
// / npx iconfont-taro
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
        return (
            <View className='me'>
                <View className='topBox' ref={(node) =>{
                    console.log(node)
                }}>
                    <View className='top'>
                        {/* <IconFont name={"iconsaoyisao"} size={48} color="#121314"/> */}
                        <View className="ops">
                            <View className='cart'><IconFont name={"gouwuche"} size={24} color="#121314"/></View>
                            <View className='coupon'><IconFont name={"youhuiquan"} size={24} color="#121314"/></View>
                            <View className='set'><IconFont name={"shezhi"} size={24} color="#121314"/></View>
                        </View>
                    </View>
                    <View className='baseInfo' onClick={()=>{
                        Taro.navigateTo({
                            url:'/pages/login/index'
                        })
                    }}>
                        <View className="avator"></View>
                        <Text className='nickname'>Hi，未登录</Text>
                    </View>
                    <View className='orderWarp'>
                        <View className='myorall'>
                            <Text className='myorder'>我的订单</Text>
                            <View className='allorder'>
                                <Text>全部订单</Text>
                                <IconFont name={"xiayiye1"} size={18} color="#9C9DA6"/>
                            </View>
                        </View>
                        <View className='orderstate'>
                            <View className='oitem'>
                                <IconFont name={"daifukuan"} size={24} color="#121314"/>
                                <Text className='orderText'>待付款</Text>
                            </View>
                            <View className='oitem'>
                                <IconFont name={"daifahuo"} size={24} color="#121314"/>
                                <Text className='orderText'>待发货</Text>
                            </View>
                            <View className='oitem'>
                                <IconFont name={"daishouhuo"} size={24} color="#121314"/>
                                <Text className='orderText'>待收货</Text>
                            </View>
                            <View className='oitem'>
                                <IconFont name={"shouhou"} size={24} color="#121314"/>
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
                                <View className='more'>
                                    {/* <TaroPopover list={list} label='label' onTabItem={this.onTabItem}> */}
                                        <IconFont name="gengduo" size={24} color="#9C9DA6"/>
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
                                    {/* <TaroPopover list={list} label='label' onTabItem={this.onTabItem}> */}
                                        <IconFont name="gengduo" size={24} color="#9C9DA6"/>
                                    {/* </TaroPopover> */}
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
                {/* <AtModal
                    isOpened
                    title='标题'
                    cancelText='取消'
                    confirmText='确认'
                    onClose={ ()=>{} }
                    onCancel={ ()=>{} }
                    onConfirm={ ()=>{} }
                    content='欢迎加入京东凹凸实验室\n\r欢迎加入京东凹凸实验室'
                /> */}
            </View>
        )
    }
}
