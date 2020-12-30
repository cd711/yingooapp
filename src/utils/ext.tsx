import Taro from "@tarojs/taro";


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
                return {
                    title: "免费照片冲印个性化定制手机壳",
                    path: "/pages/tabbar/index/index",
                    imageUrl:"https://cdn.playbox.yingoo.com/uploads/file/20201230/18d71f9418c8ef78d72e6b7b8e81e460.png?x-oss-process=style/m"
                };
            };
        }

    }
}
export default page;
