import Taro, {Component, useEffect, useState} from '@tarojs/taro';
import {Image, ScrollView, Text, View} from '@tarojs/components';
import {AtActivityIndicator, AtSlider} from "taro-ui";
import './editor.less';
import './shell.less';

import {api, getToken} from '../../utils/net';
import IconFont from '../../components/iconfont';
import {observable} from 'mobx';
import {observer} from '@tarojs/mobx';
import Fragment from '../../components/Fragment';
import UploadFile from "../../components/Upload/Upload";
import {notNull, ossUrl} from "../../utils/common";

let editorProxy: WindowProxy | null | undefined;

export const sendMessage: { (type: string, data: any): void } = (type, data) => {
    editorProxy && editorProxy.postMessage({from: "parent", type: type, data: data}, "*");
}

let rpcId = 0;
const rpcList = {}

function callEditor(name, ...args) {
    return new Promise((resolve, reject) => {
        rpcId++;
        const id = rpcId;
        rpcList[id] = [resolve, reject];
        sendMessage("_req", {
            id: rpcId,
            fun: name,
            args: args
        });
    });
}


const defaultBrank = 1201;
const defaultModel = {
    id: 1586,
    name: "华为 V30 Pro",
    phoneshell: {
        id: 37,
        image: "http://palybox-app.oss-cn-chengdu.aliyuncs.com/uploads/phoneshell/20200911/0e768b37d0f96869abfcca08303dce70.png"
    }
};

class Store {
    @observable
    tool = 0;

    model: any;

    @observable
    isEdit = false;
}

interface BrandType {
    id: any;
    name: string;
    models?: BrandType[];
    phoneshell: any;
    brandIndex?: number;
}

const Template: React.FC<{ parent: Shell; onClose: () => void, onOk: () => void}> = ({onClose, parent, onOk}) => {

    const prodList = Taro.useRef([]);
    const [typeList, setTypeList] = useState([]);
    const [active, setActive] = useState(0);
    const [templateList, setTemplateList] = useState([]);
    const [selected, setSelected] = useState(null);
    const defaultDoc = Taro.useRef(null);
    let total: number = 0;

    // 获取列表
    async function getListOfCategory(params: {tagId?: number | string, page?: number, size?: number, loadMore?: boolean} = {}) {
        const {cid} = parent.$router.params;
        const opt = {
            cid,
            tagId: params.tagId || "",
            page: params.page || 0,
            size: params.size || 15,
            loadMore: params.loadMore || false
        }
        try{
            const res = await api("editor.tpl/index", {
                cid: opt.cid,
                tag_id: opt.tagId,
                page: opt.page,
                size: opt.size
            });
            total = Number(res.total);
            let list = [];
            if (opt.loadMore) {
                list = [...templateList, ...res.list]
            } else {
                list = [...res.list]
            }
            setTemplateList([...list])
        }catch (e) {
            console.log("根据ID获取模板列表出错：", e)
        }
    }

    // 获取初始化的DOC
    async function getDefaultDoc() {
        try {
            const doc = await callEditor("getDoc");
            console.log("doc", doc)
            defaultDoc.current = doc;
        } catch (e) {

        }
    }

    // 重置DOC
    async function resetTemplate() {
        try {
            if (defaultDoc.current) {
                await callEditor("setDoc", defaultDoc.current);
            }
        } catch (e) {
            console.log("重置出错：", e)
        }
    }

    useEffect(() => {
        api("app.product/cate").then(res => {
            prodList.current = res;
            const {cid} = parent.$router.params;
            if (cid) {
                // 获取标签分类
                let arr = [];
                for (const item of res) {
                    if (Number(item.tpl_category_id) === Number(cid)) {
                        arr = item.tags;
                        break;
                    }
                }
                getListOfCategory({tagId: arr[0].id, page: 0})
                setTypeList([...arr])
            }
        }).catch(e => {
            console.log("获取商品分类出错：", e)
        })

        getDefaultDoc()
    }, [])

    const changeType = idx => {
        setActive(idx);
        getListOfCategory({
            tagId: typeList[idx].id,
            page: 0
        })
    }

    const onSelect = async (item) => {
        if (!notNull(selected) && Number(selected) === Number(item.id)) {
            setSelected(null);
            resetTemplate()
            return
        }
        setSelected(Number(item.id));

        // 获取模板详情并向DOC更新
        Taro.showLoading({title: "正在为您设置..."})
        try {
            const res = await api("editor.tpl/one", {id: item.id});
            await callEditor("setDoc", res)
        }catch (e) {
            console.log("设置DOC出错：", e)
        }
        Taro.hideLoading()
    }

    const loadMore = () => {
        console.log("加载更多")
        if (total === templateList.length || total <= 15) {
            return
        }
        if (templateList.length < total) {
            getListOfCategory({
                tagId: typeList[active].id,
                page: templateList.length,
                loadMore: true
            })
        }
    }

    const onCancel = () => {
        resetTemplate();
        onClose && onClose()
    }

    return <View className='switch-template'>
        <View className='brand'>
            <ScrollView className='type_list_view' scrollX>
                <View className='warp'>
                    {typeList.map((value, index) => (
                        <View className="type_item" key={index} onClick={() => changeType(index)}>
                            <Text className={`txt ${active === index ? "active" : ""}`}>{value.name}</Text>
                            {active === index ?
                                <Image src={require("../../source/switchBottom.png")} className="filter_bar_img"/>
                                : null}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
        <ScrollView className='template_lice_container' scrollY onScrollToLower={loadMore}>
            <View className="template_list">
                {templateList.map((value, index) => (
                    <View className="template_item" key={index} onClick={() => onSelect(value)}
                          // style={{width: window.screen.width / 4 - 8, height: (window.screen.width / 4 - 8) + (window.screen.width / 4 - 4) * 0.62}}
                    >
                        <Image src={value.thumbnail} mode="aspectFill" className="temp_img" />
                        {
                            !notNull(selected) && selected === Number(value.id)
                                ? <View className="active_view" onClick={() => onSelect(value)}>
                                    <Text className="text">应用中</Text>
                                </View>
                                : null
                        }
                    </View>
                ))}
            </View>
        </ScrollView>
        <View className='optBar'>
            <View onClick={onCancel} className="icon"><IconFont name='24_guanbi' size={48}/></View>
            <Text className='txt'>模板</Text>
            <View onClick={onOk} className='icon'><IconFont name='24_gouxuan' size={48}/></View>
        </View>
    </View>;
};

interface ChangeImageProps {
    onClose: () => void,
    onOk?: () => void,
}

const ChangeImage: React.FC<ChangeImageProps> = (props) => {

    const {onClose, onOk} = props;

    const bars = ["素材库", "贴纸"];
    const [active, setActive] = useState(0);
    const [selected, setSelected] = useState(null);
    const [list, setList] = useState([]);
    const defaultDoc = Taro.useRef(null);
    let total = 0;
    const stickersTotal = Taro.useRef(0)

    async function getList(data) {
        Taro.showLoading({title: "加载中"})
        const opt = {
            start: data.start || 0,
            size: data.size || 15,
            type: data.type || 0,
            loadMore: data.loadMore || false
        };
        try {
            const res = await api("app.profile/imgs", {
                start: opt.start,
                size: opt.size,
                type: opt.type === 0 ? "image" : "video"
            });
            total = Number(res.total);
            console.log(res);
            let tempArr = [];
            if (opt.loadMore) {
                tempArr = [...list, ...res.list]
            } else {
                tempArr = [...res.list]
            }
            setList([...tempArr]);
        } catch (e) {
            console.log("获取图库出错：", e)
        }
        Taro.hideLoading()
    }

    async function getStickers(data) {
        Taro.showLoading({title: "加载中"})
        const opt = {
            start: data.start || 0,
            size: data.size || 15,
            loadMore: data.loadMore || false
        };
        try {
            const res = await api("editor.material/img", {
                start: opt.start,
                size: opt.size,
            });
            console.log(res)
            stickersTotal.current = Number(res.total)
            let tempArr = [];
            if (opt.loadMore) {
                tempArr = [...list, ...res.list]
            } else {
                tempArr = [...res.list]
            }
            setList([...tempArr]);
        } catch (e) {

        }
        Taro.hideLoading()
    }

    async function getDefaultDoc() {
        try {
            const doc = await callEditor("getDoc");
            console.log("doc", doc)
            defaultDoc.current = doc;
        } catch (e) {

        }
    }

    async function resetImage() {
        try {
            if (defaultDoc.current) {
                await callEditor("setDoc", defaultDoc.current);
            }
        } catch (e) {
            console.log("重置出错：", e)
        }
    }

    const changeEditImg = async (src?: string) => {
        try {
            if (!src) {
                resetImage()
            } else {
                const doc = await callEditor("changeImage", src);
                console.log(doc)
            }
        } catch (e) {

        }
    }

    useEffect(() => {
        getList({start: 0});
        getDefaultDoc();
    }, [])

    const uploadFile = async files => {
        console.log(files)
        getList({start: 0})
    }

    const changeType = idx => {
        setActive(idx);
        setList([]);
        setSelected(null);
        stickersTotal.current = 0;
        switch (idx) {
            case 0:
                getList({start: 0});
                break;
            case 1:
                getStickers({start: 0});
                break;
        }
    }

    const loadMore = () => {
        if (active === 0) {
            if (total === list.length || list.length < 15) {
                return
            }
            getList({start: list.length, loadMore: true})
        } else {
            console.log(stickersTotal.current, list.length)
            if (stickersTotal.current === list.length || list.length < 15 || list.length > stickersTotal.current) {
                return
            }
            getStickers({start: list.length, loadMore: true})
        }

    }

    function getSrc(item) {
        if (!item) {
            return ""
        }
        if (active === 0) {
            return item.imagetype === "video" ? `${item.url}?x-oss-process=video/snapshot,t_1000,w_360,h_0,f_jpg,m_fast` : ossUrl(item.url, 1)
        } else {
            return item.thumbnail
        }
    }

    const onSelect = (item, idx) => {
        console.log(idx)
        const src = list[idx];

        if (!notNull(selected) && idx === selected) {
            setSelected(null);
            changeEditImg(null)
            return
        }
        setSelected(idx);
        if (src) {
            changeEditImg(getSrc(item))
        }

    }

    const onCancel = () => {
        resetImage();
        onClose && onClose()
    }

    return <View className="change_image_container">
        <View className="change_main">
            <View className="filter_bar">
                {bars.map((value, index) => (
                    <View className="filter_bar_item" key={index} onClick={() => changeType(index)}>
                        <Text className={`name ${index === active ? "active" : ""}`}>{value}</Text>
                        {active === index ?
                            <Image src={require("../../source/switchBottom.png")} className="filter_bar_img"/> : null}
                    </View>
                ))}
            </View>
            <ScrollView className="list_container" scrollY style={{height: 280}} onScrollToLower={loadMore}>
                <View className="list_main">
                    {active === 0
                        ? <View className="list_item">
                            <UploadFile
                                extraType={0}
                                type="card"
                                uploadType="image"
                                onChange={uploadFile}/>
                        </View>
                        : null}
                    {
                        list.map((item, idx) => {
                            return <View className="list_item" key={idx}>
                                <View className="img_item" key={idx} onClick={() => onSelect(item, idx)}>
                                    <Image src={getSrc(item)} mode="aspectFill" className="img"/>
                                </View>
                                {
                                    !notNull(selected) && selected === idx
                                        ? <View className="selected" onClick={() => onSelect(item, idx)}><Text
                                            className="tit">应用中</Text></View>
                                        : null
                                }
                            </View>
                        })
                    }
                </View>
            </ScrollView>
            <View className='optBar'>
                <View className="icon" onClick={onCancel}><IconFont name='24_guanbi' size={48}/></View>
                <Text className='txt'>换图</Text>
                <View className='icon' onClick={onOk}><IconFont name='24_gouxuan' size={48}/></View>
            </View>
        </View>
        <View className="mask"/>
    </View>
}

// 透明度
const ChangeAlpha: React.FC<ChangeImageProps> = (props) => {

    const {onClose, onOk} = props;

    const [alpha, setAlpha] = useState(100);

    const onCancel = async () => {
        try {
            await callEditor("alpha", 1)
        } catch (e) {

        }
        onClose && onClose()
    }

    async function getDefaultDoc() {
        try {
            const doc = await callEditor("getDoc")
            console.log(doc)
        } catch (e) {

        }
    }

    useEffect(() => {
        getDefaultDoc()
    }, [])

    const onChange = async val => {
        console.log(val)
        setAlpha(val);

        try {
            await callEditor("alpha", val / 100)
        } catch (e) {

        }
    }

    return <View className="change_image_container">
        <View className="change_main" style={{height: "auto"}}>
            <View className="alpha_bar">
                <View className="icon"><Image src={require("../../source/trans.png")} className="img"/></View>
                <View className="bar"><AtSlider value={alpha} min={0} max={100} step={1} onChanging={onChange}/></View>
                <View className="count"><Text>{alpha}</Text></View>
            </View>
            <View className='optBar'>
                <View className="icon" onClick={onCancel}><IconFont name='24_guanbi' size={48}/></View>
                <Text className='txt'>换图</Text>
                <View className='icon' onClick={onOk}><IconFont name='24_gouxuan' size={48}/></View>
            </View>
        </View>
        <View className="mask"/>
    </View>
}

const ToolBar0: React.FC<{ parent: Shell, brand: number, model?: BrandType }> = ({parent, model, brand}) => {
    const [type, setType] = useState(0);
    const [brandList, setBrandList] = useState<BrandType[]>([]);
    const [brandIndex, setBrand] = useState<number>(-1);
    const [series, setSeries] = useState<BrandType[]>([]);

    const [currentModel, setCurrentModel] = useState<BrandType>(model);

    const [tempCurrentModel, setTempCurrentModel] = useState<BrandType>(currentModel);


    useEffect((async () => {

        switch (type) {
            case 1:
                let list = null;
                try {
                    //@ts-ignore
                    const res = Taro.getStorageSync("phone_brand");
                    if (res && res.time + 15 * 86400000 > Date.now()) {
                        list = res.list;
                    }
                } catch (e) {
                    console.error(e);
                }
                if (!list) {
                    try {
                        list = await api("/editor.phone_shell/phonebrand");
                    } catch (e) {
                        console.warn(e);
                    }
                }
                if (!list) {
                    return;
                }

                setBrandList(list);
                let bi = -1;
                for (const i in list) {
                    if (brandIndex == -1) {
                        if (list[i].id == brand) {
                            bi = i as any
                            setBrand(i as any);
                            break;
                        }
                    }
                }
                if (bi == -1 && brandIndex == -1) {
                    setBrand(0);
                } else if (bi != -1) {
                    setBrand(bi);
                }
                if (model && model.phoneshell) {
                    sendMessage("phoneshell", {id: model.id, mask: model.phoneshell.image});
                }

                Taro.setStorage({
                    key: "phone_brand", data: {
                        time: Date.now(),
                        list: list
                    }
                });


        }
    }) as any, [type])

    //系列
    useEffect((async () => {
        if (!brandList || brandList.length == 0) {
            return;
        }
        setSeries(null);
        let list = null;
        let idx = brandIndex
        if (tempCurrentModel && currentModel && tempCurrentModel.id != currentModel.id) {
            idx = currentModel.brandIndex || idx;
        }
        try {
            //@ts-ignore
            const res = brandList[idx] ? Taro.getStorageSync("phone_series_" + brandList[idx].id) : null;
            if (res && res.time + 3 * 86400000 > Date.now()) {
                list = res.list;
            }
        } catch (e) {

            console.error(e);
        }
        if (!list) {
            try {
                list = await api("/editor.phone_shell/series", {
                    id: brandList[brandIndex].id
                });
                console.log(list);
            } catch (e) {
                console.warn(e);
            }
        }
        if (!list) {
            return;
        }
        setSeries(list);
        if (!tempCurrentModel) {
            setTempCurrentModel(list[0].models[0]);
            setCurrentModel(list[0].models[0]);
            parent.store.model = list[0].models[0].id;
        }
        Taro.setStorage({
            key: "phone_series_" + brandList[brandIndex].id, data: {
                time: Date.now(),
                list: list
            }
        });
    }) as any, [brandList, brandIndex]);


    const selectPhone = () => {
        setType(0);
        if (currentModel.id == tempCurrentModel.id) {
            return;
        }
        const mod = tempCurrentModel;
        mod.brandIndex = brandIndex;
        setCurrentModel(mod);

        parent.store.model = mod.id;
        if (mod.phoneshell) {
            sendMessage("phoneshell", {id: mod.id, mask: mod.phoneshell.image});
        }
        Taro.setStorage({key: "myphone", data: [brandList[brandIndex].id, mod]});
    };

    const cancelMode = () => {
        setType(0);
        // setBrand(currentModel.brandIndex);
        // setTempCurrentModel(currentModel);
    }

    return ([type].map((t) => {
        switch (t) {
            case 0:
                return <View className='tools' style='padding: 0 13%'>
                    <View className='btn' onClick={() => setType(1)}>
                        <IconFont name='24_bianjiqi_jixing' size={48}/>
                        <Text className='txt'>机型</Text>
                    </View>
                    <View onClick={() => setType(2)} className='btn'>
                        <IconFont name='24_bianjiqi_moban' size={48}/>
                        <Text className='txt'>模板</Text>
                    </View>
                </View>;

            case 1: //机型
                return <Fragment>
                    <View className='tools'/>
                    <View className='mask'/>
                    <View className='switch-brank'>
                        <View className='brand'>
                            <ScrollView className='brand cate_list' scrollX>
                                <View className='warp'>
                                    {
                                        brandList.length > 0 ? brandList.map((item: any, idx) => (
                                            <View className={idx == brandIndex ? 'item active' : 'item'} key={item.id}
                                                  onClick={() => setBrand(idx)}>
                                                <Text className='text'>{item.name}</Text>
                                                {idx == brandIndex ? <Image className='icon'
                                                                            src={require("../../source/switchBottom.png")}/> : null}
                                            </View>
                                        )) : <AtActivityIndicator size={64} mode='center'/>
                                    }
                                </View>
                            </ScrollView>
                        </View>
                        <ScrollView className='list' scrollY>
                            {series ? series.map((ses) => {
                                    return <View key={`mod-${ses.id}`}>
                                        <Text className='head'>{ses.name}系列</Text>
                                        <View className='phone'>
                                            {ses.models.map((mod) => {
                                                return <View onClick={() => setTempCurrentModel(mod)} key={`mod-${mod.id}`}
                                                             className={tempCurrentModel.id == mod.id ? 'item act' : "item"}>
                                                    <Text>{mod.name}</Text>
                                                </View>
                                            })}
                                        </View>
                                    </View>
                                }
                            ) : <AtActivityIndicator className="phoneLoading" size={64}/>}
                        </ScrollView>
                        <View className='optBar'>
                            <View onClick={cancelMode} className="icon"><IconFont name='24_guanbi' size={48}/></View>
                            <Text className='txt'>机型</Text>
                            <View onClick={selectPhone} className='icon'><IconFont name='24_gouxuan' size={48}/></View>
                        </View>
                    </View>
                </Fragment>;

            //模板
            case 2:
                return <Template parent={parent} onClose={() => setType(0)} onOk={() => setType(0)} />;
        }
    }))[0] as any;
}

@observer
export default class Shell extends Component<{}, {
    size?: { width: string | number; height: string | number };
    currentBrand?: number;
    data?: number;
    loadingTemplate?: boolean;
    currentModel?: BrandType;
}> {

    public store = new Store();

    private tplId: any = 0;
    private docId: any = 0;

    constructor(p) {
        super(p);
        // console.log(this.$router.params);
        this.tplId = this.$router.params['tpl_id'] || 0;
        this.docId = this.$router.params['id'] || 0;

        this.state = {
            currentBrand: -1,
            loadingTemplate: true
        };
    }

    public editorProxy: WindowProxy | null | undefined;

    async componentDidMount() {
        // Taro.showLoading({title: "请稍候"});
        // @ts-ignore
        this.editorProxy = document.querySelector<HTMLIFrameElement>(".editor_frame").contentWindow;
        editorProxy = this.editorProxy;
        window.addEventListener("message", this.onMsg);


        // Taro.hideLoading();
    }

    componentWillUnmount() {
        editorProxy = null;
        window.removeEventListener("message", this.onMsg);
    }

    onLoad = async (type?: number) => {
        try {
            const res = Taro.getStorageSync("myphone");
            if (res && res.length == 2) {
                this.setState({
                    currentBrand: res[0],
                    currentModel: res[1],
                });
                console.log(res)
                res[1].phoneshell && sendMessage("phoneshell", {id: res[1].id, mask: res[1].phoneshell.image});
                // defaultModel
            } else {
                this.setState({
                    currentBrand: defaultBrank,
                    currentModel: defaultModel,
                });
                sendMessage("phoneshell", {id: defaultModel.id, mask: defaultModel.phoneshell.image});
            }
            // !type && await callEditor("saveDraft");
        } catch (e) {
            console.error(e);
        }

    }

    _res = (data) => {
        const {id, res, err} = data.data;
        if (rpcList[id]) {
            const rpc = rpcList[id];
            delete rpcList[id];

            if (err) {
                rpc[1](err);
            } else {
                rpc[0](res);
            }
        }
    }

    onMsg: { (e: MessageEvent): void } = async ({data}) => {
        console.log("msg", data);
        if (!data) {
            return;
        }
        if (data.from == "editor") {
            switch (data.type) {
                case "_req":
                    const {id, fun, args} = data.data;

                    if (this[`rpc_${fun}`]) {
                        try {
                            const res = await this[`rpc_${fun}`](...args)
                            sendMessage("_res", {
                                id,
                                res
                            });
                        } catch (err) {
                            sendMessage("_res", {
                                id,
                                err
                            });
                        }
                    } else {
                        sendMessage("_res", {
                            id,
                            err: "func not found"
                        });
                    }
                    return;

                case "_res":
                    this._res(data);
                    return;

                case "onLoadEmpty":
                    if (!this.tplId && !this.docId) {
                        try {
                            const {doc} = Taro.getStorageSync("doc_draft");
                            await callEditor("setDoc", doc);
                            // this.tplId = tplId;
                        } catch (e) {
                            alert(e);
                        }
                    }

                    this.setState({
                        loadingTemplate: false
                    });
                    // callEditor("loadDraft")
                    break;

                case "onload":
                    this.setState({
                        loadingTemplate: false
                    });
                    this.onLoad(data.data);
                    break;

                case "mainSize":
                    // this.setEditorSize(data.data);
                    break;

                case "selected":
                    this.onSelected(data.data);
                    break;
            }
        }
    }

    onSelected = (item?: { id: any, type: "img" | "text" | "container" }) => {
        if (this.store.isEdit) {
            return;
        }
        if (!item) {
            this.store.tool = 0;
            return;
        }
        switch (item.type) {
            case "img":
                this.store.tool = 1;
        }
    }


    back = () => {
        if (Taro.getCurrentPages().length > 1) {
            Taro.navigateBack();
        } else {
            if (process.env.TARO_ENV == "h5") {
                window.location.href = "/";
            } else {
                Taro.reLaunch({url: "/pages/index"});
            }
        }
    }

    next = async () => {
        Taro.showLoading({
            title: "请稍候"
        });
        // await callEditor("saveDraft");
        const doc = await callEditor("getDoc");
        Taro.setStorageSync("doc_draft", {
            tplId: this.tplId,
            docId: this.docId,
            modelId: this.store.model,
            doc: doc
        });
        Taro.hideLoading();
        window.location.replace(`/pages/template/preview`);
    }


    render() {
        const {loadingTemplate, size, currentModel, currentBrand} = this.state;
        const {tool} = this.store;


        const changeImage = () => {
            this.store.tool = 4;
            this.store.isEdit = true;
        }

        const onOk = () => {
            this.store.tool = 0;
            this.store.isEdit = false
        }

        const cancelEdit = () => {
            this.store.tool = 0;
            this.store.isEdit = false;
        }

        // 水平翻转
        const onFilpY = async () => {
            try {
                await callEditor("flipH");
            } catch (e) {
            }
        }

        // 垂直翻转
        const onFilpX = async () => {
            try {
                await callEditor("flipV")
            } catch (e) {

            }
        }

        const onChangeAlpha = () => {
            // alpha
            this.store.tool = 5;
            this.store.isEdit = true;
        }

        return <View className='editor-page'>
            <View className='header'>
                <View onClick={this.back}>
                    <IconFont name='24_shangyiye' color='#000' size={48}/>
                </View>
                <View onClick={this.next} className='right'>下一步</View>
            </View>
            <View className="editor" style={size ? {height: size.height} : undefined}>
                {/* eslint-disable-next-line react/forbid-elements */}
                <iframe className="editor_frame"
                        src={`http://192.168.0.166/editor/mobile?token=${getToken()}&tpl_id=${this.tplId}&doc_id=${this.docId}&t=999}`}></iframe>
                {loadingTemplate ?
                    <View className='loading'><AtActivityIndicator size={64} mode='center'/></View> : null}
            </View>

            {([tool].map((s) => {
                switch (s) {
                    case 0:
                        return <ToolBar0 parent={this} brand={currentBrand} model={currentModel}/>;

                    case 1:
                        return <View key={s} className='tools'>
                            <View className='btn' onClick={changeImage}>
                                <IconFont name='24_bianjiqi_chongyin' size={48}/>
                                <Text className='txt'>换图</Text>
                            </View>
                            <View className='btn' onClick={onFilpY}>
                                <IconFont name='24_bianjiqi_shuipingfanzhuan' size={48}/>
                                <Text className='txt'>水平</Text>
                            </View>
                            <View className='btn' onClick={onFilpX}>
                                <IconFont name='24_bianjiqi_chuizhifanzhuan' size={48}/>
                                <Text className='txt'>垂直</Text>
                            </View>
                            <View className='btn' onClick={onChangeAlpha}>
                                <View className='icon'>
                                    <Image className="icon_img" src={require("../../source/trans.png")}/>
                                </View>
                                <Text className='txt'>透明度</Text>
                            </View>
                            <View className='btn'>
                                <View className='icon'>
                                    <IconFont name='24_bianjiqi_shanchu' size={48}/>
                                </View>
                                <Text className='txt'>删除</Text>
                            </View>
                        </View>

                    case 4: // 换图
                        return <ChangeImage
                            onClose={cancelEdit}
                            onOk={onOk}
                        />

                    case 5: // 透明度
                        return <ChangeAlpha onClose={cancelEdit} onOk={onOk}/>
                }
            }))[0]}
        </View>
    }
}


