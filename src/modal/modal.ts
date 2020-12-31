import {notNull} from "../utils/common";

interface FixedTimeProps {
    id: string | number,
    couponId: string | number,
    time: string,
    type: string,
    unit: string,
    expirationTime: number
}
export class LocalCoupon {
    public onlyOnce: Array<string> = new Array<string>();
    public everyTime: Array<string> = new Array<string>();
    public fixedTime: Array<FixedTimeProps> = new Array<FixedTimeProps>();
    constructor(json?: any) {
        console.log(json)
        this.onlyOnce = json && json.onlyOnce || [];
        this.everyTime = json && json.everyTime || [];
        this.fixedTime = json && json.fixedTime || new Array<FixedTimeProps>();
    }
}

interface PhotoParamsPathArray {
    id: string | number;
    url: string;
    attr: string;
    doc: string;
    edited: boolean;
    originalData: Array<{ id: string | number, url: string }>
}
export interface PhotoParamsPath {
    path: Array<PhotoParamsPathArray>;
    sku: string;
    id: number | string;
}
export class PhotoParams {
    /**
     * 如果是从商品详情过来时已经选好了图片, 这个时候没有其它任何数据，只有这个path内容
     */
    public photo: PhotoParamsPath = {path: [], id: "", sku: ""};
    public pictureSize: string = "";
    public attrItems: any[] = [];
    public editPhotos: any[] = [];
    public originalData: any[] = [];
    public index: number;
    public numIdx: number;
    // 照片冲印当前模板的照片数量
    public imageCount: number = 0;
    // 在照片冲印列表需要使用的路由参数
    public changeUrlParams: any = {};
    // 照片冲印列表选择参数
    public photoStyle: string = "";
    // 从照片冲印模板点击过后要存储的模板ID
    public photoTplId: string = "";
    // 照片冲印列表最多允许增加的数量
    public max: number;
    // 照片冲印模板是否有数量限制
    public limit: boolean = false;

    constructor(json?: any) {
        if (!json) {
            return
        }
        this.photo = json.photo || {path: [], id: "", sku: ""};
        this.pictureSize = json.pictureSize;
        this.attrItems = json.attrItems ? [...json.attrItems] : [];
        this.editPhotos = json.editPhotos ? [...json.editPhotos] : [];
        this.originalData = json.originalData ? [...json.originalData] : [];
        this.numIdx = !notNull(json.numIdx) ? json.numIdx : -1;
        this.index = !notNull(json.index) ? json.index : -1;
        this.imageCount = !notNull(json.imageCount) ? parseInt(json.imageCount) : 0;
        this.changeUrlParams = json.changeUrlParams || {};
        this.photoStyle = json.photoStyle || "";
        this.photoTplId = !notNull(json.photoTplId) ? json.photoTplId : "";
        this.max = !notNull(json.max) ? parseInt(json.max) : 100;
        this.limit = json.limit || false;
    }
}
