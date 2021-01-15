import Taro, { Component, Config } from '@tarojs/taro'
import { View, CoverView, Image, CoverImage} from '@tarojs/components'
import "./NavBar.less";
// import { sysInfo } from '../net';
import { CSSProperties } from 'react';


const ticons = {
    "success": require("../res/icon/success.png"),
    "error": require("../res/icon/error.png"),
    "info": require("../res/icon/info.png")
}


class NavBar extends Component<{
    float?: boolean;
    config?: Config;
    left?: string | JSX.Element | undefined | null;
    title?: string | JSX.Element | null | undefined;
    right?: JSX.Element | undefined | null;
    className?: string;
    style?: CSSProperties;
    onLeft? :()=>boolean
    pageInfo:{
        appToastOuting?: boolean;
        appToast?: any;
    }
}, any> {
    static EmptyLeft = "____";
    static sysInfo = Taro.getSystemInfoSync();
    static height = (44 + NavBar.sysInfo.statusBarHeight) + "PX";


    static defaultProps = {
        config: {},
        float: false,
        className: ""
    };

    onLeft = () => {
        if (this.props.onLeft) {
            if (this.props.onLeft()) {
                return;
            }
        }
        Taro.navigateBack();
    }
    render() {
        const config = this.props.config || {};
        // debuglog(this.props.left === NavBar.EmptyLeft, this.props.left, NavBar.EmptyLeft)
        const closeLeft = this.props.left === NavBar.EmptyLeft;
        const left = closeLeft ? <View style="width: 44PX" /> : (this.props.left ? this.props.left : <Image src={require("../res/back_icon.png")} onClick={this.onLeft} className="left" />);
        let title = this.props.title;
        title = title ? title : config.navigationBarTitleText ? config.navigationBarTitleText : "";

        const style = config.backgroundColor ? {
            backgroundColor: config.backgroundColor
        } : null;
        const {
            appToastOuting,
            appToast
        } = this.props.pageInfo || {appToastOuting: false, appToast: null};

        let ticon = null;
        if (appToast && appToast.icon) {
            ticon = ticons[appToast.icon];
        }
        return <View>
            {appToast ? <CoverView className="__app-toast">
    <CoverView className={"__view " + (appToastOuting?"__out":"")}>
        {appToast.icon ? <CoverImage className="__image" mode="aspectFit" src={ticon as any} /> : null}
        <CoverView className="__text">{appToast.msg}</CoverView>
    </CoverView>
</CoverView> : null}
            <View>
                <View className={"navbar " + this.props.className} style={{paddingTop: NavBar.sysInfo.statusBarHeight + "PX", ...style, ...this.props.style}}>
                    {left}
                    <View>{title}</View>
                    <View style="width: 44PX" />
                </View>
            </View>
            {this.props.float === false ? <View style={{height: NavBar.height}} /> : null}
        </View>
    }
}

export default NavBar;
