import {action, observable} from "mobx";

class Login {
    @observable
    public visible: boolean = false;

    @observable
    public showClose: boolean = true;


    @action
    showLogin = (callback?: () => void) => {
        this.visible = true;
        callback && callback()
    }

    @action
    hideLogin = (callback?: () => void) => {
        this.visible = false;
        callback && callback()
    }


}

const loginStore = new Login();
export default loginStore
