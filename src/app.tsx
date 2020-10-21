import Taro, { Component, Config } from '@tarojs/taro'
import { Provider } from '@tarojs/mobx'
import Index from './pages/index'

import {userStore} from './store/user'
import counterStore from './store/counter'
import 'taro-ui/dist/style/index.scss'
import './app.less'
import { options,getUserInfo } from './utils/net';
import config from './config';

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }
options.apiUrl = config.apiUrl;
options.sourceUrl = config.sourceUrl;
const store = {
    userStore,
    counterStore
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
            'pages/me/me',
            'pages/template/index',
            'pages/login/index',
            'pages/editor/index',
            'pages/login/acount',
            'pages/login/sms'
        ],
        window: {
            backgroundTextStyle: 'light',
            navigationBarBackgroundColor: '#fff',
            navigationBarTitleText: 'WeChat',
            navigationBarTextStyle: 'black'
        },
        tabBar: {
            color: '#9C9DA6',
            selectedColor: '#FF4966',
            backgroundColor: 'white',
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
        console.log("app");
        
        if (userStore.id<=0) {
            const info = getUserInfo();
            if (info) {
                userStore.setInfo(info);
            }
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
