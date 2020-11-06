import { observable, action } from 'mobx'
import { setUserInfo } from '../utils/net'

const sexList = {
    0: '保密',
    1: '男',
    2: '女',
    3: '其它',
}
export class UserStore {
    @observable
    public id = 0;
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

    public get sex() {
        let s = sexList[this.gender||0];
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
    }

    @action
    public auth(){
        return new Promise<any>(async (resolve, reject)=> {

        })
    }

}


export const userStore = new UserStore();
