import Taro, {Component, useEffect, useState} from '@tarojs/taro';
import {Image, ScrollView, Text, View} from '@tarojs/components';
import {AtActivityIndicator, AtInput, AtSlider} from "taro-ui";
import './editor.less';
import './shell.less';
import {api, getToken} from '../../utils/net';
import IconFont from '../../components/iconfont';
import {observable} from 'mobx';
import {observer} from '@tarojs/mobx';
import UploadFile from "../../components/Upload/Upload";
import {debounce, deviceInfo, getNextPage, notNull, ossUrl, pageTotal, urlDeCode} from "../../utils/common";
import {userStore} from "../../store/user";
import Photos from "../me/photos";
import {templateStore} from "../../store/template";
import moment from "moment";

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


class Store {
    @observable
    tool = 0;


    @observable
    isEdit = false;
}


interface BaseProps {
    onClose: () => void,
    onOk?: () => void,
}

// 换模板
export const Template: Taro.FC<{ parent: PrintEdit; onClose: () => void, onOk: (docId) => void}> = ({onClose, onOk}) => {

    const router = Taro.useRouter();

    const prodList = Taro.useRef([]);

    const [typeList, setTypeList] = useState([]);
    const [active, setActive] = useState(0);
    const [templateList, setTemplateList] = useState([]);
    const [selected, setSelected] = useState(null);
    const defaultDoc = Taro.useRef(null);
    let total: number = 0;

    // 获取列表
    async function getListOfCategory(params: {tagId?: number | string, page?: number, size?: number, loadMore?: boolean} = {}) {

        const opt = {
            cid: router.params.cid || 41,
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


    // 重置DOC
    async function resetTemplate() {
        try {
            if (defaultDoc.current) {
                await callEditor("setDoc", defaultDoc.current, templateStore.editorPhotos.map(v => v.url));
            }
        } catch (e) {
            console.log("重置出错：", e)
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

    useEffect(() => {

        api("app.product/cate", {cid: router.params.cid}).then(res => {
            prodList.current = res;

            // 获取标签分类
            let arr = [];
            for (const item of res) {
                if (Number(item.tpl_category_id) === Number("41")) {
                    arr = item.tags;
                    break;
                }
            }
            getListOfCategory({tagId: arr[0].id, page: 0})
            setTypeList([...arr])
        }).catch(e => {
            console.log("获取商品分类出错：", e)
        })

        getDefaultDoc()
    }, []);

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
        console.log("选择的docid：", item.id)
        setSelected(Number(item.id));

        // 获取模板详情并向DOC更新
        Taro.showLoading({title: "正在为您设置..."})
        try {
            const res = await api("editor.tpl/one", {id: item.id});
            console.log("修改前：",res)
            const temp = {...res};
            temp.pages[0].thumbnail = "";
            console.log("修改后：", temp)
            await callEditor("setDoc", temp, templateStore.editorPhotos.map(v => v.url))
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

    const _onOk = () => {
        onOk && onOk(selected)
    }

    return <View className='switch-template'>
        <View className='brand'>
            <ScrollView className='type_list_view' scrollX>
                <View className='warp brand_fixed_wrap'>
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
            <View onClick={_onOk} className='icon'><IconFont name='24_gouxuan' size={48}/></View>
        </View>
    </View>;
};

interface ChangeImageProps {
    onClose: () => void,
    onOk?: () => void,
}

// 换图、换颜色
const ChangeImage: Taro.FC<ChangeImageProps> = (props) => {

    const {onClose, onOk} = props;

    const bars = ["素材库", "贴纸", "颜色"];
    const [active, setActive] = useState(0);
    const [selected, setSelected] = useState(null);
    const [list, setList] = useState([]);
    const defaultDoc = Taro.useRef(null);
    let total = 0;
    const stickersTotal = Taro.useRef(0);
    const [historyColor, setHistoryColor] = useState([]);
    const [colorActive, setColorActive] = useState(null);

    const colors = [
        {key: 1, color: "#5B8FF9"},
        {key: 2, color: "#5AD8A6"},
        {key: 3, color: "#5D7092"},
        {key: 4, color: "#F6BD16"},
        {key: 5, color: "#E8684A"},
        {key: 6, color: "#6DC8EC"},
        {key: 7, color: "#9270CA"},
        {key: 8, color: "#FF9D4D"},
        {key: 9, color: "#269A99"},
        {key: 10, color: "#FF99C3"},
        {key: 11, color: "#FFFFFF"},
        {key: 12, color: "#000000"},
    ]

    async function setHistoryColors(item) {
        const {id} = userStore;
        Taro.getStorage({
            key: `historyColor_${id}`,
            success: res => {
                console.log(res)
                if (res.data) {
                    const hc = JSON.parse(res.data) || [];
                    const arr = [...hc, item];
                    Taro.setStorage({
                        key: `historyColor_${id}`,
                        data: JSON.stringify(arr),
                    })
                }
            },
            fail: err => {
                console.log("在存储颜色时获取颜色失败：", err)
                const arr = [item];
                Taro.setStorage({
                    key: `historyColor_${id}`,
                    data: JSON.stringify(arr),
                })
            }
        })
    }

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
                await callEditor("setDoc", defaultDoc.current, templateStore.editorPhotos.map(v => v.url));
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

        const {id} = userStore;
        // 获取历史使用颜色
        Taro.getStorage({
            key: `historyColor_${id}`,
            success: res => {
                if (res.data) {
                    const c = JSON.parse(res.data) || [];
                    setHistoryColor([...c])
                }
            },
            fail: err => {
                console.log("获取历史颜色出错：", err)
            }
        })

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
        if (active === 2) {
            return;
        }
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

    const onSelectColor = key => {
        if (!notNull(colorActive) && key === colorActive) {
            setColorActive(null);

            return
        }
        setColorActive(key)
    }

    const onCancel = () => {
        resetImage();
        onClose && onClose()
    }

    const _onOk = () => {
        if (!notNull(colorActive)) {
            const idx = colors.findIndex(v => Number(v.key) === Number(colorActive));
            if (idx > -1) {
                setHistoryColors(colors[idx])
            }
        }
        onOk && onOk()
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
                        active !== 2 && list.map((item, idx) => {
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
                    {
                        active === 2
                            ? <View className="color_selector_main">
                                {
                                    historyColor.length > 0
                                        ? <View className="color_selector_item">
                                            <Text className="tit">使用过的</Text>
                                            <View className="colors_items">
                                                {
                                                    historyColor.map((value, index) => (
                                                        <View className="color_wrap" key={index}>
                                                            <View className="color_item"
                                                                  style={{borderColor: Number(value.key) === Number(colorActive) ? "#DFDFE0" : "transparent"}}
                                                                  onClick={() => onSelectColor(value.key)}>
                                                                <View className="color" style={{background: value.color}} />
                                                            </View>
                                                        </View>
                                                    ))
                                                }
                                            </View>
                                        </View>
                                        : null
                                }
                                <View className="color_selector_item">
                                    <Text className="tit">默认颜色</Text>
                                    <View className="colors_items">
                                        {
                                            colors.map((value, index) => (
                                                    <View className="color_wrap" key={index}>
                                                        <View className="color_item"
                                                              style={{borderColor: Number(value.key) === Number(colorActive) ? "#DFDFE0" : "transparent"}}
                                                              onClick={() => onSelectColor(value.key)}>
                                                            <View className="color" style={{background: value.color}} />
                                                        </View>
                                                    </View>
                                            ))
                                        }
                                    </View>
                                </View>
                            </View>
                            : null
                    }
                </View>
            </ScrollView>
            <View className='optBar'>
                <View className="icon" onClick={onCancel}><IconFont name='24_guanbi' size={48}/></View>
                <Text className='txt'>换图</Text>
                <View className='icon' onClick={_onOk}><IconFont name='24_gouxuan' size={48}/></View>
            </View>
        </View>
        <View className="mask"/>
    </View>
}

// 编辑文字
interface ChangeTextProps {
    data?: any
}
const ChangeText:Taro.FC<BaseProps & ChangeTextProps> = props => {

    const {onClose, onOk, data} = props;

    const defaultDoc = Taro.useRef(null);

    const [txt, setTxt] = useState("");

    useEffect(() => {
        if (data.r && data.r.text) {
            setTxt(data.r.text)
        }
    }, [])

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
                await callEditor("setDoc", defaultDoc.current, templateStore.editorPhotos.map(v => v.url));
            }
        } catch (e) {
            console.log("重置出错：", e)
        }
    }

    async function updateTxt(txt) {
        try{
            await callEditor("changeText", txt)
        }catch (e) {
            console.log("修改文字失败：", e)
        }
    }

    useEffect(() => {
        getDefaultDoc()
    }, [])

    const debounceFn = debounce(updateTxt, 1000)

    const onTextChange = (val, _) => {
        console.log(val)
        setTxt(val)
        if (!notNull(val)) {
            // @ts-ignore
            debounceFn(val)
        }
    }

    const _onClose = () => {
        resetImage()
        onClose && onClose()
    }

    const _onOk = () => {
        onOk && onOk()
    }

    return (
        <View className="template_change_text_container">
            <View className="act_bar">
                <View className="close" onClick={_onClose}><IconFont name="24_guanbi" size={48} color="#fff"/></View>
                <View className="submit" onClick={_onOk}><IconFont name="24_gouxuan" size={48} color="#fff"/></View>
            </View>
            <View className="input">
                <AtInput name="txt" value={txt} className="input_act" onChange={onTextChange} autoFocus focus />
            </View>
        </View>
    )
}

// 选择字体
const SelectFont: Taro.FC<BaseProps> = props => {

    const {onClose, onOk} = props;


    const defaultDoc = Taro.useRef(null);
    const [fontList, setFontList] = useState([]);
    const [fontSelected, setFontSelected] = useState(null);
    const [page, setPage] = useState(0);
    const _total = Taro.useRef(0)

    async function getFontList(data) {
        const opt = {
            page: data.start || 0,
            size: data.size || 15,
            loadMore: data.loadMore || false
        };

        try {
            const res = await api("admin.font/index", {
                page: opt.page,
                size: opt.size
            });
            console.log(res.total)
            _total.current = Number(res.total) || 0;
            let arr = [];
            if (opt.loadMore) {
                arr = [...fontList, ...res.list]
            } else {
                arr = res.list || []
            }
            setFontList([...arr])
        }catch (e) {
            console.log("获取字体列表出错：", e)
        }
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
                await callEditor("setDoc", defaultDoc.current, templateStore.editorPhotos.map(v => v.url));
            }
        } catch (e) {
            console.log("重置出错：", e)
        }
    }

    useEffect(() => {
        getFontList({start: 0})
        getDefaultDoc()
    }, [])

    const _onClose = () => {
        resetImage()
        onClose && onClose()
    }

    const _onOk = () => {
        onOk && onOk()
    }

    const loadMore = () => {
        console.log("加载更多", _total.current)
        const pagtion = getNextPage(page, pageTotal(_total.current, 15));
        console.log("分页参数：", pagtion)

        if (_total.current === fontList.length || _total.current < 15 || !pagtion.more) {
            return
        }
        setPage(pagtion.page)
        getFontList({
            start: pagtion.page,
            loadMore: true
        })
    }

    const onSelectFont = async (font: {id: number, name: string, thumbnail: string, font: string}) => {
        if (!notNull(fontSelected) && fontSelected === Number(font.id)) {
            setFontSelected(null);
            resetImage();
            return
        }

        setFontSelected(Number(font.id));

        try{
            await callEditor("changeTextFont", font["font-family"], font.font)
        }catch (e) {
            console.log("更换字体出错：", e)
        }
    }

    return(
        <View className="change_image_container">
            <View className="change_main">
                <ScrollView className="list_container" scrollY style={{height: 280}} onScrollToLower={loadMore}>
                    <View className="font_change_list_main">
                        {
                           fontList.map((value, index) => (
                               <View className="font_change_item" key={index} onClick={() => onSelectFont(value)}>
                                   <View className="left">
                                        <Image src={value.thumbnail} className="font_img"
                                               mode="aspectFit"
                                               style={{
                                                   width: window.screen.availWidth * 0.75 - 32
                                               }}
                                        />
                                   </View>
                                   <View className="right">
                                        <View className="dowload">
                                            <IconFont name={fontSelected === Number(value.id) ? "22_yixuanzhong" : "20_congyunduanxiazai"}
                                                      size={40}
                                                      // color={fontSelected === Number(value.id) ? "#ff4966" : "#999"}
                                            />
                                        </View>
                                   </View>
                               </View>
                           ))
                        }
                    </View>
                </ScrollView>
                <View className='optBar'>
                    <View className="icon" onClick={_onClose}><IconFont name='24_guanbi' size={48}/></View>
                    <Text className='txt'>字体</Text>
                    <View className='icon' onClick={_onOk}><IconFont name='24_gouxuan' size={48}/></View>
                </View>
            </View>
            <View className="mask"/>
        </View>
    )
}

// 设置样式
const ChangeFontStyle: Taro.FC<BaseProps> = props => {

    const {onClose, onOk} = props;
    const colors = [
        {key: 1, color: "#F6BD16"},
        {key: 2, color: "#5AD8A6"},
        {key: 3, color: "#5D7092"},
        {key: 4, color: "#F6BD16"},
        {key: 5, color: "#E8684A"},
        {key: 6, color: "#6DC8EC"},
        // {key: 7, color: "#9270CA"},
        // {key: 8, color: "#FF9D4D"},
        // {key: 9, color: "#269A99"},
        // {key: 10, color: "#FF99C3"},
        // {key: 11, color: "#FFFFFF"},
        // {key: 12, color: "#000000"},
    ]

    const fontAttribute = {
        style: [
            {
                key: 1,
                attr: "color",
                icon: "24_bianjiqi_yangshi1",
                colors: colors.map(v => ({...v, checked: false}))
            },
            {
                key: 2,
                attr: "strokeColor",
                icon: "24_bianjiqi_yangshi2",
                colors: colors.map(v => ({...v, checked: false}))
            },
            {
                key: 3,
                attr: "bgColor",
                icon: "24_bianjiqi_yangshi3",
                colors: colors.map(v => ({...v, checked: false}))
            },
            {
                key: 4,
                attr: "bgOpacity",
                icon: "24_bianjiqi_yangshi4",
                colors: colors.map(v => ({...v, checked: false}))
            },
        ],
        align: [
            {key: "left", icon: "24_bianjiqi_zuoduiqi"},
            {key: "center", icon: "24_bianjiqi_juzhongduiqi"},
            {key: "right", icon: "24_bianjiqi_youduiqi"},
        ]
    }


    const defaultDoc = Taro.useRef(null);
    const activeStyle = Taro.useRef(0);
    const alignActive = Taro.useRef(0);
    const activeColor = Taro.useRef(null);
    const _fontAttribute = Taro.useRef(fontAttribute); // 备份数据，以提供数据的操作还原
    const [styleSelect, setStyleSelect] = useState(fontAttribute.style[activeStyle.current]);
    const [styleAlign, setStyleAlign] = useState(fontAttribute.align[alignActive.current].key);

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
                await callEditor("setDoc", defaultDoc.current, templateStore.editorPhotos.map(v => v.url));
            }
        } catch (e) {
            console.log("重置出错：", e)
        }
    }

    async function updateDocFont(value: string | object) {
        let temp = {};
        switch (styleSelect.attr) {
            case "color": temp = {color: notNull(value) ? "#000" : value}; break;
            case "strokeColor": temp = {strokeColor: notNull(value) ? "#000" : value}; break;
            case "bgColor": temp = {bgColor: value}; break;
            case "bgOpacity": temp = {bgColor: value}; break;
        }
        try{
            await callEditor("changeTextAttr", typeof value === "string" ? temp : value )
        }catch (e) {
            console.log("修改文字样式出错：", e)
        }
    }

    useEffect(() => {
        getDefaultDoc()

        updateDocFont({align: "left"})
    }, [])

    const _onClose = () => {
        resetImage()
        onClose && onClose()
    }

    const _onOk = () => {
        onOk && onOk()
    }

    const onSelectColor = (value) => {
        let _colors = [...styleSelect.colors];
        console.log(value, activeColor.current)
        if (!notNull(activeColor.current) && value.key === activeColor.current) {
            const idx = _colors.findIndex(v => v.key === activeColor.current);

            if (idx > -1) {
                _colors[idx].checked = false;
            }
            activeColor.current = null;
            updateDocFont("")
        } else {
            const idx = _colors.findIndex(v => v.key === value.key);
            if (idx > -1) {
                // 先取消，再选中
                _colors = _colors.map(v => {
                    return {
                        ...v,
                        checked: false
                    }
                });
                _colors[idx].checked = !_colors[idx].checked
                activeColor.current = Number(value.key);
                if (styleSelect.attr === "bgOpacity") {
                    updateDocFont(`${_colors[idx].color}50`)
                } else {
                    updateDocFont(_colors[idx].color)
                }
            }
        }
        console.log("变更过的值：", _colors)
        setStyleSelect(prev => ({...prev, colors: [..._colors]}));
        _fontAttribute.current.style[activeStyle.current].colors = [..._colors];

    }

    const onStyleClick = () => {
        let num = activeStyle.current;
        if (num === 3) {
            num = 0
        } else {
            num += 1;
        }
        activeStyle.current = num;
        setStyleSelect({..._fontAttribute.current.style[num]});
        console.log("当前下标：",num, "当前样式：",_fontAttribute.current.style[num] )
    }

    const onAlignClick = () => {
        let num = alignActive.current;
        if (num === 2) {
            num = 0
        } else {
            num += 1;
        }
        alignActive.current = num;
        setStyleAlign(fontAttribute.align[num].key);
        updateDocFont({align: styleAlign})
    }

    return (
        <View className="change_image_container">
            <View className="change_main">
                <ScrollView className="list_container" scrollY style={{height: 280}}>
                    <View className="font_change_style_container">
                        <View className="change_item">
                            <Text className="tit">样式和对齐</Text>
                            <View className="change_item_ctx">
                                <View className="style_item" onClick={onStyleClick}>
                                    <IconFont name={styleSelect.icon} size={48} />
                                </View>
                                <View className="border"/>
                                <View className="style_item" onClick={onAlignClick}>
                                    <IconFont name={fontAttribute.align[alignActive.current].icon} size={48} />
                                </View>
                            </View>
                        </View>
                        <View className="change_item">
                            <Text className="tit">颜色</Text>
                            <View className="colors_items">
                                {
                                    styleSelect.colors.map((value, index) => (
                                        <View className="color_wrap" key={index}>
                                            <View className="color_item"
                                                  onClick={() => onSelectColor(value)}
                                                  style={{
                                                      borderColor: value.checked ? "#FF4966" : "transparent"
                                                  }}
                                            >
                                                <View className="color" style={{background: value.color}} />
                                            </View>
                                        </View>
                                    ))
                                }
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <View className='optBar'>
                    <View className="icon" onClick={_onClose}><IconFont name='24_guanbi' size={48}/></View>
                    <Text className='txt'>样式</Text>
                    <View className='icon' onClick={_onOk}><IconFont name='24_gouxuan' size={48}/></View>
                </View>
            </View>
            <View className="mask"/>
        </View>
    )
}

// 透明度
const ChangeAlpha: Taro.FC<ChangeImageProps> = (props) => {

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

const ToolBar0: Taro.FC<{ parent: PrintEdit }> = ({parent}) => {

    const router = parent.$router;

    const [type, setType] = useState(0);
    const [templateList, setTemplateList] = useState<any[]>([]);
    const currentData = Taro.useRef({
        total: 0,
        curr: 0
    })

    async function renderTemplateDoc(id) {
        // // 获取模板详情并向DOC更新
        Taro.showLoading({title: "正在为您设置..."})
        try {
            const res = await api("editor.tpl/one", {id});
            console.log("修改前：",res)
            const temp = {...res};
            // temp.pages[0].thumbnail = "";
            console.log("修改后：", temp)
            await callEditor("setDoc", temp, templateStore.editorPhotos.map(v => v.url))
        }catch (e) {
            console.log("设置DOC出错：", e)
        }
        Taro.hideLoading()
    }

    function getTemplateForPhotoNum(params: { cid?: string | number, num?: number } = {}) {
        return new Promise<any>(async (resolve, reject) => {
            const opt = {
                cid: params.cid || router.params.tplid,
                num: params.num || 1,
            }
            try {
                const res = await api("editor.tpl/index", {
                    cid: opt.cid,
                    num: opt.num,
                    page: 1,
                    size: 20
                });
                currentData.current = {...currentData.current, total: res.total};
                resolve(res.list || [])
            }catch (e) {
                reject(e)
            }
        })
    }

    useEffect(() => {
        getTemplateForPhotoNum().then(res => {
            setTemplateList([...res])
        })
    }, [])

    const cancelMode = () => {
        setType(0);
    }

    // 从图集选图后
    const onPhotoSelect = async (data: {ids: [], imgs: [], attrs: []}) => {
        setType(0);
        if (data.ids.length + templateStore.editorPhotos.length > Number(router.params.tplmax)) {
            Taro.showToast({
                title: `最多选择${router.params.tplmax}张图片`,
                icon: "none"
            })
            return
        }
        try {

            currentData.current = {...currentData.current, curr: 0}

            let arr = [...templateStore.editorPhotos];

            data.ids.forEach((value, index) => {
                const idx = arr.findIndex(v => v.id == value);
                if (idx === -1) {
                    arr.push({
                        id: value,
                        url: data.imgs[index]
                    })
                }
            })

            templateStore.editorPhotos = arr;

            getTemplateForPhotoNum({num: arr.length}).then(res => {

                setTemplateList([...res]);
                const cur = res[currentData.current.curr];
                if (cur) {
                    renderTemplateDoc(cur.id)
                } else {
                    console.log(`没有查询到对应图片数量（${arr.length}）的模板`, res)
                }
            })

        }catch (e) {
            console.log("选图出错：", e)
        }
    }

    const onChangeTemplate = () => {
        const obj = {...currentData.current};
        obj.curr += 1;
        if (obj.curr > obj.total) {
            obj.curr = 0
        }
        const curr = templateList[obj.curr];
        if (curr) {
            renderTemplateDoc(curr.id)
        }
        console.log("自增结果：", obj)
        currentData.current = {...obj}
    }

    return ([type].map((t) => {
        switch (t) {
            case 0:
                return <View className='tools' style={t == 0 ? {padding: 0} : {padding: "0 13%"} }>
                    <View className='btn' onClick={() => setType(1)}>
                        <IconFont name='24_bianjiqi_chongyin' size={48}/>
                        <Text className='txt'>添加</Text>
                    </View>
                    <View onClick={onChangeTemplate} className='btn'>
                        <IconFont name='24_bianjiqi_moban' size={48}/>
                        <Text className='txt'>模板</Text>
                    </View>
                </View>;

            case 1: // 添加
                return <View className="photo_picker_container photo_picker_animate" style={{
                    width: deviceInfo.windowWidth,
                    height: deviceInfo.windowHeight,
                    padding: 0
                }}>
                    <Photos editSelect
                            onClose={cancelMode}
                            onPhotoSelect={onPhotoSelect}
                    />
                </View>;

            //模板
            // case 2:
            //     return <Template parent={parent} onClose={() => setType(0)} onOk={() => setType(0)} />;
        }
    }))[0] as any;
}

interface PrintEditState {
    size?: { width: string | number; height: string | number };
    data?: number;
    loadingTemplate?: boolean;
    textInfo: any
}
@observer
export default class PrintEdit extends Component<any, PrintEditState> {

    public store = new Store();

    private tplId: any = 0;
    private docId: any = 0;

    constructor(p) {
        super(p);
        // console.log(this.$router.params);
        this.tplId = this.$router.params['tpl_id'] || 0;
        this.docId = this.$router.params['id'] || 0;

        this.state = {
            loadingTemplate: true,
            textInfo: null
        };
    }

    public editorProxy: WindowProxy | null | undefined;

    async componentDidMount() {
        // Taro.showLoading({title: "请稍候"});
        // @ts-ignore
        this.editorProxy = document.querySelector<HTMLIFrameElement>(".editor_frame").contentWindow;
        editorProxy = this.editorProxy;
        window.addEventListener("message", this.onMsg);

        const {img}: any = urlDeCode(this.$router.params);
        templateStore.editorPhotos = [{id: "", url: img}]
    }


    componentWillUnmount() {
        editorProxy = null;
        window.removeEventListener("message", this.onMsg);
    }

    getPhotoParams = () => {
        // 解析参数
        let params: any = {};

        try {
            const res = Taro.getStorageSync(`${userStore.id}_photo_${moment().date()}`);
            if (res) {
                params = JSON.parse(res)
            } else {
                if (Object.keys(templateStore.photoSizeParams).length > 0) {
                    params = templateStore.photoSizeParams
                } else {
                    Taro.showToast({title: "系统错误，请稍后重试", icon: "none"})
                }
            }
        } catch (e) {
            if (Object.keys(templateStore.photoSizeParams).length > 0) {
                params = templateStore.photoSizeParams
            } else {
                Taro.showToast({title: "系统错误，请稍后重试", icon: "none"})
            }
        }

        return params
    }

    onLoad = async (_?: number) => {

    }

    onLoadEmpty = async (_?: number) => {

        try {
            const res = await api("editor.tpl/index", {cid: this.$router.params.tplid, num: 1});

            const proId = this.$router.params.proid || null;

            let data = process.env.NODE_ENV == 'production' ? "20201251" : proId ? proId : res.list[0].id;
            const localParams = this.getPhotoParams();
            const current = localParams.path[Number(this.$router.params.idx)];
            if (current && current.edited && current.edited == true && !notNull(current.doc)) {
                console.log("已编辑过的模板")
                data = current.doc;
            } else {
                console.log("没有编辑过的模板")
            }

            const {img}: any = urlDeCode(this.$router.params);
            await callEditor("setDoc", data, [img])

        }catch (e) {
            console.log("初始化失败：", e)
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
                    this.setState({
                        loadingTemplate: false
                    });
                    this.onLoadEmpty(data.data);
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
            case "container":
                this.store.tool = 1;
                break;
            case "text":
                this.store.tool = 2;
                this.setState({textInfo: item})
                break;
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
        const doc: any = await callEditor("getDoc");
        console.log(doc)
        Taro.showLoading({
            title: "合成中..."
        })
        try {
            const res = await api("editor.upload/preview", {
                content: {
                    type: "page",
                    data: {...doc},
                },
                key: `photo_${userStore.id}_1`
            }, true);

            const img = res.cdnUrl;

            const localParams = this.getPhotoParams();

            console.log("本地数据：", localParams)

            const temp = {...localParams}
            const obj = {
                url: img,
                attr: `${doc.width}*${doc.height}`,
                edited: true,
                doc
            };
            if (temp.path[Number(this.$router.params.idx)]) {
                temp.path[Number(this.$router.params.idx)] = obj;
            } else {
                temp.path.push(obj)
            }

            console.log("更新后的params：", temp);

            try {
                Taro.setStorageSync(`${userStore.id}_photo_${moment().date()}`, JSON.stringify(temp));
                templateStore.photoSizeParams = temp
            } catch (e) {
                console.log("本地存储出错：将存入store", e)
                templateStore.photoSizeParams = temp
            }
            Taro.hideLoading()
            Taro.navigateBack()

        }catch (e) {
            console.log("生成预览图出错：", e)
            Taro.hideLoading()
            Taro.showToast({
                title: "生成预览图出错",
                icon: "none"
            })
        }
        Taro.hideLoading()
    }

    changeImage = () => {
        this.store.tool = 4;
        this.store.isEdit = true;
    }

    onOk = () => {
        this.store.tool = 0;
        this.store.isEdit = false
    }

    cancelEdit = () => {
        this.store.tool = 0;
        this.store.isEdit = false;
        this.setState({textInfo: null})
    }

    changeTxt = () => {
        this.store.tool = 6;
        this.store.isEdit = true;
    }

    selectFont = () => {
        this.store.tool = 7;
        this.store.isEdit = true;
    }

    changeFontStyle = () => {
        this.store.tool = 8;
        this.store.isEdit = true;
    }

    // 水平翻转
    onFilpY = async () => {
        try {
            await callEditor("flipH");
        } catch (e) {
        }
    }

    // 垂直翻转
    onFilpX = async () => {
        try {
            await callEditor("flipV")
        } catch (e) {

        }
    }

    onChangeAlpha = () => {
        // alpha
        this.store.tool = 5;
        this.store.isEdit = true;
    }



    render() {
        const {loadingTemplate, size } = this.state;
        const {tool} = this.store;

        return <View className='editor-page'>
            <View className='header'>
                <View onClick={this.back}>
                    <IconFont name='24_shangyiye' color='#000' size={48}/>
                </View>
                <View onClick={this.next} className='right'>完成</View>
            </View>
            <View className="editor" style={size ? {height: size.height} : undefined}>
                {/* eslint-disable-next-line react/forbid-elements */}
                <iframe className="editor_frame" src={process.env.NODE_ENV == 'production'?`/editor/mobile?token=${getToken()}&tpl_id=${this.tplId}&doc_id=${this.docId}&t=9998}`:`http://192.168.0.166/editor/mobile?token=${getToken()}&tpl_id=${this.tplId}&doc_id=${this.docId}&t=9998}`}/>
                {loadingTemplate ?
                    <View className='loading'><AtActivityIndicator size={64} mode='center'/></View> : null}
            </View>

            {([tool].map((s) => {
                switch (s) {
                    case 0:
                        return <ToolBar0 parent={this} />;

                    case 1:
                        return <View key={s} className='tools'>
                            <View className='btn' onClick={this.changeImage}>
                                <IconFont name='24_bianjiqi_chongyin' size={48}/>
                                <Text className='txt'>换图</Text>
                            </View>
                            <View className='btn' onClick={this.onFilpY}>
                                <IconFont name='24_bianjiqi_shuipingfanzhuan' size={48}/>
                                <Text className='txt'>水平</Text>
                            </View>
                            <View className='btn' onClick={this.onFilpX}>
                                <IconFont name='24_bianjiqi_chuizhifanzhuan' size={48}/>
                                <Text className='txt'>垂直</Text>
                            </View>
                            <View className='btn' onClick={this.onChangeAlpha}>
                                <View className='icon'>
                                    <Image className="icon_img" src={require("../../source/trans.png")}/>
                                </View>
                                <Text className='txt'>透明度</Text>
                            </View>
                            {/*<View className='btn'>*/}
                            {/*    <View className='icon'>*/}
                            {/*        <IconFont name='24_bianjiqi_shanchu' size={48}/>*/}
                            {/*    </View>*/}
                            {/*    <Text className='txt'>删除</Text>*/}
                            {/*</View>*/}
                        </View>

                    case 2: // 文字编辑
                        return <View key={s} className='tools'>
                            <View className='btn' onClick={this.changeTxt}>
                                <IconFont name='24_bianjiqi_huantu' size={48}/>
                                <Text className='txt'>编辑</Text>
                            </View>
                            <View className='btn' onClick={this.selectFont}>
                                <IconFont name='24_bianjiqi_ziti' size={48}/>
                                <Text className='txt'>字体</Text>
                            </View>
                            <View className='btn' onClick={this.changeFontStyle}>
                                <IconFont name='24_bianjiqi_yangshi' size={48}/>
                                <Text className='txt'>样式</Text>
                            </View>
                            {/*<View className='btn'>*/}
                            {/*    <View className='icon'>*/}
                            {/*        <IconFont name='24_bianjiqi_shanchu' size={48}/>*/}
                            {/*    </View>*/}
                            {/*    <Text className='txt'>删除</Text>*/}
                            {/*</View>*/}
                        </View>

                    case 4: // 换图
                        return <ChangeImage
                            onClose={this.cancelEdit}
                            onOk={this.onOk}
                        />

                    case 5: // 透明度
                        return <ChangeAlpha onClose={this.cancelEdit} onOk={this.onOk}/>

                    case 6: // 编辑文字
                        return <ChangeText onClose={this.cancelEdit} data={this.state.textInfo} onOk={this.onOk} />

                    case 7: // 选择字体
                        return <SelectFont onClose={this.cancelEdit} onOk={this.onOk} />

                    case 8: // 修改字体样式
                        return <ChangeFontStyle onClose={this.cancelEdit} onOk={this.onOk} />

                }
            }))[0]}
        </View>
    }
}
