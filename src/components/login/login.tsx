import Taro, {useState, useEffect} from "@tarojs/taro";
import {View, Text, Button} from "@tarojs/components";
import IconFont from "../iconfont";
import "./login.less"
import {is_weixin, deviceInfo, jumpToPrivacy, updateChannelCode, debuglog} from "../../utils/common";
import Xm from "../../utils/xm";

interface LoginProps {
    isShow:boolean;
    isTabBar:boolean;
    onClose?: (isShow:boolean) => void;
    // 第三方登录点击
    onThirdPartyAuth?: (type: string) => void;
    showClose?: boolean;
}
const Logins: Taro.FC<LoginProps> = (props) => {

    const { isShow,isTabBar,onClose, onThirdPartyAuth } = props;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (visible) {
            if (isTabBar) {
                Taro.hideTabBar();
            }

        } else {
            if (isTabBar) {
                Taro.showTabBar();
            }
            //
            onClose && onClose(visible)
        }
    }, [visible])

    useEffect(()=>{
        debuglog("登录框显示",isShow)
        if (visible != isShow) {
            setVisible(isShow)
        }
    },[isShow])

    const privacyView = type => {
        setVisible(false)
        jumpToPrivacy(type)
    }

    const _onClose = () => {
        setVisible(false);
        if (isTabBar) {
            Taro.showTabBar();
        }
    }
    const onPhone = () =>{
        _onClose();
        setTimeout(()=>{
            Taro.navigateTo({
                url: updateChannelCode('/pages/login/index')
            })
        },200)
    }
    const onWeiXin = () => {
        _onClose();
        const uri = window.location.href;
        Xm.login({
            redirectUrl:uri
        })
    }
    const onQQ = ({detail:{userInfo}}) => {
        if (!userInfo) {
            Taro.showToast({
                title:"允许授权方可登陆!",
                icon:'none',
                duration:1500
            });
            return;
        }
        _onClose();
        Taro.showLoading({title:"正在登录..."})
        Xm.login({
            userInfo:JSON.stringify(userInfo)
       }).then(()=>{
           Taro.hideLoading();
           Taro.showToast({
               title:"登录成功",
               icon:'none',
               duration:1500
           });
       }).catch((e)=>{
            Taro.hideLoading();
            Taro.showToast({
                title:e,
                icon:'none',
                duration:1500
            });
       })
    }


    const onWeapp = ({detail:{userInfo}}) => {
        if (!userInfo) {
            Taro.showToast({
                title:"允许授权方可登陆!",
                icon:'none',
                duration:1500
            });
            return;
        }
        _onClose();
        Taro.showLoading({title:"正在登录..."})
        Xm.login({
            userInfo:JSON.stringify(userInfo)
       }).then(()=>{
           Taro.hideLoading();
           Taro.showToast({
               title:"登录成功",
               icon:'none',
               duration:1500
           });
       }).catch((e)=>{
            Taro.hideLoading();
            Taro.showToast({
                title:e,
                icon:'none',
                duration:1500
            });
       })
    }
    return (
        <View className={`un_login_model ${visible ? "animtion_un_login_model" : ""}`}>
            <View className={`login_model_main ${visible ? "animtion_login_model" : ""}`}>
                <View className="head">
                    <Text className="h2">登录后体验全面功能</Text>
                    <View className="close" onClick={_onClose}><IconFont name="24_guanbi" size={40} /></View>
                </View>
                <View className="login_btn">
                    {
                        is_weixin() ?<Button className="phone_btn_login" onClick={onPhone}>
                            <Text className="txt">手机号登录</Text>
                        </Button>:null
                    }
                    {
                        deviceInfo.env=="weapp"?<Button className="weixin_btn_login" openType="getUserInfo" onGetUserInfo={onWeapp}>
                            <View className='icon'><IconFont name='24_weixin' color="#FFF" size={64} /></View>
                            <Text className="txt">微信一键登录</Text>
                        </Button>:null
                    }
                    {
                        deviceInfo.env=="qq"?<Button className="qq_btn_login" openType="getUserInfo" onGetUserInfo={onWeapp}>
                        <View className='icon'><IconFont name='24_QQ' color="#FFF" size={64} /></View>
                        <Text className="txt">一键登录</Text>
                    </Button>:null
                    }
                    {
                        is_weixin() && deviceInfo.env=="h5" ?<Button className="weixin_btn_login" onClick={onQQ}>
                            <View className='icon'><IconFont name='24_weixin' color="#FFF" size={64} /></View>
                            <Text className="txt">微信一键登录</Text>
                        </Button>:null
                    }
                </View>
                <View className="oth"><Text className="exp">其他方式</Text></View>
                <View className="other_login_way">
                   <View className="item" onClick={onPhone}>
                            <IconFont name="24_shouji" size={48}/><Text className="name">手机登录</Text>
                        </View>
                    {
                        !is_weixin()&& deviceInfo.env=="h5"?<View className="item" onClick={() => onThirdPartyAuth("qq")}>
                            <IconFont name="24_QQ-Color" size={48}/><Text className="name">QQ登录</Text>
                        </View>:null
                    }
                </View>
                <View className="priv_item">
                    <Text className="txt">登录即同意<Text className="link" onClick={() => privacyView(1)}>《映果用户协议》</Text>和<Text className="link" onClick={() => privacyView(2)}>《映果隐私协议》</Text></Text>
                </View>
            </View>
        </View>
    )
}

export default Logins
