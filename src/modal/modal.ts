import {notNull} from "../utils/common";

export interface PhotoParamsPath {
    path: Array<any>;
    sku: string | number;
    id: number | string;
}
export class PhotoParams {
    public photo: PhotoParamsPath = {path: [], id: "", sku: ""};
    public pictureSize: string = "";
    public attrItems: any[] = [];
    public editPhotos: any[] = [];
    public originalData: any[] = [];
    public index: number;
    public numIdx: number;
    public imageCount: number = 0;
    // 在照片冲印列表需要使用的路由参数
    public changeUrlParams: string;
    // 照片冲印列表选择参数
    public photoStyle: string = "";
    // 从照片冲印模板点击过后要存储的模板ID
    public photoTplId: string = "";
    // 照片冲印列表最多允许增加的数量
    public max: number;

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
        this.changeUrlParams = json.changeUrlParams || "";
        this.photoStyle = json.photoStyle || "";
        this.photoTplId = !notNull(json.photoTplId) ? json.photoTplId : "";
        this.max = !notNull(json.max) ? parseInt(json.max) : 100;
    }
}
