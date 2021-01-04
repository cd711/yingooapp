import Taro from "@tarojs/taro";
import { options } from "./net";


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
                let uri = "/pages/tabbar/index/index";
                if (options && options.channel.length>0) {
                    uri = `/pages/tabbar/index/index?channel=${options.channel}`
                }
                return {
                    title: "免费照片冲印个性化定制手机壳",
                    path: uri,
                    imageUrl:"https://cdn.playbox.yingoo.com/uploads/file/20201230/10a88cd83a5c6d2235d9829a56260281.png?x-oss-process=style/m"
                };
            };
        }

    }
}
export default page;
