import "./index.less";
import Taro from "@tarojs/taro";
import {ScrollView, Text, View} from "@tarojs/components";
import {ScrollViewProps} from "@tarojs/components/types/ScrollView";
import {AtActivityIndicator} from "taro-ui";
import {debuglog} from "../../utils/common";

interface PullScrollViewProps {
    // 主容器高度
    height: number;
    // 上拉刷新
    onPull?: () => void;
    // 下拉刷新
    onDown?: () => void;
    // 滚动到顶部
    onUpper?: () => void;
    // 滚动到底部
    onLower?: () => void;
    children?: any;
}

interface PullScrollViewState {
    dargStyle: any;
    downDragStyle: any;
    downText: string;
    start_p: any;
    scrollY: boolean;
    dargState: 0 | 1 | -1;
    isTop: boolean
}
class PullScrollView extends Taro.Component<PullScrollViewProps & ScrollViewProps, PullScrollViewState> {

    constructor(props) {
        super(props);
        this.state = {
            dargStyle: {  // 下拉框的样式
                top: 0 + 'px'
            },
            downDragStyle: {   // 下拉图标的样式
                height: 0 + 'px'
            },
            downText: '下拉刷新',
            start_p: {},
            scrollY: true,
            dargState: 0,  // 刷新状态 0不做操作 1刷新 -1加载更多
            isTop: false
        }
    }

    // 还原初始设置
    reduction = () => {
        const time = 0.5;
        this.setState({
            dargState: 0,
            dargStyle: {
                top: 0 + 'px',
                transition: `all ${time}s`
            },
            downDragStyle: {
                height: 0 + 'px',
                transition: `all ${time}s`
            },
            scrollY: true
        })
        setTimeout(() => {
            this.setState({
                dargStyle: {
                    top: 0 + 'px',
                },
                downText: '下拉刷新'
            })
        }, time * 1000);
    }

    touchStart = (e) => {
        this.setState({
            start_p: e.touches[0]
        })
    }

    touchmove = (e) => {
        debuglog(e.touches[0])
        const move_p = e.touches[0],  // 移动时的位置
            deviationX = 0.30,  // 左右偏移量(超过这个偏移量不执行下拉操作)
            deviationY = 70,  // 拉动长度（低于这个值的时候不执行）
            maxY = 100;  // 拉动的最大高度

        const start_x = this.state.start_p.clientX,
            start_y = this.state.start_p.clientY,
            move_x = move_p.clientX,
            move_y = move_p.clientY;


        // 得到偏移数值
        const dev = Math.abs(move_x - start_x) / Math.abs(move_y - start_y);
        if (dev < deviationX) {  // 当偏移数值大于设置的偏移数值时则不执行操作
            let pY = Math.abs(move_y - start_y) / 3.5;  // 拖动倍率（使拖动的时候有粘滞的感觉--试了很多次 这个倍率刚好）
            if (move_y - start_y > 0) {  // 下拉操作
                if (pY >= deviationY) {
                    this.setState({dargState: 1, downText: '释放刷新'})
                } else {
                    this.setState({dargState: 0, downText: '下拉刷新'})
                }
                if (pY >= maxY) {
                    pY = maxY
                }
                this.setState({
                    dargStyle: {
                        top: pY + 'px',
                    },
                    downDragStyle: {
                        height: pY + 'px'
                    },
                    scrollY: false  // 拖动的时候禁用
                })
            }
        }
    }

    _onScroll = e => {
        const {onScroll} = this.props;
        onScroll && onScroll(e);
        const top = e.detail.scrollTop;
        if (top <= 0) {
            this.setState({isTop: true})
        } else {
            this.setState({isTop: false})
        }
    }

    // 上拉
    pull = () => {
        debuglog('上拉')
        const {onPull} = this.props;
        onPull && onPull()
    }

    // 下拉
    down = () => {
        debuglog('下拉')
        const {onDown} = this.props;
        onDown && onDown()
    }

    // 滚动到顶部事件
    _scrollToUpper = () => {
        debuglog("滚动到顶部事件")
        const {onUpper} = this.props;
        onUpper && onUpper()
    }

    // 滚动到底部事件
    _scrollToLower = () => {
        debuglog("滚动到底部事件")
        const {onLower} = this.props;
        onLower && onLower()
    }

    touchEnd = () => {
        if (this.state.dargState === 1) {
            if (!this.state.isTop) {
                return
            }
            this.down()
        } else if (this.state.dargState === -1) {
            this.pull()
        }
        this.reduction()
    }


    render(): React.ReactNode {

        const {children, className, style, height} = this.props;
        const {dargStyle, downDragStyle, downText, scrollY} = this.state;

        return (
            <View className='pull_scroll_view_container' style={{
                height: `${height}px`
            }}>
                <View className='pull_down_drag_view' style={downDragStyle}>
                    <AtActivityIndicator/>
                    <Text className='down_text'>{downText}</Text>
                </View>
                <ScrollView
                    style={Object.assign(dargStyle, style)}
                    onTouchMove={this.touchmove}
                    onTouchEnd={this.touchEnd}
                    onTouchStart={this.touchStart}
                    onScrollToUpper={this._scrollToUpper}
                    onScrollToLower={this._scrollToLower}
                    className={`pull_drag_scroll_view ${className || ""}`}
                    scrollY={scrollY}
                    onScroll={this._onScroll}
                    scrollWithAnimation>
                    {children}
                </ScrollView>
            </View>
        )
    }

}

export default PullScrollView
