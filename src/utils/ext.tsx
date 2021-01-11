import Taro from "@tarojs/taro";
import {shareInfo} from "./common";


const page = (option?: {
    share:boolean
}) => {
    return function (obj: { prototype: any; }) {
        const clazz = obj.prototype
        const mount = clazz.componentWillMount;

        clazz.componentWillMount = function () {
            this.__option = {};
            if (option) {
                this.__option = Object.assign({}, option);
                if (!option.share) {
                    Taro.hideShareMenu();
                }
            }
            mount && mount.apply(this, arguments);
        };

        if (!clazz.onShareAppMessage) {

            clazz.onShareAppMessage = function() {
                // let uri = "/pages/tabbar/index/index";
                // if (options && options.channel.length>0) {
                //     uri = `/pages/tabbar/index/index?channel=${options.channel}`
                // }
                return {
                    title: shareInfo.title,
                    path: shareInfo.link,
                    imageUrl: shareInfo.imgUrl
                };
            };
        }

    }
}
export default page;
