import { observable, action } from 'mobx'
import { api,setUserInfo } from '../utils/net'
export class UserStore {
    @observable
    public id:number = 0;
    @observable
    public mobile:number = 0;
    @observable
    public avatar:string = "";
    @observable
    public nickname:string = "";
    @observable
    public gender:number = 0;
    
    @action
    public setInfo(info){
        console.log(info)
        setUserInfo(info);
        this.id = info.id;
        this.mobile = info.mobile;
        this.avatar = info.avatar;
        this.nickname = info.nickname;
        this.gender = info.gender;
    }

    @action
    public auth(){
        return new Promise<any>(async (resolve, reject)=> {

        })
    }

}


export const userStore = new UserStore();