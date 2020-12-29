import {action} from "mobx";
import {api} from "../utils/net";

class Editor {

    @action
    public getFirstTemplateDoc(cid) {
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

}

const editorStore = new Editor();
export default editorStore;
