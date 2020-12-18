import {action, observable} from "mobx";
import {PhotoParams} from "../modal/modal";
import {getUserKey} from "../utils/common";
import {api} from "../utils/net";

class Photo {

    // 储存当前用户操作照片冲印的key
    @observable
    public printKey: string = "";

    // 存储照片打印一系列流程的所有数据
    @observable
    public photoProcessParams: PhotoParams = new PhotoParams();

    // 编辑器所有组件都使用的图片数组
    @observable
    public editorPhotos: { id: string | number, url: string }[] = [];


    // 创建操作仅仅只是在初始化选择尺寸后创建，其余要改变photoProcessParams的值只是在updateServerParams中进行
    @action
    public setActionParamsToServer(_key = "", data = {}) {
        return new Promise<any>(async (resolve, reject) => {
            console.log("key:", getUserKey())
            try {
                console.log("进来的值：", JSON.parse(JSON.stringify(data)))
                const temp = new PhotoParams({
                    ...this.photoProcessParams,
                    ...data
                })
                console.log(JSON.parse(JSON.stringify(temp)))
                const k = await api("app.order_temp/container", {
                    field_key: _key || getUserKey(),
                    content: JSON.stringify(temp)
                });
                this.printKey = k;
                this.photoProcessParams = {...temp};
                resolve()
            } catch (e) {
                reject(e)
                console.log("初始化photoParams出错：", e)
            }
        })
    }

    /**
     * 获取服务器的流程参数
     * @params.key {string}  小程序套webview时因为userStore没有数据，所以key值是错误的，
     * 需要手动赋值
     * @param params
     */
    @action
    public getServerParams(params?: {key?: string, setLocal?: boolean}) {
        const opt = {
            key: params.key || getUserKey(),
            setLocal: params.setLocal || false
        }
        return new Promise<PhotoParams>(async (resolve, reject) => {
            try {
                const res = await api("app.order_temp/pullContainer", {field_key: opt.key});
                if (opt.setLocal) {
                    this.photoProcessParams = {...new PhotoParams(JSON.parse(res))}
                }
                resolve(JSON.parse(res))
            }catch (e) {
                reject(e)
            }
        })
    }

    @action
    public updateServerParams(key = "", data = {}) {
        return new Promise<PhotoParams>(async (resolve, reject) => {
            try {
                const serverP: {[key: string]: any} = await this.getServerParams({key});
                const temp = new PhotoParams({...serverP, ...data});
                await this.setActionParamsToServer(key, temp);
                resolve(new PhotoParams(temp))
            }catch (e) {
                reject(e)
            }
        })
    }

}

const photoStore = new Photo();
export default photoStore
