import Taro from "@tarojs/taro";

export function ossUrl(url: string, type: number) {
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
    return val === null || val === ""
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
    const ua = navigator.userAgent.toLowerCase();
    return ua.indexOf('micromessenger') != -1;
}

export interface ListModel {
    list: Array<any>,
    size: number,
    start: number,
    total: number
}

export function debounce(fn, delay) {
    let timeout = null;
    return function () {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            // eslint-disable-next-line prefer-rest-params
            fn.apply(this, arguments);
        }, delay);
    }
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
    'checkJsApi',
    'onMenuShareTimeline',
    'onMenuShareAppMessage',
    'onMenuShareQQ',
    'onMenuShareWeibo',
    'hideMenuItems',
    'showMenuItems',
    'hideAllNonBaseMenuItem',
    'showAllNonBaseMenuItem',
    'translateVoice',
    'startRecord',
    'stopRecord',
    'onRecordEnd',
    'playVoice',
    'pauseVoice',
    'stopVoice',
    'uploadVoice',
    'downloadVoice',
    'chooseImage',
    'previewImage',
    'uploadImage',
    'downloadImage',
    'getNetworkType',
    'openLocation',
    'getLocation',
    'hideOptionMenu',
    'showOptionMenu',
    'closeWindow',
    'scanQRCode',
    'chooseWXPay',
    'openProductSpecificView',
    'addCard',
    'chooseCard',
    'openCard',
    'openWXDeviceLib',
    'closeWXDeviceLib',
    'configWXDeviceWiFi',
    'getWXDeviceInfos',
    'sendDataToWXDevice',
    'startScanWXDevice',
    'stopScanWXDevice',
    'connectWXDevice',
    'disconnectWXDevice',
    'getWXDeviceTicket',
    'WeixinJSBridgeReady',
    'onWXDeviceBindStateChange',
    'onWXDeviceStateChange',
    'onScanWXDeviceResult',
    'onReceiveDataFromWXDevice',
    'onWXDeviceBluetoothStateChange'
];

export const deviceInfo = Taro.getSystemInfoSync();


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
 * 序列化地址栏参数, 需从Taro.useRouter()取值
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
