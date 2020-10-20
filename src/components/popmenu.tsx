import { CSSProperties } from 'react'
import Taro, { useRef, useState } from '@tarojs/taro'
import { View } from '@tarojs/components';

import './popmenu.less';
import lodash from 'lodash';
// @ts-ignore


// TaroPopoverComponent = forwardRef(TaroPopoverComponent)

interface TaroPopoverComponentProps {
    list: any[],
    onTabItem: any,
    children: any,
    style?: string,
    label: string
}

// props:TaroPopoverComponentProps
export function TaroPopover(props: TaroPopoverComponentProps) {

    const [showMask, setShowMask] = useState(false)
    const [state, setState] = useState({
        // 当前显隐状态
        visible: false,
        // popover 宽
        pw: 160,
        // popover 高
        ph: 160,
        // popover 距左距离
        px: 0,
        // popover 距上距离
        py: 0,
        // 垂直方向 top/bottom
        vertical: '',
        // 水平方向 left/center/right
        align: '',
        // 子元素高度
        itemHeight: 55
    })
    const { list = [], onTabItem, label = 'label' } = props
    
    const refPopover = useRef()
    const handleClick = () => {
        Taro.createSelectorQuery().select('.button_popver').boundingClientRect(
            res => {
                // 调用自定义组件 popover 中的 onDisplay 方法
                setShowMask(true)
                onDisplay(res);
            }
        ).exec()
    }
    const clickMask = (e) => {
        e.stopPropagation()
        onHide()
        setShowMask(false)
    }

    const onClickItem = item => {
        if (onTabItem) onTabItem(item)
    }

    const onDisplay = e => {
        const popover = refPopover
        const { windowHeight, windowWidth } = Taro.getSystemInfoSync()
        const trangleHeight = 12;
        let self = popover.current;
        //@ts-ignore
        if (self.last && lodash.isEqual(e,self.last) && state.visible) {
            setShowMask(false)
            setState({ ...state, visible: false })
        } else {
            Taro.createSelectorQuery().select(".taro-tabbar__panel").scrollOffset((_view: any) => {
                let { pw, ph, px, py, vertical, align } = state;
                const { scrollTop = 0 } = _view || {}
                let pOverW = (pw - e.width) / 2;
                let offsetL = e.left,
                    offsetR = windowWidth - e.right,
                    offsetB = windowHeight - e.bottom;
    
                if (offsetL >= pOverW && offsetR >= pOverW) {
                    align = 'center';
                    px = e.left - pOverW;
                } else if (offsetL > pOverW && offsetR < pOverW) {
                    align = 'left';
                    px = windowWidth - (offsetR + pw);
                    
                    // 如果向右贴边了，设置一点距离
                    if ((windowWidth - pw) == px) px -= 5;
                } else if (offsetL < pOverW && offsetR > pOverW) {
                    align = 'right';
                    px = e.left;
                    // 如果向左贴边了，设置一点距离
                    if (px == 0) px += 5;
                }
    
                if (offsetB >= (ph + trangleHeight)) {
                    vertical = 'bottom';
                    py = scrollTop + e.bottom + trangleHeight;
                } else {
                    vertical = 'top';
                    py = scrollTop + e.top - ph - trangleHeight;
                }

                console.log(scrollTop,e,align,px,py)
                setState({
                    ...state,
                    visible: true,
                    px: px,
                    py: py,
                    ph: getItemsHeight(),
                    vertical: vertical,
                    align: align
                });
                
            }).exec();
        }
        
        // 记录上一次点击的元素
        //@ts-ignore
        self.last = e;
    }
    const onHide = () => {
        setState({ ...state, visible: false })
    }
    // 获取所有子元素的总高度
    const getItemsHeight = () => {
        return state.itemHeight * list.length
    }

    const { windowHeight, windowWidth } = Taro.getSystemInfoSync()
    
    const maskStyle:CSSProperties  = {
        position: 'fixed',
        height: windowHeight+'px',
        width: windowWidth+'px',
        background: 'rgba(0,0,0,0.4)',
        zIndex: 1000
    }
    const { style, children } = props;
    return (
        <View onClick={handleClick}>
            {showMask && <View style={{
            position: 'fixed',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            transition: 'all 200ms ease-in',
            zIndex: 1000
        }}><View className='mask__container' style={maskStyle} onTouchMove={(e)=>{e.stopPropagation()}} onClick={clickMask}></View></View>}
            <View className="button_popver" style={style}>
                {children}
            </View>
            <TaroPopoverComponent ref={refPopover} state={state}>
                {
                    list && list.map(item => {
                        return <View key={item.id} onClick={() => onClickItem(item)}  ><TaroPopoverItemComponent className="popover-item" class='popover-item' height={state.itemHeight}>{item[label]}</TaroPopoverItemComponent></View>
                    })
                }
            </TaroPopoverComponent>
        </View>

    );
}

function TaroPopoverComponent({ref,state,children}) {
    const { visible = false, pw, ph, px, py, vertical, align } = state
    return (
        <View ref={ref}>
            {visible && <View
                className={`popover-view ${vertical} ${align}`}
                style={`width:${pxTo(pw)};height:${pxTo(ph)};left:${pxTo(px)};top:${pxTo(py)};`}>
                {children}
            </View>}
        </View>
    )
}
function TaroPopoverItemComponent(props) {
    const { height = 50, hasline = false } = props

    return (
        <View className={`popover-item ${hasline ? "underline" : ""}`} hoverClass='popover-item-hover' style={`height:${pxTo(height)};line-height:${pxTo(height)}; font-size:${pxTo(16)}`}>
            {props.children}
        </View>
    )
};

function pxTo(px: number) {
    return Taro.pxTransform(px)
}