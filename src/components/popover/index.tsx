import "./index.less";
import Taro, {useEffect, useState} from '@tarojs/taro';
import {View} from "@tarojs/components";

interface PopoverProps {
    popRender: JSX.Element;
}
const Popover: React.FC<PopoverProps> = (props) => {

    const {popRender, children} = props;

    useEffect(() => {
        console.log(children)
    }, [])

    return (
        <View className="popover_container">
            <View className="children_view">
                {children}
            </View>
            <View className="popover_content">
                <View className='triangle' />
                <View className="popover_body">
                    {popRender}
                </View>
            </View>
        </View>
    )
}

export default Popover
