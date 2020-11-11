import Taro, { Component } from '@tarojs/taro'
import {View, Text} from "@tarojs/components";
import { AtActivityIndicator } from 'taro-ui';
import "./listMore.less";

export interface LoadMoreProps {
    status: 'more' | 'loading' | 'noMore'
}

export enum LoadMoreEnum {
    more = "more",
    loading = "loading",
    noMore = "noMore"
}

class LoadMore extends Component<LoadMoreProps, any> {

    static defaultProps = {
        status: "more"
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
        const {status} = this.props;
        return (
            <View className="load_more_view">
                {status === "loading" ? <AtActivityIndicator /> : null}
                <Text className="txt">{this.getContent()}</Text>
            </View>
        );
    }
}

export default LoadMore;
