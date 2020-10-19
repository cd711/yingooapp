/* tslint:disable */
/* eslint-disable */

import Taro, { FunctionComponent } from '@tarojs/taro';
import Icon from './h5';

interface Props {
  name: 'xiayiye1' | 'faxianA' | 'faxianB' | 'mobanA' | 'mobanB' | 'wodeB' | 'wodeA' | 'caozuotiyan' | 'chuanshuwenti' | 'gongnengjianyi' | 'yemianshantui' | 'jiemianshenmei' | 'qitajianyi' | 'baocundaoxiangce' | 'bianji' | 'daifahuo' | 'daishouhuo' | 'daifukuan' | 'gengduo' | 'fenxiang' | 'erweima' | 'gouwuche' | 'gengduofenlei' | 'jianhao' | 'guanbi' | 'jiahao' | 'qubaocun' | 'qubianji' | 'shangyiye' | 'saoyisao' | 'shezhi' | 'shanchu' | 'shoucangB' | 'shoucangA' | 'xiayiye' | 'xiangxia' | 'xiangshang' | 'shouhou' | 'youhuiquan';
  size?: number;
  color?: string | string[];
}

const IconFont: FunctionComponent<Props> = (props) => {
  const { name, size, color } = props;

  return <Icon name={name} size={parseFloat(Taro.pxTransform(size))} color={color} />;
};

IconFont.defaultProps = {
  size: 18,
};

export default IconFont;
