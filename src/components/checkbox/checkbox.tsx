
import Taro, { useState,useEffect } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './checkbox.less'
import IconFont from '../iconfont';


const Checkbox: React.FC<{
    className?:string;
    disabled?:boolean;
    isChecked:boolean;
    onChange?:Function
}> = ({className,disabled=false,isChecked,onChange}) => {

    const [checked,setChecked] = useState(isChecked);

    // useEffect(()=>{
    //     if (onChange && checked != isChecked) {
    //         onChange(checked)
    //     }
    // },[checked,onChange])
    //
    useEffect(()=>{
        setChecked(isChecked)
    },[isChecked])

    // 22_yixuanzhong
    return  <View className={`xy-checkbox ${className}`} onClick={()=>{
                if (!disabled) {
                    setChecked(!checked);
                    onChange && onChange(!checked)
                }
            }}>
            <IconFont name={checked?'22_yixuanzhong':'22_touming-weixuanzhong'} size={44} />
        </View>
}
export default Checkbox;
