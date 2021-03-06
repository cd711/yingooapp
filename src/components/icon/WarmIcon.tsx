import { View } from '@tarojs/components';
import Taro, {  } from '@tarojs/taro'
import { deviceInfo } from '../../utils/common';

const WarmIcon: Taro.FC<{
    width:number,
    height:number
}> = ({width,height}) => {
    return  deviceInfo.env=='h5'?<svg width={Taro.pxTransform(width)} height={Taro.pxTransform(height)} viewBox="0 0 16 16" version="1.1">
        <title>控件/红点/警告</title>
        <g id="2-模版" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="2-7-10支付成功" transform="translate(-16.000000, -529.000000)" fill="#D7D7DA">
                <g id="元素/警示" transform="translate(16.000000, 529.000000)">
                    <path d="M7.99989311,0 C12.4181275,0 15.9999786,3.58164471 16,7.99995724 C16,12.4182912 12.4181275,16 7.99989311,16 C3.58180841,16 -5.58580959e-16,12.4182698 -5.58580959e-16,7.99995724 C-5.58580959e-16,3.58164471 3.58180843,0 7.99989311,0 Z M7.86679959,10.4086164 C7.373787,10.4086164 6.98171167,10.8117914 6.98171167,11.3157121 C6.98171167,11.808579 7.35118781,12.2341823 7.86679959,12.2341823 C8.35929905,12.2341823 8.7628557,11.830879 8.7628557,11.3157121 C8.7628557,10.8118128 8.35929905,10.4086164 7.86679959,10.4086164 Z M8.62841521,3.52047469 L7.14950571,3.52047469 L7.37376562,9.46786755 L8.40434773,9.46786755 L8.62841521,3.52047469 Z" id="Shape"></path>
                </g>
            </g>
        </g>
    </svg>:<View style={`background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${Taro.pxTransform(width)}' height='${Taro.pxTransform(height)}' viewBox='0 0 16 16' version='1.1'%3E %3Ctitle%3E控件/红点/警告%3C/title%3E %3Cg id='2-模版' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E %3Cg id='2-7-10支付成功' transform='translate(-16.000000, -529.000000)' fill='%23D7D7DA'%3E %3Cg id='元素/警示' transform='translate(16.000000, 529.000000)'%3E %3Cpath d='M7.99989311,0 C12.4181275,0 15.9999786,3.58164471 16,7.99995724 C16,12.4182912 12.4181275,16 7.99989311,16 C3.58180841,16 -5.58580959e-16,12.4182698 -5.58580959e-16,7.99995724 C-5.58580959e-16,3.58164471 3.58180843,0 7.99989311,0 Z M7.86679959,10.4086164 C7.373787,10.4086164 6.98171167,10.8117914 6.98171167,11.3157121 C6.98171167,11.808579 7.35118781,12.2341823 7.86679959,12.2341823 C8.35929905,12.2341823 8.7628557,11.830879 8.7628557,11.3157121 C8.7628557,10.8118128 8.35929905,10.4086164 7.86679959,10.4086164 Z M8.62841521,3.52047469 L7.14950571,3.52047469 L7.37376562,9.46786755 L8.40434773,9.46786755 L8.62841521,3.52047469 Z' id='Shape'%3E%3C/path%3E %3C/g%3E %3C/g%3E %3C/g%3E %3C/svg%3E");width:${Taro.pxTransform(width)};height:${Taro.pxTransform(height)};background-repeat:no-repeat;`}></View>
}
export default WarmIcon;
