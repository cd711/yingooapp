import Taro, {Component, Config, useEffect, useState} from '@tarojs/taro';
import {Image, ScrollView, Text, View} from '@tarojs/components';
import {AtActivityIndicator, AtInput, AtSlider} from "taro-ui";
import './editor.less';
import './shell.less';
import {api, getToken} from '../../../utils/net';
import IconFont from '../../../components/iconfont';
import {observable} from 'mobx';
import {observer} from '@tarojs/mobx';
import UploadFile from "../../../components/Upload/Upload";
import {
    debounce,
    deviceInfo,
    getNextPage,
    getURLParamsStr, getUserKey,
    notNull,
    ossUrl,
    pageTotal, removeDuplicationForArr, sleep, updateChannelCode,
    urlDeCode, urlEncode
} from "../../../utils/common";
import {userStore} from "../../../store/user";
import config from "../../../config";
import wx from 'weixin-js-sdk'
import photoStore from "../../../store/photo";
import PhotosEle from "../../../components/photos/photos";
import page from "../../../utils/ext";

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
                await callEditor("setDoc", defaultDoc.current, photoStore.editorPhotos.map(v => v.url));
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
            await callEditor("setDoc", temp, photoStore.editorPhotos.map(v => v.url))
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
                        <View className="type_item" key={index+""} onClick={() => changeType(index)}>
                            <Text className={`txt ${active === index ? "active" : ""}`}>{value.name}</Text>
                            {active === index ?
                                <Image src={require("../../../source/switchBottom.png")} className="filter_bar_img"/>
                                : null}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
        <ScrollView className='template_lice_container' scrollY onScrollToLower={loadMore}>
            <View className="template_list">
                {templateList.map((value, index) => (
                    <View className="template_item" key={index+""} onClick={() => onSelect(value)}
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
                await callEditor("setDoc", defaultDoc.current, photoStore.editorPhotos.map(v => v.url));
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
                    <View className="filter_bar_item" key={index+""} onClick={() => changeType(index)}>
                        <Text className={`name ${index === active ? "active" : ""}`}>{value}</Text>
                        {active === index ?
                            <Image src={require("../../../source/switchBottom.png")} className="filter_bar_img"/> : null}
                    </View>
                ))}
            </View>
            <ScrollView className="shell_list_container" scrollY style={{height: 280}} onScrollToLower={loadMore}>
                <View className="list_main">
                    {active === 0
                        ? <View className="list_item">
                            <UploadFile
                                extraType={0}
                                type="card"
                                style={{
                                    height: "124px"
                                }}
                                uploadType="image"
                                onChange={uploadFile}/>
                        </View>
                        : null}
                    {
                        active !== 2 && list.map((item, idx) => {
                            return <View className="list_item" key={idx+""}>
                                <View className="img_item" key={idx+""} onClick={() => onSelect(item, idx)}>
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
                                                        <View className="color_wrap" key={index+""}>
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
                                                    <View className="color_wrap" key={index+""}>
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
                await callEditor("setDoc", defaultDoc.current, photoStore.editorPhotos.map(v => v.url));
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
                await callEditor("setDoc", defaultDoc.current, photoStore.editorPhotos.map(v => v.url));
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
                               <View className="font_change_item" key={index+""} onClick={() => onSelectFont(value)}>
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
                await callEditor("setDoc", defaultDoc.current, photoStore.editorPhotos.map(v => v.url));
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
                                    {/* @ts-ignore */}
                                    <IconFont name={styleSelect.icon} size={48} />
                                </View>
                                <View className="border"/>
                                <View className="style_item" onClick={onAlignClick}>
                                    {/* @ts-ignore */}
                                    <IconFont name={fontAttribute.align[alignActive.current].icon} size={48} />
                                </View>
                            </View>
                        </View>
                        <View className="change_item">
                            <Text className="tit">颜色</Text>
                            <View className="colors_items">
                                {
                                    styleSelect.colors.map((value, index) => (
                                        <View className="color_wrap" key={index+""}>
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
                <View className="icon"><Image src={require("../../../source/trans.png")} className="img"/></View>
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
            console.log("将要设置的图片：", JSON.parse(JSON.stringify(photoStore.editorPhotos)))
            await callEditor("setDoc", res, photoStore.editorPhotos.map(v => v.url))
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
                // await photoStore.getServerParams({key: getUserKey(), setLocal: true})
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
        console.log("编辑图片的长度：", photoStore.editorPhotos.length)
        getTemplateForPhotoNum({num: photoStore.editorPhotos.length}).then(res => {
            setTemplateList([...res])
        })
    }, [photoStore.editorPhotos.length])

    const cancelMode = () => {
        setType(0);
    }

    // 从图集选图后
    const onPhotoSelect = async (data: {ids: [], imgs: [], attrs: []}) => {
        setType(0);
        const count = photoStore.photoProcessParams.imageCount;
        if (count > 0 && data.ids.length + photoStore.editorPhotos.length > photoStore.photoProcessParams.imageCount) {
            Taro.showToast({
                title: `最多选择${photoStore.photoProcessParams.imageCount}张图片`,
                icon: "none"
            })
            return
        }
        try {

            currentData.current = {...currentData.current, curr: 0}

            const arr = [...photoStore.editorPhotos];

            data.ids.forEach((value, index) => {
                const idx = arr.findIndex(v => v.id == value);
                if (idx === -1) {
                    arr.push({
                        id: value,
                        url: data.imgs[index]
                    })
                }
            })

            console.log("已选择的图片：", arr)
            photoStore.editorPhotos = arr;

            getTemplateForPhotoNum({num: arr.length}).then(async res => {

                setTemplateList([...res]);
                const cur = res[currentData.current.curr];
                if (cur) {
                    renderTemplateDoc(cur.id);
                    const path = [...photoStore.photoProcessParams.photo.path];
                    if (!notNull(router.params.idx)) {
                        path[parseInt(router.params.idx)].extraIds = data.ids;
                    }
                    await photoStore.updateServerParams(parent.userKey(), {
                        usefulImages: removeDuplicationForArr(data.ids.map((value, index) => ({id: value, url: data.imgs[index]})), photoStore.photoProcessParams.usefulImages),
                        photo: {
                            ...photoStore.photoProcessParams.photo,
                            path
                        }
                    })
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

    const addPhotos = () => {
        setType(1)
    }

    return type === 0
        ? <View className='tools' style={0 == 0 ? {padding: 0} : {padding: "0 13%"}}>
            <View className='btn' onClick={addPhotos}>
                <IconFont name='24_bianjiqi_chongyin' size={48}/>
                <Text className='txt'>添加</Text>
            </View>
            <View onClick={onChangeTemplate} className='btn'>
                <IconFont name='24_bianjiqi_moban' size={48}/>
                <Text className='txt'>模板</Text>
            </View>
        </View>
        : type === 1
            ? <View className="photo_picker_container photo_picker_animate" style={{
                width: deviceInfo.windowWidth,
                height: deviceInfo.windowHeight,
                padding: 0
            }}>
                <PhotosEle
                    editSelect
                    onClose={cancelMode}
                    defaultSelect={photoStore.photoProcessParams.usefulImages}
                    onPhotoSelect={onPhotoSelect} />
            </View>
            : <View />
}

interface PrintEditState {
    size?: { width: string | number; height: string | number };
    data?: number;
    loadingTemplate?: boolean;
    textInfo: any;
    hiddenBar: boolean
}
@observer
@page({
    share: true
})
export default class PrintEdit extends Component<any, PrintEditState> {

    public store = new Store();

    private tplId: any = 0;
    private docId: any = 0;

    config: Config = {
        navigationBarTitleText: '编辑中',
    }

    constructor(p) {
        super(p);
        this.tplId = this.$router.params['tpl_id'] || 0;
        this.docId = this.$router.params['id'] || 0;

        this.state = {
            loadingTemplate: true,
            textInfo: null,
            hiddenBar: false
        };
    }

    public editorProxy: WindowProxy | null | undefined;
    public routerParams = this.$router.params;

    userKey() {
        if (this.routerParams.key) {
            return this.routerParams.key
        }
        return getUserKey()
    }

    async componentDidShow() {
        // 当为小程序直接跳转时执行
        if (this.routerParams.hidden && this.routerParams.hidden == "t") {

            console.log("是否隐藏返回按钮：", this.routerParams.hidden == "t")
            this.setState({hiddenBar: true})

            if (this.routerParams.key) {
                const tok = {
                    token: this.routerParams.tok,
                    expires: 9999999999
                };
                Taro.setStorageSync("token", tok)
            }

            await photoStore.getServerParams({key: this.userKey(), setLocal: true});

            if (this.routerParams.init && this.routerParams.init == "t") {
                photoStore.editorPhotos = [...photoStore.photoProcessParams.editPhotos]
            }

        }

    }

    async componentWillMount() {
        if (this.routerParams.key) {
            const tok = {
                token: this.routerParams.tok,
                expires: 9999999999
            };
            Taro.setStorageSync("token", tok)
        }

        await photoStore.getServerParams({key: this.userKey(), setLocal: true});
        console.log(89898989898, photoStore.photoProcessParams.originalData)
        if (this.routerParams.init && this.routerParams.init == "t") {
            photoStore.editorPhotos = [...photoStore.photoProcessParams.editPhotos]
        }

        if (notNull(this.routerParams.init)) {
            const {img}: any = urlDeCode(this.$router.params);
            photoStore.editorPhotos = [{id: "", url: img}];
        }
    }

    async componentDidMount() {
        this.editorProxy = document.querySelector<HTMLIFrameElement>(".editor_frame").contentWindow;
        editorProxy = this.editorProxy;

        window.addEventListener("message", this.onMsg);


        // 再次编辑时使用存储的图片数据
        if (!notNull(this.routerParams.local) && this.routerParams.local == "t") {
            const idx = parseInt(this.routerParams.idx);
            const current = photoStore.photoProcessParams.photo.path[idx];
            if (current) {
                photoStore.editorPhotos = [...current.originalData]
            }
        }
    }

    getCurrentToken = () => {
        if (this.routerParams.key) {
            return this.routerParams.tok
        }
        return getToken()
    }


    componentWillUnmount() {
        editorProxy = null;
        window.removeEventListener("message", this.onMsg);
    }


    onLoadEmpty = async (_?: number) => {
        const routerParams = this.$router.params;
        try {

            const res = await api("editor.tpl/index", {cid: routerParams.tplid, num: photoStore.editorPhotos.length});
            console.log("查询结果：", res)
            const pictureSize = photoStore.photoProcessParams.pictureSize;

            const proId = photoStore.photoProcessParams.photoTplId;

            if (!notNull(routerParams.init) && routerParams.init == "t") {

                const id = !notNull(proId) ? proId : res.list[0].id;
                console.log("开始初始化图片：", id, photoStore.editorPhotos.map(v => v.url))
                await callEditor("setDoc", id, photoStore.editorPhotos.map(v => v.url), pictureSize)
            } else {
                let data = process.env.NODE_ENV == 'production' ? "20201251" : proId ? proId : res.list[0].id;

                const localParams = photoStore.photoProcessParams.photo;
                const current = localParams.path[Number(routerParams.idx)];
                let imgArr = [];
                const {img}: any = urlDeCode(routerParams);
                if (current && current.edited && current.edited == true && !notNull(current.doc)) {
                    data = current.doc;
                    console.log("已编辑过的模板：", data)
                    console.log("当前照片曾经使用的图片", JSON.parse(JSON.stringify(current.originalData)))
                    photoStore.editorPhotos = [...current.originalData]
                    imgArr = current.originalData.map(v => v.url)
                } else {
                    console.log("没有编辑过的模板")

                    imgArr = [img]
                    photoStore.editorPhotos = [{id: "", url: img}]
                }

                console.log("最终传递的值：", JSON.parse(JSON.stringify(data)), imgArr, pictureSize)
                await callEditor("setDoc", JSON.parse(JSON.stringify(data)), imgArr, pictureSize)
            }

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

    onLoad = async (_?: number) => {

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

    onSelected = (item?: { id: any, type: "img" | "text" | "container", userEditable: number}) => {
        if (this.store.isEdit) {
            return;
        }
        if (!item || (item && !notNull(item.userEditable) && item.userEditable === 0)) {
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
            if (deviceInfo.env == "h5") {
                window.location.href = updateChannelCode("/");
            } else {
                Taro.switchTab({url: updateChannelCode("/pages/tabbar/index/index")});
            }
        }
    }

    next = async () => {

        Taro.showLoading({
            title: "合成中..."
        })
        try {

            // 是否从照片模板直接跳转过来
            const fastJump: boolean = this.routerParams.init == "t";

            const doc: any = await callEditor("getDoc");
            console.log(doc)

            const res = await api("editor.upload/preview", {
                content: {
                    type: "page",
                    data: {...doc},
                },
                key: `photo_${userStore.id}_1`
            }, true);

            const img = res.cdnUrl;

            const localParams = photoStore.photoProcessParams.photo;

            const temp: any = {...localParams}

            let obj: any = {
                url: img,
                attr: `${doc.width}*${doc.height}`,
                edited: true,
                doc,
                originalData: photoStore.editorPhotos,
            };

            // 从模板直接跳转过来的话需要初始化一些参数
            if (fastJump) {
                obj = {
                    ...obj,
                    id: "",
                    count: 1
                }
            }

            console.log("本地数据：", this.$router.params.idx, JSON.parse(JSON.stringify(localParams)))

            if (temp.path[Number(this.$router.params.idx)]) {
                let ids = photoStore.photoProcessParams.photo.path[Number(this.$router.params.idx)].extraIds;
                if (!notNull(this.routerParams.imgID) && this.routerParams.imgID != "-1") {
                    if (!notNull(ids)) {
                        const idx = ids.indexOf(this.routerParams.imgID);
                        if (idx == -1) {
                            ids.push(this.routerParams.imgID)
                        }
                    } else {
                        ids = new Array<string | number>();
                        ids.push(this.routerParams.imgID)
                    }
                }
                temp.path[Number(this.$router.params.idx)] = {
                    ...obj,
                    extraIds: ids
                }
            } else {
                temp.path.push(obj)
            }

            console.log("更新后的params：", JSON.parse(JSON.stringify(temp)));

            await photoStore.updateServerParams(this.userKey(), {
                photo: temp,
                imageCount: 0,
                photoTplId: ""
            })
            await sleep(300)
            Taro.hideLoading()

            const objParams: any = {
                id: this.routerParams.cid,
                cid: this.routerParams.tplid,
            };
            const str = getURLParamsStr(urlEncode(objParams));

            // 从照片模板跳转过来，在完成后就跳转到照片冲印列表页，否则就返回上一页
            if (this.state.hiddenBar) {
                if (fastJump) {
                    // 小程序跳转到照片冲印列表页
                    wx.miniProgram.redirectTo({
                        url: updateChannelCode(`/pages/editor/pages/printing/change?${str}`)
                    })
                } else {
                    // 小程序返回上一页
                    wx.miniProgram.navigateBack()
                }
            } else {
                // 网页跳转到照片冲印列表页
                if (fastJump) {
                    Taro.redirectTo({
                        url: updateChannelCode(`/pages/editor/pages/printing/change?${str}`)
                    })
                } else {
                    // 网页返回上一页
                    Taro.navigateBack()
                }
            }

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

    // alpha
    onChangeAlpha = () => {
        this.store.tool = 5;
        this.store.isEdit = true;
    }

    switchRender = (tool) => {
        let ele = <View />
        if (tool == 0) {
            ele = <ToolBar0 parent={this} />;
        } else if (tool == 1) {
            ele = <View className='tools'>
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
                        <Image className="icon_img" src={require("../../../source/trans.png")}/>
                    </View>
                    <Text className='txt'>透明度</Text>
                </View>
            </View>
        } else if (tool==2) {
            ele = <View className='tools'>
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
            </View>
        } else if (tool == 4) {
            ele = <ChangeImage onClose={this.cancelEdit} onOk={this.onOk}/>
        } else if (tool == 5) {
            ele = <ChangeAlpha onClose={this.cancelEdit} onOk={this.onOk}/>
        } else if (tool == 6) {
            ele = <ChangeText onClose={this.cancelEdit} data={this.state.textInfo} onOk={this.onOk} />
        } else if (tool == 7) {
            ele = <SelectFont onClose={this.cancelEdit} onOk={this.onOk} />
        } else if (tool == 8) {
            ele = <ChangeFontStyle onClose={this.cancelEdit} onOk={this.onOk} />
        }
        return ele
    }

    getUrl = () => {
        return updateChannelCode(process.env.NODE_ENV == 'production'
            ? `/editor/mobile?token=${this.getCurrentToken()}&tpl_id=${this.tplId}&doc_id=${this.docId}&t=9998`
            :`${config.editorUrl}/editor/mobile?token=${this.getCurrentToken()}&tpl_id=${this.tplId}&doc_id=${this.docId}&t=9998`)
    }

    render() {
        const {loadingTemplate, size, hiddenBar} = this.state;
        const {tool} = this.store;

        return <View className='editor-page'>
            <View className='header'
                  style={{
                      justifyContent: hiddenBar ? "flex-end" : "space-between"
                  }}
            >
                {
                    !hiddenBar
                        ?  <View onClick={this.back}>
                            <IconFont name='24_shangyiye' color='#000' size={48}/>
                        </View>
                        : null
                }
                <View onClick={this.next} className='right'>完成</View>
            </View>
            <View className="editor" style={size ? {height: size.height} : undefined}>
                <iframe className="editor_frame" src={this.getUrl()}/>
                {loadingTemplate
                    ? <View className='loading'><AtActivityIndicator size={64} mode='center'/></View>
                    : null}
            </View>
            {
                this.switchRender(tool)
            }
        </View>
    }
}
