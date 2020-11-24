import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Button, Image,ScrollView } from '@tarojs/components'
import './ticket.less'
import { api } from '../../utils/net'
import {userStore} from "../../store/user";
import { observer, inject } from '@tarojs/mobx'
import IconFont from '../../components/iconfont'
import page from '../../utils/ext';
import { ListModel } from '../../utils/common';
import Ticket from '../../components/ticket/Ticket';
import LoadMore, {LoadMoreEnum} from "../../components/listMore/loadMore";

const tabs = ["全部","未使用","已使用","已失效"];

@inject("userStore")
@observer
@page({wechatAutoLogin:true})
export default class Login extends Component<{},{
    data:ListModel,
    switchTabActive:number,
    listLoading:boolean,
    loadStatus:LoadMoreEnum
}> {
    config: Config = {
        navigationBarTitleText: '优惠券'
    }
    constructor(props){
        super(props);
        this.state ={
            data:{
                list:[],
                start:0,
                size:0,
                total:0
            },
            switchTabActive:0,
            listLoading:false,
            loadStatus:LoadMoreEnum.loading
        }
    }


    componentDidMount(){
        const {tab} = this.$router.params;
        const {data,switchTabActive} = this.state;
        if(parseInt(tab)>=0){
            if (switchTabActive != parseInt(tab)) {
                this.setState({
                    switchTabActive:parseInt(tab)
                });
            }
            if (parseInt(tab) == 0 && data.list.length == 0) {
                this.getList(0);
            }
        }else {
            this.getList(0);
        }
    }

    componentDidUpdate(_,prevState){
        const {switchTabActive} = this.state;
        if (switchTabActive != prevState.switchTabActive) {
            this.setState({
                data:{
                    list:[],
                    start:0,
                    size:0,
                    total:0
                }
            });
            setTimeout(() => {
                this.getList(switchTabActive)
            }, 100);
        }
    }
    getList = (status:number) => {
        const {data} = this.state;
        this.setState({
            listLoading:true,
            loadStatus:LoadMoreEnum.loading
        })
        const list = data && data.list && data.list.length>0 ? data.list:[];
        api("app.coupon/index",{
            status,
            start:list.length,
            size:8
        }).then((res)=>{
            res.list = list.concat(res.list);
            console.log("api",res.list)
            this.setState({
                listLoading:res.total==res.list.length && res.list.length >0?true:false,
                loadStatus:res.total==res.list.length&& res.list.length >0?LoadMoreEnum.noMore:LoadMoreEnum.loading,
                data:res
            });
        }).catch(()=>{
            this.setState({
                listLoading:false,
                data:{
                    list:[],
                    start:0,
                    size:0,
                    total:0
                }
            });
            Taro.reLaunch({
                url:'/pages/me/me'
            });
        })
    }
    onLoadMore = () => {
        console.log("触底")
        const {data,listLoading,switchTabActive} = this.state;
        if (!listLoading && data.total>data.list.length) {
            this.getList(switchTabActive);
        }
    }
    render() {
        const {data,switchTabActive,listLoading,loadStatus} = this.state;
        const list = data && data.list && data.list.length>0 ? data.list:[];
        return (
            <View className='ticket_page'>
                <View className='nav-bar'>
                    <View className='left' onClick={() => {
                        Taro.reLaunch({
                            url:'/pages/me/me'
                        });
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314'/>
                    </View>
                    <View className='center'>
                        <Text className='title'>{this.config.navigationBarTitleText}</Text>
                    </View>
                </View>
                <View className='container'>
                    <View className='status-switch-bar'>
                        {
                            tabs.map((item,index)=>(
                                <View className={switchTabActive==index?'item active':'item'} onClick={()=>{
                                    this.setState({
                                        switchTabActive:index
                                    });
                                    window.history.replaceState(null,this.config.navigationBarTitleText,`/pages/me/ticket?tab=${index}`);
                                }} key={index}>
                                    <Text className='txt'>{item}</Text>
                                    {switchTabActive==index?<Image src={require("../../source/switchBottom.png")} className='img' />:null}
                                </View>
                            ))
                        }
                    </View>
                    {
                        list.length>0?<ScrollView scrollY className='ticket_list_scroll' onScrollToLower={this.onLoadMore}>
                            <View className='ticket_list'>
                            {
                                list.map((item)=>(
                                    <View style={item.status ==2||item.status ==3?'filter: grayscale(100%);':''}>
                                        <Ticket isNew={false} key={item.id} ticket={item.coupon} right={
                                            <View className='item_right'>
                                                {
                                                    item.status == 1?<Button className='use_button' onClick={()=>{
                                                        if (item.coupon.use_url && item.coupon.use_url.length>0) {
                                                            Taro.reLaunch({
                                                                url:item.coupon.use_url
                                                            });
                                                        }
                                                    }}>使用</Button>:(item.status == 2?<Text className='used_txt'>已使用</Text>:item.status==3?<Image className='ticket_fuck' src={require("../../source/ticket_fuck.svg")}/>:null)
                                                }
                                            </View>
                                        }/>
                                    </View>
                                ))
                            }
                            {
                                listLoading?<LoadMore status={loadStatus} />:null
                            }
                            <View style={{height:16}}></View>
                            </View>
                        </ScrollView>:(listLoading?<LoadMore status="loading" />:<View className='black'>
                            <Image src={require("../../source/ticket_black.svg")} className='img'/>
                            <Text className='txt'>暂无优惠券</Text>
                        </View>)
                    }
                    
                </View>
            </View>
        )
    }
}