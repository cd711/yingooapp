import Taro, {  } from '@tarojs/taro'
import { View } from '@tarojs/components';
import { deviceInfo } from '../../utils/common';

const CartLeftIcon: Taro.FC<{
    width:number,
    height:number
}> = ({width,height}) => {

    return deviceInfo.env=='h5'?<svg width={Taro.pxTransform(width)} height={Taro.pxTransform(height)} viewBox="0 0 183 44" version="1.1">
    <defs>
        <linearGradient x1="100%" y1="50%" x2="0%" y2="50%" id="linearGradient-1">
            <stop stop-color="#FFF1E4" offset="0%"></stop>
            <stop stop-color="#FFDFC4" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g id="3-我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="3-2-1购物车A" transform="translate(-76.000000, -726.000000)" fill="url(#linearGradient-1)">
            <path d="M98,726 L259,726 L259,726 L244,770 L98,770 C85.8497355,770 76,760.150264 76,748 C76,735.849736 85.8497355,726 98,726 Z" id="合计底板"></path>
        </g>
    </g>
</svg>:<View style={`background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${Taro.pxTransform(width)}' height='${Taro.pxTransform(height)}' viewBox='0 0 183 44' version='1.1'%3E %3Cdefs%3E %3ClinearGradient x1='100%25' y1='50%25' x2='0%25' y2='50%25' id='linearGradient-1'%3E %3Cstop stop-color='%23FFF1E4' offset='0%25'%3E%3C/stop%3E %3Cstop stop-color='%23FFDFC4' offset='100%25'%3E%3C/stop%3E %3C/linearGradient%3E %3C/defs%3E %3Cg id='3-我的' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E %3Cg id='3-2-1购物车A' transform='translate(-76.000000, -726.000000)' fill='url(%23linearGradient-1)'%3E %3Cpath d='M98,726 L259,726 L259,726 L244,770 L98,770 C85.8497355,770 76,760.150264 76,748 C76,735.849736 85.8497355,726 98,726 Z' id='合计底板'%3E%3C/path%3E %3C/g%3E %3C/g%3E %3C/svg%3E");width:${Taro.pxTransform(width)};height:${Taro.pxTransform(height)}`}></View>

}
export default CartLeftIcon;
