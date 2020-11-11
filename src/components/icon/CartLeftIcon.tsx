import Taro, {  } from '@tarojs/taro'

const CartLeftIcon: React.FC<{
    width:number,
    height:number
}> = ({width,height}) => {

    return  <svg width={Taro.pxTransform(width)} height={Taro.pxTransform(height)} viewBox="0 0 183 44" version="1.1">
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
</svg>
}
export default CartLeftIcon;