import Taro, {  } from '@tarojs/taro'
import { View } from '@tarojs/components';
import { deviceInfo } from '../../utils/common';

const Unuse: Taro.FC<{
    width:number,
    height:number
}> = ({width,height}) => {

    return deviceInfo.env=='h5'?<svg width={Taro.pxTransform(width)} height={Taro.pxTransform(height)} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="10.5" fill="#DFDFE0" fill-opacity="0.5" stroke="#DFDFE0"/>
    </svg>:<View style={`background-image: url("data:image/svg+xml,%3Csvg width='${Taro.pxTransform(width)}' height='${Taro.pxTransform(height)}' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='11' cy='11' r='10.5' fill='%23DFDFE0' fill-opacity='.5' stroke='%23DFDFE0'/%3E%3C/svg%3E");width:${Taro.pxTransform(width)};height:${Taro.pxTransform(height)}`}></View>

}
export default Unuse;



