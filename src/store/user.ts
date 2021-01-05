import {action, observable} from 'mobx'
import {api, setUserInfo} from '../utils/net'
import {is_weixin} from "../utils/common";

const sexList = {
    0: '保密',
    1: '男',
    2: '女',
    3: '其它',
}

export class UserStore {
    @observable
    public id = null;
    @observable
    public mobile: string = "";
    @observable
    public avatar: string = "";
    @observable
    public nickname: string = "";
    @observable
    public gender: number = 0;
    @observable
    public bio: string = "";
    @observable
    public address: any = null;
    @observable
    public birthday: string = "";
    @observable
    public set_pwd: boolean = false;
    @observable
    public showLoginModal: boolean = false;

    public get sex() {
        const s = sexList[this.gender || 0];
        return s || '保密';
    }

    public get isLogin() {
        return this.id != "" && this.id != null && this.id != 0
    }
    
    @action
    public setInfo(info) {
        if (info.birthday == null || info.birthday == "") {
            info.birthday == ""
        }
        setUserInfo(info);
        console.log("用户信息",info);
        this.id = info.id;
        this.mobile = info.mobile;
        this.avatar = info.avatar;
        this.nickname = info.nickname;
        this.gender = info.gender;
        this.bio = info.bio;
        this.address = info.address;

        this.birthday = info.birthday == null || info.birthday == "" ? "未设置":info.birthday;
        this.set_pwd = info.set_pwd > 0;
    }

    @action
    public getUserInfo() {
        api("user/info").then((info) => {
            setUserInfo(info);
            this.id = info.id;
            this.mobile = info.mobile;
            this.avatar = info.avatar;
            this.nickname = info.nickname;
            this.gender = info.gender;
            this.bio = info.bio;
            this.address = info.address;
            this.birthday = info.birthday == null || info.birthday == "" ? "未设置":info.birthday;
            this.set_pwd = info.set_pwd > 0;
        })
    }

    @action
    public clear() {
        this.id = null;
        this.mobile = "";
        this.avatar = "";
        this.nickname = "";
        this.gender = 0;
        this.bio = "";
        this.address = null;
    }

    @action
    public auth(code: string) {
        return new Promise<any>(async (resolve, reject) => {
            if (is_weixin()) {

            } else {

            }
        })
    }

}


export const userStore = new UserStore();
