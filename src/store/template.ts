import {observable} from 'mobx'

interface ImageSize {
    height: number;
    width: number;
}

interface TemplateItem {
    id: number;
    name: string;
    price: string;
    cost_price: string;
    create_time: number;
    fabulous: number;
    favorite: number;
    thumb_image: string;
    update_time: number;
    weigh: number;
    status: number;
    attr: ImageSize
}

export class TemplateStore {
    @observable
    public selectItem: TemplateItem | any = {};
    @observable
    public address: any = null;

    @observable
    public photoParams: object = {};

    @observable
    public photoSizeParams: object = {};

    @observable
    public editorPhotos: { id: string | number, url: string }[] = [];

    @observable
    public printStatus: boolean = false;

    @observable
    public printWxPhotoData: {ids: [], imgs: [], attrs: []} = {ids: [], imgs: [], attrs: []};

    @observable
    public printKey: string = "";
}


export const templateStore = new TemplateStore();
