import { observable, action } from 'mobx'
import { api } from '../utils/net'
export class UserStore {
    @observable
    public id:number = 0;

    @action
    public auth(){
        return new Promise<any>(async (resolve, reject)=> {

        })
    }

}


export const userStore = new UserStore();