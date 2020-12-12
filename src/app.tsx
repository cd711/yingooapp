import Taro, { Component, Config } from '@tarojs/taro'
import { Provider } from '@tarojs/mobx'
import Index from './pages/index'
import {userStore} from './store/user'
import {templateStore} from './store/template'
import 'taro-ui/dist/style/index.scss'
import './app.less'
import { options,getUserInfo } from './utils/net';
import config from './config';
import Xm from './utils/xm'

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }
options.apiUrl = config.apiUrl;
options.sourceUrl = config.sourceUrl;

const store = {
    userStore,
    templateStore
}

class App extends Component {

    /**
     * 指定config的类型声明为: Taro.Config
     *
     * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
     * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
     * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
     */
    config: Config = {
        pages: [
            'pages/index/index',
            'pages/index/special',
            'pages/me/me',
            'pages/template/index',
            'pages/template/detail',
            'pages/login/index',
            'pages/login/set',
            'pages/login/setnew',
            'pages/login/mobile',
            'pages/login/find',
            // 'pages/editor/shell',
            // "pages/editor/wxshell",
            // 'pages/editor/printedit',
            'pages/login/acount',
            'pages/login/sms',
            'pages/me/setting',
            'pages/me/profile',
            'pages/me/acount',
            'pages/me/order',
            'pages/me/privacy',
            'pages/me/aboutus',
            'pages/me/feedback',
            'pages/me/orderdetail',
            // 'pages/me/refund',
            'pages/me/address/index',
            'pages/me/address/editor',
            'pages/me/photos',
            'pages/me/ticket',
            'pages/printing/index',
            'pages/printing/change',
            'pages/template/preview',
            'pages/template/confirm',
            'pages/template/success',
            'pages/cart/index',
            'pages/search/index',
            'pages/search/result',
        ],
        window: {
            navigationStyle: "custom",
            backgroundTextStyle: 'light',
            navigationBarBackgroundColor: '#fff',
            navigationBarTitleText: 'WeChat',
            navigationBarTextStyle: 'white'
        },
        tabBar: {
            color: '#9C9DA6',
            selectedColor: '#FF4966',
            backgroundColor: '#ffffff',
            borderStyle: "white",
            list: [
                {
                    pagePath: 'pages/index/index',
                    text: '发现',
                    iconPath: './source/tabbar/faxian.png',
                    selectedIconPath: './source/tabbar/faxianActive.png'
                },
                {
                    pagePath: 'pages/template/index',
                    text: '模板',
                    iconPath: './source/tabbar/muban.png',
                    selectedIconPath: './source/tabbar/mubanActive.png'
                },
                {
                    pagePath: 'pages/me/me',
                    text: '我的',
                    iconPath: './source/tabbar/wode.png',
                    selectedIconPath: './source/tabbar/wodeActive.png'
                }
            ]
        }
    }

    componentDidMount() {
        const params = this.$router.params;
        if (!userStore.isLogin) {
            const info = getUserInfo();
            if (info) {
                userStore.setInfo(info);
            }
        }
        const {code,state} = params;
        if (process.env.TARO_ENV === 'h5' && code && code.length>5 && state == "login" && !userStore.isLogin) {
            Taro.showLoading({title:"登录中..."});
            let exportUrl = window.location.href.split("?")[0] + (Object.keys(params).length > 0 ? "?" : "");
            Object.keys(params).map((key) => {
                if (key != "code" && key != "state") {
                    exportUrl += key + '=' + params[key] + '&';
                }
            })
            exportUrl = exportUrl[exportUrl.length - 1] === '&' ? exportUrl.substring(0, exportUrl.length - 1) : exportUrl;
            window.history.replaceState(null, null, exportUrl)
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
