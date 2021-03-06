Component({
  properties: {
    // 52_guan | 52_kai | 22_danxiangjinzhitianjia | 22_danxiangjinzhijianshao | 22_danxiangtianjia | 22_danxiangjianshao | 22_touming-weixuanzhong | 22_yixuanzhong | 24_lianjie | 20_zhongzuo | 20_chexiao | 24_bianjiqi_huantu | 24_bianjiqi_fuzhi | 24_bianjiqi_moban | 24_bianjiqi_chuizhifanzhuan | 24_bianjiqi_jixing | 24_bianjiqi_jinzhi | 24_bianjiqi_chongyin | 24_bianjiqi_juzhongduiqi | 24_bianjiqi_shuipingfanzhuan | 24_bianjiqi_shubiaodian | 24_bianjiqi_yangshi2 | 24_bianjiqi_yangshi1 | 24_bianjiqi_shanchu | 24_bianjiqi_yangshi4 | 24_bianjiqi_yangshi3 | 24_bianjiqi_yifu | 24_bianjiqi_youduiqi | 24_bianjiqi_zuoduiqi | 24_bianjiqi_ziti | 24_bianjiqi_yangshi | 24_gouxuan | 48_dianjibofang | 32_guanbi | 32_shangyiye | 32_weixinzhifu | 32_zhifubaozhifu | 24_baocundaoxiangce | 24_bianji | 24_daifukuan | 24_daifahuo | 24_erweima | 24_gengduo | 24_fenxiang | 24_gouwuche | 24_gengduofenlei | 24_guanbi | 24_jianhao | 24_kefu | 24_mimaxianshi | 24_jiahao | 24_qubaocun | 24_mimayincang | 24_paizhaoshangchuan | 24_qubianji | 24_daishouhuo | 24_shangyiye | 24_saoyisao | 24_shanchu | 24_shezhi | 24_xiayiye | 24_shouhou | 24_shoucangB | 24_xiangceshangchuan | 24_tupianpaixu | 24_xiangshang | 24_xiangxia | 24_shoucangA | 24_youhuiquan | 24_caozuotiyan | 24_gongnengjianyi | 24_qitajianyi | 24_yemianshantui | 24_chuanshuwenti | 24_jiemianshenmei | 24_shouji | 24_weixin-Color | 24_weixin | 24_QQ-Color | 24_QQ | 20_sousuo | 20_zhongfutianjia | 20_fangdayulan | 20_congyunduanxiazai | 20_maikefeng | 20_fuzhi | 20_xiayiye | 20_dingwei | 20_guanbi | 16_shouqi | 16_re | 16_qingkong | 16_zhankai | 16_xiangxiazhankai | 16_shaixuan | 16_xiayiye
    name: {
      type: String,
    },
    // string | string[]
    color: {
      type: null,
      observer: function(color) {
        this.setData({
          colors: this.fixColor(),
          isStr: typeof color === 'string',
        });
      }
    },
    size: {
      type: Number,
      value: 18,
      observer: function(size) {
        this.setData({
          svgSize: size / 750 * wx.getSystemInfoSync().windowWidth,
        });
      },
    },
  },
  data: {
    colors: '',
    svgSize: 18 / 750 * wx.getSystemInfoSync().windowWidth,
    quot: '"',
    isStr: true,
  },
  methods: {
    fixColor: function() {
      var color = this.data.color;
      var hex2rgb = this.hex2rgb;

      if (typeof color === 'string') {
        return color.indexOf('#') === 0 ? hex2rgb(color) : color;
      }

      return color.map(function (item) {
        return item.indexOf('#') === 0 ? hex2rgb(item) : item;
      });
    },
    hex2rgb: function(hex) {
      var rgb = [];

      hex = hex.substr(1);

      if (hex.length === 3) {
        hex = hex.replace(/(.)/g, '$1$1');
      }

      hex.replace(/../g, function(color) {
        rgb.push(parseInt(color, 0x10));
        return color;
      });

      return 'rgb(' + rgb.join(',') + ')';
    }
  }
});
