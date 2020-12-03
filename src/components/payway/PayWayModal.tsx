
import Taro, { useEffect,useState } from '@tarojs/taro'
import { View, Text,Button } from '@tarojs/components'
import './PayWayModal.less';
import FloatModal from '../floatModal/FloatModal';
import IconFont from '../iconfont';
import Checkboxs from '../checkbox/checkbox';
import { api } from '../../utils/net';
import wx from 'weixin-js-sdk'
import {is_weixin,jsApiList} from '../../utils/common';





const PayWayModal: Taro.FC<{
    isShow:boolean,
    totalPrice:string,

    onResult?:(res:any)=>void,
    onClose:()=>void,
    order_sn:string,
}> = ({isShow,totalPrice,order_sn,onResult,onClose}) => {
    const [isOpened,setIsOpened] = useState(false);
    const [price,setPrice] = useState("0.00");
    let payway = [
        {
            icon:'32_weixinzhifu',
            name:'微信',
            value:'wechat',
            checked:true
        },
        {
            icon:'32_zhifubaozhifu',
            name:'支付宝',
            value:'alipay',
            checked:false
        }
    ]
    if (is_weixin()) {
        payway = [
            {
                icon:'32_weixinzhifu',
                name:'微信',
                value:'wechat',
                checked:true
            }
        ]
    }
    const [ways,setWays] = useState(payway);
    const [payWay,setPayWay] = useState('wechat');
    const [orderSN,setOrderSN] = useState("");
    useEffect(()=>{
        if (isOpened != isShow) {
            setIsOpened(isShow);
        }
    },[isShow]);
    useEffect(()=>{
        if (order_sn != orderSN) {
            setOrderSN(order_sn);
        }
    },[order_sn])
    useEffect(()=>{
        if (price != totalPrice) {
            setPrice(totalPrice);
        }
    },[totalPrice])

    const setWXpayConfig = (callback:()=>void,errorback:(err:any)=>void) =>{
        api("wechat/jssdkconfig",{
            url:window.location.href
        }).then((res)=>{
            wx.config({
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: res.appId, // 必填，公众号的唯一标识
                timestamp: res.timestamp, // 必填，生成签名的时间戳
                nonceStr: res.nonceStr, // 必填，生成签名的随机串
                signature: res.signature,// 必填，签名
                jsApiList: jsApiList // 必填，需要使用的JS接口列表
            });
            wx.ready(()=>{
                if (callback) callback()
            })
        }).catch((e)=>{
            console.log(e)
            errorback(e)
        })
    }
    const payOrder = (d:any,callback:(res: any)=>void,errorback:(err:any)=>void) =>{
        api("app.pay/index",d).then((res)=>{
            callback && callback(res);
        }).catch((e)=>{
            console.log("app.pay/index",e);
            errorback && errorback(e);
        })
    }
    function onSurePay(){
        if (orderSN.length<=0) {
            setIsOpened(false)
            Taro.hideLoading();
            Taro.showToast({
                title:"订单号异常",
                icon:'none',
                duration:2000
            });
            setTimeout(() => {
                Taro.navigateTo({
                    url:'/pages/me/order?tab=0'
                })
            }, 2000);
            return;
        }
        // if (totalPrice && parseInt(totalPrice+"")==0 && parseInt(payStatus+"")>0) {
        //     window.history.pushState(null,null,'/pages/me/me')
        //     window.history.pushState(null,null,'/pages/me/order?tab=0')
        //     Taro.navigateTo({
        //         url:`/pages/template/success?pay_order_sn=${orderSN}`
        //     });
        //     return;
        // }
        Taro.showLoading({title:"支付中..."});
        if (is_weixin()) {
            // d["pay_method"] = 'mp';
            setWXpayConfig(()=>{
                const d = {
                    order_sn:orderSN,
                    pay_type:payWay,
                    pay_method:'mp'
                }
                payOrder(d,(res)=>{
                    wx.chooseWXPay({
                        timestamp: res.payinfo.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                        nonceStr: res.payinfo.nonceStr, // 支付签名随机串，不长于 32 位
                        package: res.payinfo.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
                        signType: res.payinfo.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                        paySign: res.payinfo.paySign, // 支付签名
                        success: function (result) {
                            // alert(JSON.stringify(result));
                            Taro.hideLoading();
                            const d = {
                                code:1,
                                way:"wechat",
                                total:totalPrice,
                                data:result
                            }
                            onResult && onResult(d);
                        },
                        cancel:(e)=>{
                            console.log(e)
                            Taro.hideLoading();
                            const d = {
                                code:2,
                                data:e.errMsg
                            }
                            onResult && onResult(d);
                        },
                        fail:(e) => {
                            Taro.hideLoading();
                            const d = {
                                code:3,
                                data:e.errMsg
                            }
                            onResult && onResult(d);
                        }

                    });
                },(e)=>{
                    setIsOpened(false)
                    Taro.hideLoading();
                    Taro.showToast({
                        title:e,
                        icon:'none',
                        duration:2000
                    });
                    setTimeout(() => {
                        Taro.navigateTo({
                            url:'/pages/me/order?tab=0'
                        })
                    }, 2000);
                });
            },(e)=>{
                setIsOpened(false)
                Taro.hideLoading();
                Taro.showToast({
                    title:e,
                    icon:'none',
                    duration:2000
                });
                setTimeout(() => {
                    Taro.navigateTo({
                        url:'/pages/me/order?tab=0'
                    })
                }, 2000);
            })
        } else {
            const d = {
                order_sn:orderSN,
                pay_type:payWay,
                pay_method:'wap'
            }
            payOrder(d,(res)=>{
                setIsOpened(false)
                window.history.pushState(null,null,'/pages/me/order?tab=0');
                setTimeout(() => {
                    window.location.href = res.payinfo;
                }, 1000);
            },(e)=>{
                Taro.hideLoading();
                const d = {
                    code:0,
                    data:e
                }
                onResult && onResult(d);
            })
        }
    }
    return <View className='paywaymodal'>
        <FloatModal isShow={isOpened} onClose={onClose}>
            <View className='pay-way-modal-content'>
                <View className='price-item'>
                    <Text className="txt">您需要支付</Text>
                    <View className='price'>
                        <Text className='left'>¥</Text>
                        <Text className='right'>{totalPrice}</Text>
                    </View>
                </View>
                <View className='way-list'>
                    {
                        ways.map((item,index)=>(
                            <PayWay isCheck={item.checked} icon={item.icon} name={item.name} onPress={()=>{
                                setPayWay(item.value)
                                const w = ways.map((it,idx)=>{
                                    it.checked = idx == index?true:false;
                                    return it;
                                });
                                setWays(w)
                            }} key={index+""} />
                        ))
                    }
                </View>
                <Button className='pay-btn' onClick={onSurePay}>确定支付</Button>
            </View>
        </FloatModal>
</View>
}
const PayWay: Taro.FC<any> = ({isCheck,icon,name,onPress}) => {
    const [isSelect,setIsSelect] = useState(false);
    useEffect(()=>{
        if (isCheck != isSelect) {
            setIsSelect(isCheck);
        }
    },[isCheck])
    return  <View className={isSelect?'xy_pay_way_item xy_pay_way_item_active':'xy_pay_way_item'} onClick={()=>{
                setIsSelect(true);
                onPress && onPress()
            }}>
            <View className='name'>
                <IconFont name={icon} size={64} />
                <Text className='txt'>{name}</Text>
            </View>
            <Checkboxs isChecked={isSelect} disabled />
        </View>
}
export default PayWayModal;
