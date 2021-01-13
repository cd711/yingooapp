import Taro, {useRef, useCallback, useEffect} from "@tarojs/taro";
import Rgbaster from "rgbaster";
import {wxColors} from "./wxColor";
import ENV_TYPE = Taro.ENV_TYPE;
import {userStore} from "../store/user";
import dayjs from "dayjs";
import {api, options} from "./net";
import {LocalCoupon} from "../modal/modal";

export function ossUrl(url: string, type: number) {
    if (!url) {
        return ""
    }
    let u = '';
    switch (type) {
        case 0:
            u = `${url}?x-oss-process=style/s`
            break;
        case 1:
            u = `${url}?x-oss-process=style/m`
            break;
        default:
            u = `${url}?x-oss-process=style/b`
            break;
    }
    return u;
}

export function notNull(val) {
    return val === null || val === "" || val === undefined || val === "undefined" || val === "null"
}

/**
 * 根据图片宽高获取容器的大小，并非等比缩放
 * @param containerW {number} 容器宽度
 * @param imgW
 * @param imgH
 */
export function getImageSize(containerW: number, imgW: number, imgH: number) {
    if (imgW > containerW) {
        return {width: containerW, height: imgH * containerW / imgW}
    }
    return {width: imgW, height: imgH}
}

export function is_weixin() { //判断是否是微信
    if (process.env.TARO_ENV === 'h5') {
        const ua = navigator.userAgent.toLowerCase();
        return ua.indexOf('micromessenger') != -1;
    }
    return false;
}
export function convertClassName(name:string){
    return process.env.TARO_ENV === 'h5'?name:'~'+name;
}

export interface ListModel {
    list: Array<any>,
    size: number,
    start: number,
    total: number
}

export function debounce(func, time = 500) {
    let timer = null;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            //以集合形式传递参数，用apply
            func.apply(this, args);
        }, time);
    };
}

export function pageTotal(rowCount: number, pageSize: number) {
    if (notNull(rowCount) || notNull(pageSize)) {
        return 0;
    } else {
        if (pageSize != 0 && rowCount % pageSize == 0) {
            return parseInt((rowCount / pageSize).toString())
        }
        if (pageSize != 0 && rowCount % pageSize != 0) {
            return parseInt((rowCount / pageSize).toString()) + 1;
        }
    }
}

/**
 * 是否允许继续分页，返回下一页页码和是否允许分页
 * @param currentPage
 * @param pageTotal
 * @return {page: number, more: boolean}
 */
export function getNextPage(currentPage: number, pageTotal: number) {
    if (notNull(currentPage) || notNull(pageTotal) || (!notNull(pageTotal) && pageTotal === 0)) {
        return {
            page: 0,
            more: false
        }
    } else {
        if (currentPage === pageTotal) {
            return {
                page: pageTotal,
                more: false
            }
        } else {
            return {
                page: currentPage + 1,
                more: true
            }
        }
    }
}

export const jsApiList = [
    'onMenuShareTimeline',
    'onMenuShareAppMessage',
    'onMenuShareQQ',
    'onMenuShareWeibo',
    'chooseWXPay',
    "updateAppMessageShareData",
    "updateTimelineShareData",
    "onMenuShareQZone",
];

export const deviceInfo = {
    ...Taro.getSystemInfoSync(),
    env: process.env.TARO_ENV,
    menu: process.env.TARO_ENV !== "h5" ? Taro.getMenuButtonBoundingClientRect() : {} as any,
    safeBottomHeight: process.env.TARO_ENV !== "h5" ? Taro.getSystemInfoSync().screenHeight - Taro.getSystemInfoSync().safeArea.height : 0
};


/**
 * param {object} 将要转为URL参数字符串的对象
 * key {string} URL参数字符串的前缀
 * encode {boolean} 是否进行URL编码,默认为true
 *
 * @return URL参数字符串
 */
export function urlEncode(param, key?: string, encode = true) {
    if (param == null) return '';
    let paramStr = '';
    const t = typeof (param);
    if (t == 'string' || t == 'number' || t == 'boolean') {
        paramStr += '&' + key + '=' + ((encode == null || encode) ? encodeURIComponent(param) : param);
    } else {
        for (const i in param) {
            const k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : i);
            paramStr += urlEncode(param[i], k, encode);
        }
    }
    return paramStr;
}

export function getURLParamsStr(paramsStr: string) {
    if (!paramsStr) {
        return ""
    }

    return paramsStr.substring(1)
}

/**
 * 序列化地址栏参数, 需从Taro.useRouter() / this.$router取值
 *
 * @return {object}  JSON对象
 */
export function urlDeCode(params) {
    if (Object.keys(params).length === 0) {
        return {}
    }
    try {
        let obj = {};
        for (const key in params) {
            let paramsVal = params[key];
            paramsVal = decodeURIComponent(paramsVal);
            // 可能是数组
            const reg = /\[\S+\]/g;
            if (reg.test(key)) {
                const keyArr = key.split(reg);
                const idxStr = key.match(reg)[0];

                const idx = JSON.parse(idxStr)[0];
                const name = keyArr[0];
                const filed = keyArr[1];

                if (obj[name]) {
                    if (obj[name][idx]) {
                        obj[name][idx][filed] = paramsVal
                    } else {
                        obj[name].push({
                            [filed]: paramsVal
                        })
                    }
                } else {
                    obj = {
                        [name]: []
                    }
                    obj[name].push({
                        [filed]: paramsVal
                    })
                }
            } else {
                obj[key] = paramsVal
            }
        }
        console.log("解析URL为Object：", obj)
        return obj
    } catch (e) {
        console.log("解析URL为Object出错：", e)
        return {}
    }
}

/**
 * 处理跳转到模板详情需要的路由cp参数
 * @param router 传入当前页面的router
 */
export function getSpecialRouter(router: {path?: string, params?: {[key: string] : any}} = {}) {
    const path = router.path || "/";
    const params = router.params || {};

    return `${path}${Object.keys(params).length > 0 ? "?" : ""}${getURLParamsStr(urlEncode(params))}`
}

/**
 * 二分法，求区间
 * @param arr {array}  原数组
 * @param findVal  {any}  要找的值
 * @param key  {string}  要对比的字段
 * @param leftIndex {number} 当前下标
 * @param rightIndex  {number}  下一个
 */
export function binarySearch(arr, key, findVal, leftIndex, rightIndex) {
    if (leftIndex > rightIndex) {
        const find = leftIndex - 1

        return find;

    }

    const midIndex = Math.floor((leftIndex + rightIndex) / 2);

    const midVal = arr[midIndex][key];

    if (midVal > findVal) {
        return binarySearch(arr, key, findVal, leftIndex, midIndex - 1);

    } else if (midVal < findVal) {
        return binarySearch(arr, key, findVal, midIndex + 1, rightIndex);

    } else {
        const find = midIndex + 1;

        return find;

    }

}

export function clearStorge(key: string) {
    if (!key) {
        return
    }
    try {
        Taro.removeStorage({key})
    }catch (e) {

    }
}

export function backHandlePress() {
    if (Taro.getEnv() === ENV_TYPE.WEB) {
        window.addEventListener("popstate", () => {
            console.log("监听到返回")
        })
    }
}


/**
 * @param src {string} 图片地址
 * @param options {Object} 配置参数
 * @param canvasId {string} DOM id、仅微信小程序使用此参数
 */
interface RGBAsterParams {
    // 图片地址
    src: string,
    // 配置参数
    options?: {[key: string]: any},
    // 仅微信小程序使用此参数
    canvasId?: string,
    parentThis?:any
}
/**
 * 获取图片主色调，已兼容小程序、web
 * @param params {RGBAsterParams} 参数
 * @constructor
 * @return Promise<any[]>
 */
export function RGBAster (params:RGBAsterParams = {src: ""}) {
    const opt: any = {
        src: params.src,
        options: params.options || {},
        canvasId: params.canvasId || null,
    }
    return new Promise<any[]>((resolve, reject) => {
        if (!opt.src) {
            reject("未找到图片地址");
            return
        }
        if (Taro.getEnv() === ENV_TYPE.WEB) {
            Rgbaster(opt.src, {...opt.options}).then(res => {
                resolve(res)
            }).catch(e => {
                reject(e)
            })
        }
        if (Taro.getEnv() === ENV_TYPE.WEAPP) {
            if (!opt.canvasId) {
                reject("未设置canvasId")
            } else {
                wxColors.colors(opt.src, opt.canvasId, {
                    width: deviceInfo.windowWidth,
                    height: 280,
                    success: res => {
                        resolve(res)
                    }
                },params.parentThis)
            }
        }
    })
}

export function fixStatusBarHeight() {
    const env = process.env.TARO_ENV;
    // if (env !== "h5") {
    //     return {
    //         "padding-top": deviceInfo.statusBarHeight + "px"
    //     }
    // }

    return `padding-top: ${env !== "h5" ? deviceInfo.statusBarHeight + "px" : ""}`
}


export function jumpToEditor(params: {[key: string] : any} = {}) {
    const paramsStr = getURLParamsStr(urlEncode(params));
    Taro.navigateTo({
        url: updateChannelCode(deviceInfo.env === "h5" ? `/pages/editor/pages/shell?${paramsStr}` : `/pages/editor/pages/wxshell?${paramsStr}`)
    })
}
export function jumpToPrintEditor(params: {[key: string] : any} = {}) {
    const paramsStr = getURLParamsStr(urlEncode(params));
    Taro.navigateTo({
        url: updateChannelCode(deviceInfo.env === "h5" ? `/pages/editor/pages/printedit?${paramsStr}` : `/pages/editor/pages/wxprintedit?${paramsStr}`)
    })
}

export async function sleep(timestamp) {
    await new Promise((resolve) => setTimeout(resolve, timestamp));
}

// 从0开始截断字符串
export function cutString(str: string = "", len: number = 1, suffix: string = "...") {
    if (notNull(str)) {
        return ""
    }
    if (str.length <= len) {
        return str
    }
    return `${str.substr(0, len)}${suffix}`;
}


export function getUserKey() {
    return `${userStore.id}_key_${dayjs().date()}`
}

// 数组取双，3取2, 5取4...
export function getEvenArr(arr = []) {
    if (arr.length < 2) {
        return []
    }
    if (arr.length % 3 === 0) {
        return arr.slice(0, arr.length - 1)
    }
    return arr
}

export function setTempDataContainer(key:string,data:any,callback?:(ok:boolean)=>void){
    api("app.order_temp/container",{
        field_key:key,
        content:JSON.stringify(data)
    }).then(()=>{
        callback && callback(true)
    }).catch(()=>{
        callback && callback(false)
    });
}
export function getTempDataContainer(key:string,callback:(value:any)=>void){
    api("app.order_temp/pullContainer",{
        field_key:key
    }).then((res)=>{
        callback(JSON.parse(res))
    }).catch((e)=>{
        console.log(e);
        callback(null)
    });
}

export function removeURLParameter(url, parameter) {
    const urlparts = url.split('?');
    if(urlparts.length >= 2) {
        //参数名前缀
        const prefix = encodeURIComponent(parameter) + '=';
        const pars = urlparts[1].split(/[&;]/g);

        //循环查找匹配参数
        for(let i = pars.length; i-- > 0;) {
            if(pars[i].lastIndexOf(prefix, 0) !== -1) {
                //存在则删除
                pars.splice(i, 1);
            }
        }

        return urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : '');
    }
    return url;
}


/**
 * 获取改分类下第一个模板内容
 * @param cid {string}  商品分类id
 */
export function getFirstTemplateDoc(cid) {
    return new Promise(async (resolve, reject) => {
        api("app.product/cate").then(res => {

            // 获取标签分类
            let arr = [];
            for (const item of res) {
                if (item.tpl_category_id == cid) {
                    arr = item.tags;
                    break;
                }
            }
            if (arr.length > 0) {
                api("editor.tpl/index", {
                    cid: cid,
                    tag_id: arr[0].id,
                    page: 0,
                    size: 5
                }).then(tplData => {
                    if (tplData.list[0]) {
                        api("editor.tpl/one", {id: tplData.list[0].id}).then(doc => {
                            resolve(doc)
                        }).catch(e => {
                            reject(e)
                        })
                    } else {
                        resolve(null)
                    }
                }).catch(e => {
                    reject(e)
                })
            } else {
                reject("没有模板")
            }

        }).catch(e => {
            reject(e)
            console.log("获取商品分类出错：", e)
        })
    })
}


export function getLocalCoupon() {
    return new Promise<LocalCoupon>((resolve, reject) => {
        try {
            const local = Taro.getStorageSync(`${userStore.id}_local_coupon`);
            if (local) {
                resolve(new LocalCoupon(local))
            } else {
                resolve(new LocalCoupon())
            }
        } catch (e) {
            reject(e)
        }
    })
}

export function updateLocalCoupon(params: {[key: string] : any} = {}) {
    return new Promise<void>(async (resolve, reject) => {
        try {
            const local = await getLocalCoupon();
            const data = {...local, ...params};
            Taro.setStorageSync(`${userStore.id}_local_coupon`, new LocalCoupon(data));
            resolve()
        } catch (e) {
            reject(e)
        }
    })
}

export function allowShowCoupon(parentId: string | number , couponId: string | number, couponType: string, historyCouponArr: LocalCoupon = new LocalCoupon()) {
    if (notNull(parentId) || notNull(couponId)) {
        return true
    }
    let status = true;

    if (couponType === "only_one") {
        for (const item of historyCouponArr.onlyOnce) {
            if (couponId == item) {
                status = false;
                break;
            }
        }
    } else if (couponType === "every_time") {
        for (const item of historyCouponArr.everyTime) {
            if (couponId == item) {
                status = true;
                break;
            }
        }
    } else {
        // every_other
        for (const item of historyCouponArr.fixedTime) {
            if (item.expirationTime && item.id == parentId && couponId == item.couponId) {
                if (dayjs().valueOf() > item.expirationTime) {
                    status = true;
                    break
                } else {
                    status = false;
                    break
                }
            }
        }
    }

    return status
}

/**
 * @description: 跳转地址
 * @param {string} url
 * @param {boolean} tabbar
 */
export function jumpUri(url:string,tabbar:boolean = false){
    if(deviceInfo.env == 'h5'){
        if (tabbar) {
            window.location.href = updateChannelCode(url);
        } else {
            Taro.navigateTo({
                url: updateChannelCode(url)
            })
        }
    } else {
        if (tabbar) {
            Taro.switchTab({
                url: updateChannelCode(url)
            })
        } else {
            Taro.navigateTo({
                url: updateChannelCode(url)
            })
        }

    }
}

export function photoGetItemStyle() {
    return {
        width: `${deviceInfo.windowWidth / 4 - 2}px`,
        height: `${deviceInfo.windowWidth / 4 - 2}px`,
    }
}

export const shareInfo = {
    title: "免费照片冲印个性化定制手机壳",
    desc: "[有人@你]，送你一个创意定制品，快来免费领！",
    link: deviceInfo.env=="h5"?`https://m.playbox.yingoo.com/pages/tabbar/index/index${!notNull(options) && !notNull(options.channel) ? `?channel=${options.channel}` : ""}`:`/pages/tabbar/index/index${!notNull(options) && !notNull(options.channel) ? `?channel=${options.channel}` : ""}`,
    imgUrl: 'https://cdn.playbox.yingoo.com/uploads/file/20201230/10a88cd83a5c6d2235d9829a56260281.png?x-oss-process=style/m',
}

export function shareAppExtends() {
    return {
        title: shareInfo.title,
        path: "/pages/tabbar/index/index",
        imageUrl: shareInfo.imgUrl
    }
    return () => {}
}

export function xObserves(obj, callback) {
    // return new Proxy(obj, {
    //   get(target, key) {
    //     return target[key]
    //   },
    //   set(target, key, value) {
    //     target[key] = value
    //     callback(key, value);
    //     return Reflect.set(target, key, value);
    //   }
    // })
    const newObj = {}
    Object.keys(obj).forEach(key => {
      Object.defineProperty(newObj, key, {
        configurable: true,
        enumerable: true,
        get() {
          return obj[key]
        },
        // 当属性的值被修改时，会调用set，这时候就可以在set里面调用回调函数
        set(newVal) {
          obj[key] = newVal
          callback(key, newVal)
        }
      })
    })
    return newObj
}

export function setCookie(name,value) {
    if (deviceInfo.env === "h5") {
        const Days = 30;
        const exp = new Date();
        exp.setTime(exp.getTime() + Days*24*60*60*1000);
        document.cookie = name + "="+ escape (value) + ";expires=" + exp.toDateString();
    }

}

export function getCookie(name) {
    if (deviceInfo.env === "h5") {
        let arr = [];
        const reg = new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr=document.cookie.match(reg))
            return unescape(arr[2]);
        else
            return null;
    }

}

export function delCookie(name) {
    if (deviceInfo.env === "h5") {
        const exp = new Date();
        exp.setTime(exp.getTime() - 1);
        const cval = getCookie(name);
        if (cval != null) {
            document.cookie = name + "=" + cval + ";expires=" + exp.toDateString();
        }
    }
}

/**
 * 跳转政策页面
 * @param type {enum}  1: 用户协议 2:隐私政策
 */
export function jumpToPrivacy(type: 1 | 2) {
    let p = "";
    switch (type) {
        case 1: p = "user_agreement"; break;
        case 2: p = "privacy"; break;
    }
    Taro.navigateTo({
        url: updateChannelCode(`/pages/me/pages/me/privacy?pageType=${p}`)
    })
}

/**
 * JS 节流
 * 默认情况下，throttle将在你调用的第一时间尽快执行这个function，并且，如果你在wait周期内调用任意次数的函数，都将尽快的被覆盖。
 * @param func {function}  节流体
 * @param wait {number}  多长时间执行  毫秒
 */
export function throttle(func, wait) {
    let context,
        args,
        doSomething = true;

    return function() {
        context = this;
        args = arguments;

        if (!doSomething) return;

        doSomething = false;

        setTimeout(function() {
            //执行的时候到了
            func.apply(context, args);
            doSomething = true;
        }, wait);
    };
}


/**
 * Hooks 防抖
 * @param func {function} 函数体
 * @param wait {number}  延迟多少毫秒
 * @param immediate  {boolean}  是否立即执行
 * true：清除表现为可以再次立即执行相关函数不用等待。
 * false：最后一次离开等待 wait 秒执行相关函数，清除表现为无任何结果，就像没触发一样。
 * @see https://www.jianshu.com/p/1ca0fa40e58b
 */
export function useDebounceFn(func, wait, immediate = false) {
    const timeout = useRef();
    /* 函数组件的this其实没啥多大的意义，这里我们就把this指向func好了 */
    const fnRef = useRef(func);

    /*  useDebounceFn 重新触发 func 可能会改变，这里做下更新 */
    useEffect(() => {
        fnRef.current = func;
    }, [ func ]);

    /*
        timeout.current做了缓存，永远是最新的值
        cancel 虽然看着没有依赖项了
        其实它的隐形依赖项是timeout.current
    */
    const cancel = useCallback(function() {
        timeout.current && clearTimeout(timeout.current);
    }, []);

    /* 相关函数 func 可能会返回值，这里也要缓存 */
    const resultRef = useRef();
    function resDebounced(...args) {
        //args就是事件对象event

        // 一直触发一直清除上一个打开的延时器
        cancel();

        if (immediate) {
            // 第一次触发，timeout===undefined恰好可以利用timeout的值
            const callNow = !timeout.current;
            // @ts-ignore
            timeout.current = setTimeout(function() {
                timeout.current = null;
            }, wait);
            /* this指向func好了 */
            if (callNow) resultRef.current = fnRef.current.apply(fnRef.current, args);

        } else {
            // 停止触发，只有最后一个延时器被保留
            // @ts-ignore
            timeout.current = setTimeout(function() {
                timeout.current = null;
                // func绑定this和事件对象event，还差一个函数返回值
                resultRef.current = fnRef.current.apply(fnRef.current, args);
            }, wait);
        }
        return resultRef.current;
    }
    resDebounced.cancal = function(){
        cancel();
        timeout.current = null;
    };

    /* resDebounced 被 useCallback 缓存 */
    /*
        这里也有个难点，数组依赖项如何天蝎，因为它决定了函数何时更新
        1. useDebounceFn 重新触发 wait 可能会改变，应该有 wait
        2. useDebounceFn 重新触发 immediate 可能会改变，应该有 immediate
        3. 当防抖时，resDebounced 不应该读取缓存，而应该实时更新执行
        这时候估计你想不到用哪个变量来做依赖！被难住了吧，哈哈哈哈哈😂😂😂
        这时候你应该想实时更新，resDebounced函数里面哪个模块一直是实时更新的。
        没错就是清除延时器，这条语句。很明显依赖项就应该是它。应该怎么写呢？？？
        提出来，看我给你秀一把。
    */
    return useCallback(resDebounced, [ wait, cancel, immediate ]);
}

/**
 * @description: 格式化价格
 * @param {string} price
 * @return {string}
 */
export function formatPrice(price:string,is:boolean) {
    const pp = price + "";
    if (is) {
        return parseFloat(pp);
    } else {
        return parseFloat(pp).toFixed(2);
    }
}

/**
 * 更新TabBar的ChannelCode， 仅h5可用
 * @param path {string} 跳转路径
 * @param code {string} channelCode， 默认为空, 可手动传入
 */
export function updateTabBarChannelCode(path: string, code: string = "") {
    if (notNull(path)) {
        if (process.env.NODE_ENV !== 'production') {
            console.error("updateChannelCode方法没有传入地址")
        }
        return
    }

    if (process.env.TARO_ENV === "h5") {
        let _path = path;
        const hasParams = path.indexOf("?") > -1;

        let channelCode = "";
        if (options && options.channel) {
            channelCode = options.channel
        } else if (!notNull(code)) {
            channelCode = code
        }

        if (hasParams) {
            // 有参数
            // 有无渠道商code
            const hasCode = path.indexOf("channel") > -1;
            if (!hasCode) {
                if (!notNull(channelCode)) {
                    _path = `${path}&channel=${channelCode}`
                }
            }
        } else {
            // 没有参数
            if (!notNull(channelCode)) {
                _path = `${path}?channel=${channelCode}`
            }
        }
        console.log(_path)
        window.history.pushState(null, null, _path)
    }
}

/**
 * 更新跳转地址，把channelCode更新到地址栏上去
 * @param path {string} 跳转路径
 * @param code {string} channelCode， 默认为空, 可手动传入
 */
export function updateChannelCode(path: string, code:string = "") {
    if (notNull(path)) {
        if (process.env.NODE_ENV !== 'production') {
            console.error("updateChannelCode方法没有传入地址")
        }
        return
    }
    // 在h5下tabbar的路径要单独处理
    const barPath = [
        "/pages/tabbar/index/index",
        "/pages/tabbar/me/me",
        "/pages/tabbar/order/order",
        "/pages/tabbar/coupon/ticket",
        "/pages/tabbar/cart/index"
    ];
    let _path = path;
    const hasParams = path.indexOf("?") > -1;

    let channelCode = "";
    if (options && options.channel) {
        channelCode = options.channel
    } else if (!notNull(code)) {
        channelCode = code
    }

    if (hasParams) {
        // 有参数
        // 有无渠道商code
        const hasCode = path.indexOf("channel") > -1;
        if (!hasCode) {
            if (!notNull(channelCode)) {
                _path = `${path}&channel=${channelCode}`
            }
            if (process.env.TARO_ENV === "h5" && barPath.indexOf(path) > -1) {
                window.history.pushState(null, null, _path)
            }
        }
    } else {
        // 没有参数
        if (!notNull(channelCode)) {
            _path = `${path}?channel=${channelCode}`
        }
        if (process.env.TARO_ENV === "h5" && barPath.indexOf(path) > -1) {
            window.history.pushState(null, null, _path)
        }
    }

    return _path;
}
/**
 * 判断变量是否为空，
 * @param  {[type]}  param 变量
 * @return {Boolean}      为空返回true，否则返回false。
 */
export function isEmptyX(param){
    if(param){
        const param_type = typeof(param);
        if(param_type == 'object'){
            //要判断的是【对象】或【数组】或【null】等
            if(typeof(param.length) == 'undefined'){
                if(JSON.stringify(param) == "{}"){
                    return true;//空值，空对象
                }
            }else if(param.length == 0){
                return true;//空值，空数组
            }
        }else if(param_type == 'string'){
            //如果要过滤空格等字符
            const new_param = param.trim();
            if(new_param.length == 0){
                //空值，例如:带有空格的字符串" "。
                return true;
            }
        }else if(param_type == 'boolean'){
            if(!param){
                return true;
            }
        }else if(param_type== 'number'){
            if(!param){
                return true;
            }
        }
        return false;//非空值
    }else{
        //空值,例如：
        //(1)null
        //(2)可能使用了js的内置的名称，例如：var name=[],这个打印类型是字符串类型。
        //(3)空字符串''、""。
        //(4)数字0、00等，如果可以只输入0，则需要另外判断。
        return true;
    }
}