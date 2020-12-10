import Taro, { Component } from '@tarojs/taro'
import {userStore} from "../../store/user";
import {inject, observer} from '@tarojs/mobx'
import Logins from './login';
import Fragment from '../Fragment';
import { View } from '@tarojs/components';
import { observe } from 'mobx';

class LoginModal extends Component<{},any>{
    constructor(props){
        super(props);
        this.state = {
            show:false
        }
    }
    componentDidMount(){
        const {showLoginModal,isLogin} = userStore;
        if (isLogin && showLoginModal) {
            userStore.showLoginModal = false;
        }
        observe(userStore,"showLoginModal",(change)=>{
            if (change.newValue != change.oldValue) {
                this.setState({
                    show:change.newValue
                })
            }
        })
    }
    componentDidHide(){
        const {showLoginModal} = userStore;
        if (showLoginModal) {
            Taro.showTabBar();
            userStore.showLoginModal = false;
        }
    }
    render(){
        const {show} = this.state;

        return <Fragment>
            <Logins isShow={show} onClose={(is)=>{
                if (userStore.showLoginModal != is) {
                    userStore.showLoginModal = is;
                }
            }}/>
        </Fragment>
    }
}

export default LoginModal