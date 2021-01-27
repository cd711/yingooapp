import Taro, { useState,useEffect } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './checkbox.less'
import IconFont from '../iconfont';
import Unuse from '../icon/unuse';


const Checkbox: Taro.FC<{
    className?:string;
    disabled?:boolean;
    isChecked:boolean;
    unUse?:boolean;
    onChange?:Function;
    onCheckedClick?:()=>void;
}> = ({className,disabled=false,isChecked,unUse = false,onChange,onCheckedClick}) => {

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
    return  <View className={`xy-checkbox ${className}`} onClick={(e)=>{
                e.stopPropagation();
                onCheckedClick && onCheckedClick();
                if (!disabled) {
                    setChecked(!checked);
                    onChange && onChange(!checked)
                }
            }}>
                {
                    !unUse?<IconFont name={checked?'22_yixuanzhong':'22_touming-weixuanzhong'} size={44} />:<Unuse width={44} height={44}/>
                }
            
        </View>
}
export default Checkbox;
