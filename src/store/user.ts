import { observable, action } from 'mobx'
import { setUserInfo,api } from '../utils/net'

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
    public mobile:string = "";
    @observable
    public avatar:string = "";
    @observable
    public nickname:string = "";
    @observable
    public gender:number = 0;
    @observable
    public bio:string = "";
    @observable
    public address:any = null;
    @observable
    public birthday: string = ""

    public get sex() {
        const s = sexList[this.gender||0];
        return s || '保密';
    }
    @action
    public setInfo(info){
        console.log(info)
        setUserInfo(info);
        this.id = info.id;
        this.mobile = info.mobile;
        this.avatar = info.avatar;
        this.nickname = info.nickname;
        this.gender = info.gender;
        this.bio = info.bio;
        this.address = info.address;
        this.birthday = info.birthday;
    }

    @action
    public getUserInfo(){
        api("user/info").then((info)=>{
            setUserInfo(info);
            this.id = info.id;
            this.mobile = info.mobile;
            this.avatar = info.avatar;
            this.nickname = info.nickname;
            this.gender = info.gender;
            this.bio = info.bio;
            this.address = info.address;
            this.birthday = info.birthday;
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
    public auth(){
        return new Promise<any>(async (resolve, reject)=> {

        })
    }

}


export const userStore = new UserStore();
