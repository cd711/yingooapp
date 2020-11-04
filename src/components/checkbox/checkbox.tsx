
import Taro, { useState,useEffect } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './checkbox.less'
import IconFont from '../iconfont';


const Checkbox: React.FC<any> = ({className,isChecked,onChange}) => {
    const [checked,setChecked] = useState(false);
    useEffect(()=>{
        if (onChange) {
            onChange(checked)
        }
        
    },[checked,onChange])
    useEffect(()=>{
        setChecked(isChecked)
    },[isChecked])
    // 22_yixuanzhong
    return  <View className={`xy-checkbox ${className}`} onClick={()=>{
                setChecked(!checked);
            }}>
            <IconFont name={checked?'22_yixuanzhong':'22_touming-weixuanzhong'} size={44} />
        </View>
}
export default Checkbox;