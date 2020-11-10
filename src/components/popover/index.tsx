import "./index.less";
import Taro, {useEffect, useState} from '@tarojs/taro';
import {View, Text} from "@tarojs/components";
import BoundingClientRectCallbackResult = Taro.NodesRef.BoundingClientRectCallbackResult;


// 此组件未兼容react-native

interface PopoverItemProps {
    title: string | null,
    value?: string | number,
    customRender?: JSX.Element,
    onClick?: (data: { title: string | number, value?: string | number}) => void
}
interface PopoverProps {
    popoverItem: Array<PopoverItemProps>;
    className?: string;
    offsetBottom?: number;  // 如果偶尔存在底部还差一点没有显示就使用此字段增加偏移量
    onChange?: (isOpened: boolean) => void;
}
const Popover: React.FC<PopoverProps> = (props) => {

    const {popoverItem = [], className, offsetBottom = 0, children, onChange} = props;
    const _childRef = Taro.createRef();
    const _bodyRef = Taro.createRef();
    const [offset, setOffset] = useState({});
    const [visible, setVisible] = useState(false);
    const [roundom, setRoundom] = useState(0);
    const [onlyBottom, setOnluBottom] = useState(false);

    useEffect(() => {
        const m = Math.ceil(Math.random() * 1000000);
        setRoundom(m)
    }, [])

    async function getPopoverBodyRect(): Promise<BoundingClientRectCallbackResult> {
        return new Promise<BoundingClientRectCallbackResult>((resolve, _) => {
            Taro.createSelectorQuery().select(`#popoverBody${roundom}`).boundingClientRect(rect => {
                resolve({...rect})
            }).exec()
        })
    }

    async function getPopoverContentRect(): Promise<BoundingClientRectCallbackResult> {
        return new Promise<BoundingClientRectCallbackResult>((resolve, _) => {
            Taro.createSelectorQuery().select(`#childrenView${roundom}`).boundingClientRect(rect => {
                resolve({...rect})
            }).exec()
        })
    }

    useEffect(() => {
        onChange && onChange(visible)
    }, [visible])

    function changeOverflow(show: boolean) {
        if (Taro.getEnv() === Taro.ENV_TYPE.WEB) {
            const scr = window.document.getElementsByClassName("taro-tabbar__panel");
            if (scr[0]) {
                // @ts-ignore
                scr[0].style.overflow = show ? "hidden" : "auto"
            }
        }
    }

    const _onChange = async () => {
        try {
            const win = Taro.getSystemInfoSync();
            const {top, left, right, height} = await getPopoverContentRect();
            const {
                width: cWidth,
                height: cHeight
            } = await getPopoverBodyRect();

            const screenW = win.windowWidth;
            const screenH = win.windowHeight;
            const halfW = screenW / 2;

            let temp: any = {top: 0};

            // 点击元素的位于屏幕的左边还是右边
            if (left > halfW) { // 右边
                let _right = right - left
                if (_right < (screenW - left)) {
                    _right = 15
                }
                temp = {...temp, right: _right}
            } else {  // 左边
                const _left = left - cWidth;
                temp = {...temp, left: _left}
            }

            // 距离顶部的偏移量
            temp = {...temp, top: top + height + 10};

            console.log("最终渲染位置：", temp)

            // 点击元素与屏幕底部是否不足以完全显示容器
            const newBottom = temp.top + cHeight + offsetBottom;  // 点击元素新的底部坐标

            if (newBottom > screenH) {
                temp = {...temp, top: top - cHeight - 30};
                setOnluBottom(true)
            } else {
                setOnluBottom(false)
            }

            setOffset({...temp})
            setVisible(!visible);

            changeOverflow(!visible)

        }catch (e) {
            console.log("获取坐标出错：", e)
        }
    }

    const _onClose = () => {
        setVisible(false);
        setOnluBottom(false);
        setOffset({});
        changeOverflow(false)
    }

    const onItemClick = (item: PopoverItemProps) => {
        item.onClick && item.onClick({title: item.title, value: item.value})
        _onClose();
    }

    return (
        <View className={`popover_container ${className}`}>
            {visible ? <View className="popover_mask" onClick={_onClose} /> : null}
            <View className="children_view" ref={_childRef} onClick={_onChange} id={`childrenView${roundom}`}>
                {children}
            </View>
            <View className="popover_content"
                  style={visible ? {...offset} : {top: -100000, left: -100000}}
                  ref={_bodyRef}
            >
                <View className='triangle'
                      style={onlyBottom
                          ? {top: "94%", transform: "rotate(222deg)"}
                          : {top: -5, transform: "rotate(45deg)"}
                      }
                />
                <View className="popover_body" id={`popoverBody${roundom}`}>
                    {
                        popoverItem.map((value, index) => (
                            <View className="popover_body_item" key={index} onClick={() => onItemClick(value)}>
                                {
                                    value.customRender ? value.customRender : <Text className="txt">{value.title}</Text>
                                }
                            </View>
                        ))
                    }
                </View>
            </View>
        </View>
    )
}

export default Popover
