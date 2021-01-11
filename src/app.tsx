import Taro, { Component, Config } from '@tarojs/taro'
import { Provider } from '@tarojs/mobx'
import Index from './pages/tabbar/index'
import {userStore} from './store/user'
import {templateStore} from './store/template'
import 'taro-ui/dist/style/index.scss'
import './app.less'
import {options, getUserInfo, api} from './utils/net';
import config from './config';
import Xm from './utils/xm'
import {delCookie, jsApiList, setCookie, shareInfo, updateChannelCode} from "./utils/common";
import wx from 'weixin-js-sdk'

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }
options.apiUrl = config.apiUrl;
options.sourceUrl = config.sourceUrl;
options.editorUrl = config.editorUrl;
options.h5Url = config.h5Url;
options.weappUrl = config.weappUrl;

const store = {
    userStore,
    templateStore
}

class App extends Component {

    // @ts-ignore
    /**
     * 指定config的类型声明为: Taro.Config
     *
     * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
     * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
     * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
     */
    config: Config = {
        pages: [
            'pages/tabbar/index/index',
            'pages/tabbar/me/me',
            'pages/tabbar/cart/index',
            'pages/tabbar/coupon/ticket',
            'pages/tabbar/order/order',

            'pages/login/index',
            'pages/login/set',
            'pages/login/setnew',
            'pages/login/mobile',
            'pages/login/find',
            'pages/login/acount',
            'pages/login/sms',
            'pages/search/index',
            'pages/search/result',
        ],
        subPackages: [
            {
                root: "pages/home",
                pages: [
                    "pages/special"
                ]
            },
            {
                root: "pages/editor",
                // @ts-ignore
                // eslint-disable-next-line no-undef
                pages: preval`
                    module.exports=(function() {
                    const route = [
                        'pages/printing/index',
                        'pages/printing/change',
                    ];
                      if (process.env.TARO_ENV === 'h5') {
                        return [
                            ...route,
                            'pages/shell',
                            'pages/printedit',
                        ]
                      }
                      if (process.env.TARO_ENV === 'weapp') {
                        return [
                            ...route,
                            'pages/wxshell',
                            'pages/wxprintedit',
                        ]
                      }
                    })()
                `,
            },
            // {
            //     root: "pages/cart",
            //     pages: [
            //
            //     ]
            // },
            // {
            //     root: "pages/coupon",
            //     pages: [
            //
            //     ]
            // },
            {
                root: "pages/order",
                pages: [
                    'pages/template/index',
                    'pages/template/detail',
                    'pages/template/preview',
                    'pages/template/confirm',
                    'pages/template/success',
                    'pages/product/detail'
                ]
            },
            {
                root: "pages/me",
                pages: [
                    'pages/me/setting',
                    'pages/me/profile',
                    'pages/me/acount',
                    'pages/me/privacy',
                    'pages/me/aboutus',
                    'pages/me/feedback',
                    'pages/me/orderdetail',
                    'pages/me/address/index',
                    'pages/me/address/editor',
                    'pages/me/photos',
                    // 'pages/me/refund',
                ]
            },
        ],
        window: {
            navigationStyle: "custom",
            backgroundTextStyle: 'dark',
            navigationBarBackgroundColor: '#fff',
            navigationBarTitleText: 'WeChat',
            navigationBarTextStyle: 'black',
            enablePullDownRefresh: true,
        },
        tabBar: {
            color: '#9C9DA6',
            selectedColor: '#FF4966',
            backgroundColor: '#ffffff',
            borderStyle: "white",
            list: [
                {
                    pagePath: 'pages/tabbar/index/index',
                    text: '首页',
                    iconPath: './source/tabbar/home.png',
                    selectedIconPath: './source/tabbar/homeActive.png'
                },
                {
                    pagePath: 'pages/tabbar/coupon/ticket',
                    text: '优惠券',
                    iconPath: './source/tabbar/ticket.png',
                    selectedIconPath: './source/tabbar/ticketActive.png'
                },
                {
                    pagePath: 'pages/tabbar/cart/index',
                    text: '购物车',
                    iconPath: './source/tabbar/cart.png',
                    selectedIconPath: './source/tabbar/cartActive.png'
                },
                {
                    pagePath: 'pages/tabbar/order/order',
                    text: '订单',
                    iconPath: './source/tabbar/order.png',
                    selectedIconPath: './source/tabbar/orderActive.png'
                },
                {
                    pagePath: 'pages/tabbar/me/me',
                    text: '我的',
                    iconPath: './source/tabbar/wode.png',
                    selectedIconPath: './source/tabbar/wodeActive.png'
                }
            ]
        }
    }

    componentDidMount() {
        const params = this.$router.params;

        const {code,state,channel} = params;

        if (process.env.TARO_ENV === "h5") {
            const path = window.location.pathname;
            if (path === "/") {
                // 直接清除cookie，不需要渠道商
                delCookie("channel");
                options.channel = "";
            } else {
                if (channel) {
                    options.channel = channel;
                    setCookie("channel", channel)
                }
            }
        } else {
            if (channel) {
                options.channel = channel;
            } else {
                // @ts-ignore
                if (params.query && params.query.channel) {
                    // @ts-ignore
                    options.channel = params.query.channel;
                } else {
                    options.channel = ""
                }
            }
        }

        if (!userStore.isLogin) {
            const info = getUserInfo();
            if (info) {
                userStore.setInfo(info);
            }
        }
        if (process.env.TARO_ENV === 'h5' && code && code.length>5 && state == "login" && !userStore.isLogin) {
            Taro.showLoading({title:"登录中..."});
            let exportUrl = window.location.href.split("?")[0] + (Object.keys(params).length > 0 ? "?" : "");
            Object.keys(params).map((key) => {
                if (key != "code" && key != "state") {
                    exportUrl += key + '=' + params[key] + '&';
                }
            })
            exportUrl = exportUrl[exportUrl.length - 1] === '&' ? exportUrl.substring(0, exportUrl.length - 1) : exportUrl;
            window.history.replaceState(null, null, updateChannelCode(exportUrl))
            Xm.login({
                code
            }).then(()=>{
                setTimeout(() => {
                    Taro.hideLoading();
                    Taro.showToast({
                        title:"登录成功",
                        icon:'none',
                        duration:1500
                    });
                }, 1200);
            }).catch((e)=>{
                setTimeout(() => {
                    Taro.hideLoading();
                    Taro.showToast({
                        title:e,
                        icon:'none',
                        duration:1500
                    });
                }, 1500);
            })
        }

        if (process.env.TARO_ENV === 'h5') {
            api("wechat/jssdkconfig",{
                url: window.location.href
            }).then((res)=>{
                const {title, desc, link, imgUrl} = shareInfo;
                if (process.env.TARO_ENV === 'h5') {
                    wx.config({
                        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                        appId: res.appId, // 必填，公众号的唯一标识
                        timestamp: res.timestamp, // 必填，生成签名的时间戳
                        nonceStr: res.nonceStr, // 必填，生成签名的随机串
                        signature: res.signature,// 必填，签名
                        jsApiList: jsApiList // 必填，需要使用的JS接口列表
                    });
                    wx.ready(function () {
                        wx.updateAppMessageShareData({
                            title, // 分享标题
                            desc, // 分享描述
                            link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                            imgUrl, // 分享图标
                            success: function () {
                                // 设置成功
                                console.log("分享成功")
                            }
                        })
                        wx.updateTimelineShareData({
                            title, // 分享标题
                            link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                            imgUrl, // 分享图标
                            success: function () {
                                // 设置成功
                                console.log("分享成功")
                            }
                        })
                        wx.onMenuShareTimeline({
                            title, // 分享标题
                            link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                            imgUrl, // 分享图标
                            success: function () {
                                // 用户点击了分享后执行的回调函数
                            }
                        })
                        wx.onMenuShareAppMessage({
                            title, // 分享标题
                            desc, // 分享描述
                            link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                            imgUrl, // 分享图标
                            type: 'link', // 分享类型,music、video或link，不填默认为link
                            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                            success: function () {
                                // 用户点击了分享后执行的回调函数
                            }
                        });
                        wx.onMenuShareQQ({
                            title, // 分享标题
                            desc, // 分享描述
                            link, // 分享链接
                            imgUrl, // 分享图标
                            success: function () {
                                // 用户确认分享后执行的回调函数
                            },
                            cancel: function () {
                                // 用户取消分享后执行的回调函数
                            }
                        });
                        wx.onMenuShareQZone({
                            title, // 分享标题
                            desc, // 分享描述
                            link, // 分享链接
                            imgUrl, // 分享图标
                            success: function () {
                                // 用户确认分享后执行的回调函数
                            },
                            cancel: function () {
                                // 用户取消分享后执行的回调函数
                            }
                        });
                    })
                }

            }).catch((e)=>{
                console.log("分享出错：", e)

            })
        }
    }



    // 在 App 类中的 render() 函数没有实际作用
    // 请勿修改此函数
    render() {
        return (
            <Provider store={store}>
                <Index />
            </Provider>
        )
    }
}

Taro.render(<App />, document.getElementById('app'))
