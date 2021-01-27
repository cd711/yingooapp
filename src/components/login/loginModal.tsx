import Taro, { Component } from '@tarojs/taro'
import {userStore} from "../../store/user";
import Logins from './login';
import Fragment from '../Fragment';
import { observe } from 'mobx';
import {debuglog} from "../../utils/common";

class LoginModal extends Component<{
    isTabbar?:boolean
},any>{
    constructor(props){
        super(props);
        this.state = {
            show:false
        }
    }
    componentDidMount(){
        observe(userStore,"showLoginModal",(change)=>{
            debuglog("showLoginModal",change)
            if (change.newValue != change.oldValue) {
                this.setState({
                    show:change.newValue
                })
                if (change.newValue) {
                    debuglog("显示了.....____",Taro.getCurrentPages()[0].route)
                }
            }
        });

        const {showLoginModal,isLogin} = userStore;
        if (isLogin && showLoginModal) {
            userStore.showLoginModal = false;
        }
    }

    componentDidHide(){
        const {showLoginModal} = userStore;
        if (showLoginModal) {
            if (this.props.isTabbar) {

                Taro.showTabBar();
            }

            userStore.showLoginModal = false;
        }
    }
    render(){
        const {show} = this.state;
        return <Fragment>
            <Logins isShow={show} isTabBar={this.props.isTabbar || false} onClose={(is)=>{
                if (userStore.showLoginModal != is) {
                    userStore.showLoginModal = is;
                }
            }}/>
        </Fragment>
    }
}

export default LoginModal
