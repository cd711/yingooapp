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
                    title: "四喜优享",
                    path: "/pages/tabbar/index/index"
                };
            };
        }

    }
}
export default page;
