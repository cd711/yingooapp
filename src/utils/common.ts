export function ossUrl(url:string,type:number) {
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

export function is_weixin()  { //判断是否是微信
    const ua = navigator.userAgent.toLowerCase();
    return ua.indexOf('micromessenger') != -1;
}

export interface ListModel{
    list:Array<any>,
    size:number,
    start:number,
    total:number
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
