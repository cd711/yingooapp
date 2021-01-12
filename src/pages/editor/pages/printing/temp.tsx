import Taro, {Component} from "@tarojs/taro";
import {Image, ScrollView, Text, View} from "@tarojs/components";
import "./index.less";
import {AtNavBar} from "taro-ui";
import IconFont from "../../../../components/iconfont";
import {deviceInfo, getURLParamsStr, notNull, ossUrl, updateChannelCode, urlEncode} from "../../../../utils/common";
import {api} from "../../../../utils/net";
import Counter from "../../../../components/counter/counter";
import OrderModal from "./orederModal";
import {userStore} from "../../../../store/user";
import moment from "moment";
import {templateStore} from "../../../../store/template";
import Photos from "../../../me/pages/me/photos";
import ENV_TYPE = Taro.ENV_TYPE;


interface PrintChangeState {
    paramsObj: any,
    printAttrItems: any,
    photos: any[],
    visible: boolean,
    goodsInfo: any,
    skus: any[],
    skuInfo: any,
    photoVisible: boolean,
    animating: boolean
}
class PrintChange extends Component<any, PrintChangeState>{

    private router = this.$router;

    constructor(props) {
        super(props);
        this.state = {
            paramsObj: {},
            printAttrItems: {},
            photos: [],
            visible: false,
            goodsInfo: {},
            skus: [],
            photoVisible: false,
            animating: false,
            skuInfo: {}
        }
    }

    getLocalParams = () => {
        // 解析参数
        let params: any = {};

        try {
            const res = Taro.getStorageSync(`${userStore.id}_photo_${moment().date()}`);
            if (res) {
                console.log("----------使用的本地数据-------")
                params = JSON.parse(res)
            } else {
                if (Object.keys(templateStore.photoSizeParams).length > 0) {
                    console.log("----------使用的store数据-------")
                    params = templateStore.photoSizeParams
                } else {
                    Taro.showToast({title: "系统错误，请稍后重试", icon: "none"})
                }
            }
        } catch (e) {
            if (Object.keys(templateStore.photoSizeParams).length > 0) {
                params = templateStore.photoSizeParams
                console.log("----------使用的store数据-------")
            } else {
                Taro.showToast({title: "系统错误，请稍后重试", icon: "none"})
            }
        }

        return params
    }

    countParams = (params) => {
        let paramsObj = this.state.paramsObj;
        paramsObj = params || {};
        params.path = params.path.map((v) => {
            return {
                ...v,
                count: 1,
                hasRotate: this.checkHasRotate(v.attr, params.sku),
            }
        })
        this.setState({
            photos: params.path || [],
            paramsObj
        })
    }

    checkHasRotate(attribute: string, sku: number | string): boolean {
        const {printAttrItems} = this.state;
        if (this.router.params.id) {
            let pix = "";
            for (const item of printAttrItems.attrItems[0]) {
                if (sku == item.id) {
                    pix = item.value;
                    break;
                }
            }
            if (!notNull(pix)) {
                const pixArr = pix.split("*");
                const imgPix = attribute.split("*");
                const num = Number(pixArr[0]) / Number(imgPix[1]);
                return num > 1
            }
        }
        return false
    }

    onCountChange = (num, idx) => {
        const {photos} = this.state;
        const arr = [...photos];
        arr[idx].count = Number(num);
        this.setState({photos: arr})
    }

    onDeleteImg = idx => {
        const {photos} = this.state;
        const arr = [...photos];
        arr.splice(idx, 1);
        this.setState({photos: arr})
    }

    setCount(_, id) {
        const {paramsObj} = this.state;
        const arr = [];
        arr.push(paramsObj.sku);
        arr.push(id);

        console.log("追加的skuID：", arr)
        this.setState({skus: arr})
    }

    onCreateOrder = async () => {
        const {paramsObj, photos, printAttrItems} = this.state;
        let goodsInfo = this.state.goodsInfo;
        Taro.showLoading({title: "请稍后..."});
        try {
            const res = await api("app.product/info", {id: paramsObj.id});
            if (res.attrGroup && res.attrGroup instanceof Array) {
                res.attrGroup = res.attrGroup.map(val => ({...val, disable: !notNull(val.special_show)}))
            }
            goodsInfo = res;
            this.setState({goodsInfo})
            let count = 0;
            for (const item of photos) {
                count += Number(item.count)
            }
            console.log("总数量：", count)
            const idx = printAttrItems.numIdx || 1;
            console.log("数量的下标：", idx)

            const len = printAttrItems.attrItems[idx].length
            for (let i = 0; i < len; i++) {
                const item = printAttrItems.attrItems[idx][i];
                if (parseInt(item.value) > count) {
                    let c = i - 1;
                    if (c <= 0) {
                        c = 0
                    }
                    this.setCount(res, printAttrItems.attrItems[idx][c].id)
                    break;
                } else {
                    if (i === len - 1) {
                        this.setCount(res, printAttrItems.attrItems[idx][len - 1].id)
                        break;
                    }
                }
            }


            setTimeout(() => {
                this.setState({visible: true})
            }, 10)
        } catch (e) {
            console.log("获取商品详情出错：", e)
        }
        Taro.hideLoading()
    }

    orderSkuChange = data => {
        console.log("sku信息：", data)
        this.setState({skuInfo: data})
    }

    onSubmitOrder = () => {
        const {photos, skuInfo} = this.state;
        let count = 0;
        for (const item of photos) {
            count += parseInt(item.count)
        }
        if (notNull(skuInfo.id) || skuInfo.id == 0) {
            Taro.showToast({title: "请选择规格", icon: "none"})
            return
        }
        const data = {
            skuid: skuInfo.id,
            total: count,
            page: "photo",
            parintImges: photos.map(v => ({url: v.url, num: v.count}))
        }
        const paramsStr = getURLParamsStr(urlEncode(data));

        // 如果地址栏参数长度大于200，就使用本地存储加store存储
        if (paramsStr.length > 200) {
            try {
                Taro.setStorageSync(`${userStore.id}_${skuInfo.id}_${count}_${moment().date()}`, JSON.stringify(data));
                templateStore.photoParams = data;
            } catch (e) {
                console.log("本地存储失败：", e)
                templateStore.photoParams = data;
            }
            Taro.navigateTo({
                url: updateChannelCode(`/pages/order/pages/template/confirm?skuid=${skuInfo.id}&total=${count}&page=photo&succ=0`)
            })
        } else {
            Taro.navigateTo({
                url: updateChannelCode(`/pages/order/pages/template/confirm?${paramsStr}&succ=1`)
            })
        }
    }

    onPhotoSelect = (data: {ids: [], imgs: [], attrs: []}) => {
        const arr: any = this.state.photos;
        for (let i = 0; i < data.ids.length; i++) {
            arr.push({
                id: data.ids[i],
                url: data.imgs[i],
                attr: data.attrs[i],
                count: 1
            });
        }
        this.setState({photos: arr})
        this.setState({photoVisible: false})
    }

    selectPhoto = () => {
        this.setState({photoVisible: true});
        setTimeout(() => {
            this.setState({animating: true});
        }, 50)
    }

    closeSelectPhoto = () => {
        this.setState({animating: false});
        setTimeout(() => {
            this.setState({photoVisible: false})
        }, 500)
    }

    onEditClick = (item ,index) => {
        Taro.navigateTo({
            url: updateChannelCode(`/pages/editor/pages/printedit?idx=${index}&status=${item.edited && !notNull(item.doc) ? "t" : "f"}&img=${item.url}`)
        })
    }

    backPressHandle = () => {
        if (Taro.getEnv() === ENV_TYPE.WEB) {
            if (this.state.photoVisible) {
                this.setState({photoVisible: false})
            }
        }
    }

    componentDidMount() {
        window.addEventListener("popstate", this.backPressHandle);

        // 读取本地存储print_attrItems
        try {
            const res = Taro.getStorageSync("print_attrItems");
            console.log("本地的：", res)
            if (res) {
                const parse = JSON.parse(res);
                console.log("本地的items：", parse)
                this.setState({printAttrItems: parse})
            }
        } catch (e) {
            console.log("读取print_attrItems出错：", e)
        }

        setTimeout(() => {
            const params = this.getLocalParams();

            console.log("读取的photo params：", params)

            this.countParams(params)
        }, 100)
    }

    componentDidShow() {

        // console.log("读取的photo params：", params)
        //
        // this.countParams(params)
    }

    componentWillUnmount() {
        window.removeEventListener("popstate", this.backPressHandle)
    }



    render(): React.ReactNode {
        const {photos, visible, goodsInfo, skus, photoVisible, animating, } = this.state;
        return (
            <View className="printing_container">
                <AtNavBar onClickLeftIcon={() => Taro.navigateBack()}
                          color='#121314' title="照片冲印列表" border fixed
                          leftIconType={{value: 'chevron-left', color: '#121314', size: 24}}
                />
                <ScrollView scrollY className="printing_scroll_container" style={{height: deviceInfo.windowHeight - 110}}>
                    <View className="printing_change_main">
                        {
                            photos.map((value, index) => (
                                <View className="print_change_item_wrap" key={index}
                                      style={{
                                          width: deviceInfo.windowWidth / 2
                                      }}>
                                    <View className="print_change_item"
                                          style={{
                                              width: deviceInfo.windowWidth / 2 - 26
                                          }}
                                    >
                                        <View className="print_change_del" onClick={() => this.onDeleteImg(index)}>
                                            <IconFont name="32_guanbi" size={32}/>
                                        </View>
                                        <View className="print_change_img">
                                            <Image src={ossUrl(value.url, 1)} className="p_img" mode={value.hasRotate ? "aspectFill" : "aspectFill"}
                                                   onClick={() => this.onEditClick(value, index)}
                                                   style={{
                                                       transform: value.hasRotate ? "rotateZ(90deg)" : "none",
                                                       width: value.hasRotate ? 203 : 152,
                                                       height: value.hasRotate ? 152 : 203
                                                   }}
                                            />
                                        </View>
                                        <View className="print_change_count">
                                            <Counter max={100} num={value.count}
                                                     onCounterChange={c => this.onCountChange(c, index)}/>
                                        </View>
                                    </View>
                                </View>
                            ))
                        }
                    </View>
                </ScrollView>
                <View className="print_foot" style={{justifyContent: "space-around"}}>
                    <View className="btn default" onClick={this.selectPhoto}>
                        <Text className="txt">添加图片</Text>
                    </View>
                    <View className="btn" onClick={this.onCreateOrder}>
                        <Text className="txt">立即下单</Text>
                    </View>
                </View>
                {
                    visible
                        ? <OrderModal data={goodsInfo}
                                      isShow={visible}
                                      defaultActive={skus}
                                      onClose={() => this.setState({visible: false})}
                                      onSkuChange={this.orderSkuChange}
                                      onNowBuy={this.onSubmitOrder}
                        />
                        : null
                }
                {
                    photoVisible
                        ? <View className={`photo_picker_container ${animating ? "photo_picker_animate" : ""}`}>
                            <Photos editSelect
                                    onClose={this.closeSelectPhoto}
                                // defaultSelect={photos.map(v => ({id: v.id, img: v.url}))}
                                    onPhotoSelect={this.onPhotoSelect}
                            />
                        </View>
                        : null
                }
            </View>
        )
    }


}


export default PrintChange
