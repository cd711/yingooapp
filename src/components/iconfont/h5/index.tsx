/* tslint:disable */
/* eslint-disable */

import { CSSProperties, DOMAttributes, FunctionComponent } from 'react';
import Icon48Dianjibofang from './Icon48Dianjibofang';
import Icon32Guanbi from './Icon32Guanbi';
import Icon32Shangyiye from './Icon32Shangyiye';
import Icon32Weixinzhifu from './Icon32Weixinzhifu';
import Icon32Zhifubaozhifu from './Icon32Zhifubaozhifu';
import Icon24Baocundaoxiangce from './Icon24Baocundaoxiangce';
import Icon24Bianji from './Icon24Bianji';
import Icon24Daifukuan from './Icon24Daifukuan';
import Icon24Daifahuo from './Icon24Daifahuo';
import Icon24Erweima from './Icon24Erweima';
import Icon24Gengduo from './Icon24Gengduo';
import Icon24Fenxiang from './Icon24Fenxiang';
import Icon24Gouwuche from './Icon24Gouwuche';
import Icon24Gengduofenlei from './Icon24Gengduofenlei';
import Icon24Guanbi from './Icon24Guanbi';
import Icon24Jianhao from './Icon24Jianhao';
import Icon24Kefu from './Icon24Kefu';
import Icon24Mimaxianshi from './Icon24Mimaxianshi';
import Icon24Jiahao from './Icon24Jiahao';
import Icon24Qubaocun from './Icon24Qubaocun';
import Icon24Mimayincang from './Icon24Mimayincang';
import Icon24Paizhaoshangchuan from './Icon24Paizhaoshangchuan';
import Icon24Qubianji from './Icon24Qubianji';
import Icon24Daishouhuo from './Icon24Daishouhuo';
import Icon24Shangyiye from './Icon24Shangyiye';
import Icon24Saoyisao from './Icon24Saoyisao';
import Icon24Shanchu from './Icon24Shanchu';
import Icon24Shezhi from './Icon24Shezhi';
import Icon24Xiayiye from './Icon24Xiayiye';
import Icon24Shouhou from './Icon24Shouhou';
import Icon24ShoucangB from './Icon24ShoucangB';
import Icon24Xiangceshangchuan from './Icon24Xiangceshangchuan';
import Icon24Tupianpaixu from './Icon24Tupianpaixu';
import Icon24Xiangshang from './Icon24Xiangshang';
import Icon24Xiangxia from './Icon24Xiangxia';
import Icon24ShoucangA from './Icon24ShoucangA';
import Icon24Youhuiquan from './Icon24Youhuiquan';
import Icon24Caozuotiyan from './Icon24Caozuotiyan';
import Icon24Gongnengjianyi from './Icon24Gongnengjianyi';
import Icon24Qitajianyi from './Icon24Qitajianyi';
import Icon24Yemianshantui from './Icon24Yemianshantui';
import Icon24Chuanshuwenti from './Icon24Chuanshuwenti';
import Icon24Jiemianshenmei from './Icon24Jiemianshenmei';
import Icon24Shouji from './Icon24Shouji';
import Icon24WeixinColor from './Icon24WeixinColor';
import Icon24Weixin from './Icon24Weixin';
import Icon24QqColor from './Icon24QqColor';
import Icon24Qq from './Icon24Qq';
import Icon20Sousuo from './Icon20Sousuo';
import Icon20Zhongfutianjia from './Icon20Zhongfutianjia';
import Icon20Fangdayulan from './Icon20Fangdayulan';
import Icon20Congyunduanxiazai from './Icon20Congyunduanxiazai';
import Icon20Maikefeng from './Icon20Maikefeng';
import Icon20Fuzhi from './Icon20Fuzhi';
import Icon20Xiayiye from './Icon20Xiayiye';
import Icon20Dingwei from './Icon20Dingwei';
import Icon20Guanbi from './Icon20Guanbi';
import Icon16Shouqi from './Icon16Shouqi';
import Icon16Re from './Icon16Re';
import Icon16Qingkong from './Icon16Qingkong';
import Icon16Zhankai from './Icon16Zhankai';
import Icon16Xiangxiazhankai from './Icon16Xiangxiazhankai';
import Icon16Shaixuan from './Icon16Shaixuan';
import Icon16Xiayiye from './Icon16Xiayiye';

export type IconNames = '48_dianjibofang' | '32_guanbi' | '32_shangyiye' | '32_weixinzhifu' | '32_zhifubaozhifu' | '24_baocundaoxiangce' | '24_bianji' | '24_daifukuan' | '24_daifahuo' | '24_erweima' | '24_gengduo' | '24_fenxiang' | '24_gouwuche' | '24_gengduofenlei' | '24_guanbi' | '24_jianhao' | '24_kefu' | '24_mimaxianshi' | '24_jiahao' | '24_qubaocun' | '24_mimayincang' | '24_paizhaoshangchuan' | '24_qubianji' | '24_daishouhuo' | '24_shangyiye' | '24_saoyisao' | '24_shanchu' | '24_shezhi' | '24_xiayiye' | '24_shouhou' | '24_shoucangB' | '24_xiangceshangchuan' | '24_tupianpaixu' | '24_xiangshang' | '24_xiangxia' | '24_shoucangA' | '24_youhuiquan' | '24_caozuotiyan' | '24_gongnengjianyi' | '24_qitajianyi' | '24_yemianshantui' | '24_chuanshuwenti' | '24_jiemianshenmei' | '24_shouji' | '24_weixin-Color' | '24_weixin' | '24_QQ-Color' | '24_QQ' | '20_sousuo' | '20_zhongfutianjia' | '20_fangdayulan' | '20_congyunduanxiazai' | '20_maikefeng' | '20_fuzhi' | '20_xiayiye' | '20_dingwei' | '20_guanbi' | '16_shouqi' | '16_re' | '16_qingkong' | '16_zhankai' | '16_xiangxiazhankai' | '16_shaixuan' | '16_xiayiye';

interface Props extends DOMAttributes<SVGElement> {
  name: IconNames;
  size?: number;
  color?: string | string[];
  style?: CSSProperties;
  className?: string;
}

const IconFont: FunctionComponent<Props> = ({ name, ...rest }) => {
  switch (name) {
    case '48_dianjibofang':
      return <Icon48Dianjibofang {...rest} />;
    case '32_guanbi':
      return <Icon32Guanbi {...rest} />;
    case '32_shangyiye':
      return <Icon32Shangyiye {...rest} />;
    case '32_weixinzhifu':
      return <Icon32Weixinzhifu {...rest} />;
    case '32_zhifubaozhifu':
      return <Icon32Zhifubaozhifu {...rest} />;
    case '24_baocundaoxiangce':
      return <Icon24Baocundaoxiangce {...rest} />;
    case '24_bianji':
      return <Icon24Bianji {...rest} />;
    case '24_daifukuan':
      return <Icon24Daifukuan {...rest} />;
    case '24_daifahuo':
      return <Icon24Daifahuo {...rest} />;
    case '24_erweima':
      return <Icon24Erweima {...rest} />;
    case '24_gengduo':
      return <Icon24Gengduo {...rest} />;
    case '24_fenxiang':
      return <Icon24Fenxiang {...rest} />;
    case '24_gouwuche':
      return <Icon24Gouwuche {...rest} />;
    case '24_gengduofenlei':
      return <Icon24Gengduofenlei {...rest} />;
    case '24_guanbi':
      return <Icon24Guanbi {...rest} />;
    case '24_jianhao':
      return <Icon24Jianhao {...rest} />;
    case '24_kefu':
      return <Icon24Kefu {...rest} />;
    case '24_mimaxianshi':
      return <Icon24Mimaxianshi {...rest} />;
    case '24_jiahao':
      return <Icon24Jiahao {...rest} />;
    case '24_qubaocun':
      return <Icon24Qubaocun {...rest} />;
    case '24_mimayincang':
      return <Icon24Mimayincang {...rest} />;
    case '24_paizhaoshangchuan':
      return <Icon24Paizhaoshangchuan {...rest} />;
    case '24_qubianji':
      return <Icon24Qubianji {...rest} />;
    case '24_daishouhuo':
      return <Icon24Daishouhuo {...rest} />;
    case '24_shangyiye':
      return <Icon24Shangyiye {...rest} />;
    case '24_saoyisao':
      return <Icon24Saoyisao {...rest} />;
    case '24_shanchu':
      return <Icon24Shanchu {...rest} />;
    case '24_shezhi':
      return <Icon24Shezhi {...rest} />;
    case '24_xiayiye':
      return <Icon24Xiayiye {...rest} />;
    case '24_shouhou':
      return <Icon24Shouhou {...rest} />;
    case '24_shoucangB':
      return <Icon24ShoucangB {...rest} />;
    case '24_xiangceshangchuan':
      return <Icon24Xiangceshangchuan {...rest} />;
    case '24_tupianpaixu':
      return <Icon24Tupianpaixu {...rest} />;
    case '24_xiangshang':
      return <Icon24Xiangshang {...rest} />;
    case '24_xiangxia':
      return <Icon24Xiangxia {...rest} />;
    case '24_shoucangA':
      return <Icon24ShoucangA {...rest} />;
    case '24_youhuiquan':
      return <Icon24Youhuiquan {...rest} />;
    case '24_caozuotiyan':
      return <Icon24Caozuotiyan {...rest} />;
    case '24_gongnengjianyi':
      return <Icon24Gongnengjianyi {...rest} />;
    case '24_qitajianyi':
      return <Icon24Qitajianyi {...rest} />;
    case '24_yemianshantui':
      return <Icon24Yemianshantui {...rest} />;
    case '24_chuanshuwenti':
      return <Icon24Chuanshuwenti {...rest} />;
    case '24_jiemianshenmei':
      return <Icon24Jiemianshenmei {...rest} />;
    case '24_shouji':
      return <Icon24Shouji {...rest} />;
    case '24_weixin-Color':
      return <Icon24WeixinColor {...rest} />;
    case '24_weixin':
      return <Icon24Weixin {...rest} />;
    case '24_QQ-Color':
      return <Icon24QqColor {...rest} />;
    case '24_QQ':
      return <Icon24Qq {...rest} />;
    case '20_sousuo':
      return <Icon20Sousuo {...rest} />;
    case '20_zhongfutianjia':
      return <Icon20Zhongfutianjia {...rest} />;
    case '20_fangdayulan':
      return <Icon20Fangdayulan {...rest} />;
    case '20_congyunduanxiazai':
      return <Icon20Congyunduanxiazai {...rest} />;
    case '20_maikefeng':
      return <Icon20Maikefeng {...rest} />;
    case '20_fuzhi':
      return <Icon20Fuzhi {...rest} />;
    case '20_xiayiye':
      return <Icon20Xiayiye {...rest} />;
    case '20_dingwei':
      return <Icon20Dingwei {...rest} />;
    case '20_guanbi':
      return <Icon20Guanbi {...rest} />;
    case '16_shouqi':
      return <Icon16Shouqi {...rest} />;
    case '16_re':
      return <Icon16Re {...rest} />;
    case '16_qingkong':
      return <Icon16Qingkong {...rest} />;
    case '16_zhankai':
      return <Icon16Zhankai {...rest} />;
    case '16_xiangxiazhankai':
      return <Icon16Xiangxiazhankai {...rest} />;
    case '16_shaixuan':
      return <Icon16Shaixuan {...rest} />;
    case '16_xiayiye':
      return <Icon16Xiayiye {...rest} />;

  }

  return null;
};

export default IconFont;
