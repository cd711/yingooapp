/* tslint:disable */
/* eslint-disable */

import React, { FunctionComponent } from 'react';
import Taro from '@tarojs/taro';
import Icon from './h5';

interface Props {
  name: 'iconxiayiye1' | 'iconfaxianA' | 'iconfaxianB' | 'iconmobanA' | 'iconmobanB' | 'iconwodeB' | 'iconwodeA' | 'iconcaozuotiyan' | 'iconchuanshuwenti' | 'icongongnengjianyi' | 'iconyemianshantui' | 'iconjiemianshenmei' | 'iconqitajianyi' | 'iconbaocundaoxiangce' | 'iconbianji' | 'icondaifahuo' | 'icondaishouhuo' | 'icondaifukuan' | 'icongengduo' | 'iconfenxiang' | 'iconerweima' | 'icongouwuche' | 'icongengduofenlei' | 'iconjianhao' | 'iconguanbi' | 'iconjiahao' | 'iconqubaocun' | 'iconqubianji' | 'iconshangyiye' | 'iconsaoyisao' | 'iconshezhi' | 'iconshanchu' | 'iconshoucangB' | 'iconshoucangA' | 'iconxiayiye' | 'iconxiangxia' | 'iconxiangshang' | 'iconshouhou' | 'iconyouhuiquan';
  size?: number;
  color?: string | string[];
}

const IconFont: FunctionComponent<Props> = (props) => {
  const { name, size, color } = props;

  return <Icon name={name} size={parseFloat(Taro.pxTransform(size, 750))} color={color} />;
};

IconFont.defaultProps = {
  size: 18,
};

export default IconFont;
