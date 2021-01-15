import Taro, { Component } from '@tarojs/taro'
import {View, Text} from "@tarojs/components";
import { AtActivityIndicator } from 'taro-ui';
import "./listMore.less";

export interface LoadMoreProps {
    status: 'more' | 'loading' | 'noMore';
    // 如否修正刘海屏底部危险区的,默认是已修正
    allowFix?: boolean;
}

export enum LoadMoreEnum {
    more = "more",
    loading = "loading",
    noMore = "noMore"
}

class LoadMore extends Component<LoadMoreProps, any> {

    static defaultProps = {
        status: "more",
        allowFix: true
    }

    getContent() {
        const {status} = this.props;
        switch (status) {
            case "loading": return "加载中...";
            case "more": return "加载更多";
            case "noMore": return "已加载全部"
        }
    }

    render() {
        const {status, allowFix} = this.props;
        return (
            <View className={`load_more_view ${allowFix ? "load_more_view_fix_bottom" : ""}`}>
                {status === "loading" ? <AtActivityIndicator /> : <View/>}
                <Text className="txt">{this.getContent()}</Text>
            </View>
        );
    }
}

export default LoadMore;
