import Taro, {  } from '@tarojs/taro'
import Fragment from '../Fragment';

const CartRightIcon: React.FC<{
    width:number,
    height:number,
    linght:boolean
}> = ({width,height,linght}) => {

    return <Fragment>
        {
            linght?<svg width={Taro.pxTransform(width)} height={Taro.pxTransform(height)} viewBox="0 0 110 44" version="1.1">
                <g id="3-我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g id="3-2-1购物车B" transform="translate(-249.000000, -726.000000)" fill="#FF4966">
                        <path d="M271,726 L344,726 L344,726 L359,770 L271,770 C258.849736,770 249,760.150264 249,748 C249,735.849736 258.849736,726 271,726 Z" id="结算底板" transform="translate(304.000000, 748.000000) scale(-1, 1) translate(-304.000000, -748.000000) "></path>
                    </g>
                </g>
            </svg>:<svg width={Taro.pxTransform(width)} height={Taro.pxTransform(height)} viewBox="0 0 110 44" version="1.1">
                    <defs>
                        <path d="M271,726 L344,726 L344,726 L359,770 L271,770 C258.849736,770 249,760.150264 249,748 C249,735.849736 258.849736,726 271,726 Z" id="path-1"></path>
                    </defs>
                    <g id="3-我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                        <g id="3-2-1购物车A" transform="translate(-249.000000, -726.000000)">
                            <g id="结算底板" transform="translate(304.000000, 748.000000) scale(-1, 1) translate(-304.000000, -748.000000) ">
                                <use fill="#FF4966" xlinkHref="#path-1"></use>
                                <use fill-opacity="0.4" fill="#FFFFFF" xlinkHref="#path-1"></use>
                            </g>
                        </g>
                    </g>
            </svg>
        }
        
         </Fragment>
}
export default CartRightIcon;