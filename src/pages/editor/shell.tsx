import Taro, { Component, useEffect, useState } from '@tarojs/taro';
import { Image, ScrollView, Text, View } from '@tarojs/components';
import { AtActivityIndicator } from "taro-ui";
import './editor.less';
import './shell.less';

import { api } from '../../utils/net';
import IconFont from '../../components/iconfont';
import { observable } from 'mobx';
import { observer } from '@tarojs/mobx';
import Fragment from '../../components/</Fragment>';


export const sendMessage: { (proxy: WindowProxy | null | undefined, type: string, data: any): void } = (proxy, type, data) => {
  proxy && proxy.postMessage({ from: "parent", type: type, data: data }, "*");

}



class Store {
  @observable
  tool = 0;

}

interface BrandType {
  id: any;
  name: string;
  models?: BrandType[];
  phoneshell: any;
}

const Template: React.FC<{ parent: Shell; close: ()=> void}> = ({close})=> {
  // http://192.168.0.166/api/app.product_tpl/list
  const [list, setList] = useState([]);
  const [start, setStart] = useState(0);
  const [more, setMore] = useState(true);

  useEffect((async ()=> {
    try {
      const res = await api("app.product_tpl/list", {
        start: start,
        size: 20
      });
      if (!res || !res.list || res.list.length < 1) {
        setMore(false);
        return;
      } else {
        setMore(true);
      }

      setList(list.concat(res.list));

    } catch(e) {
      console.error(e);
    }
  }) as any, [start]);
  const applyTemplate = ()=> {

  }

  return <View className='switch-template'>
      <View className='brand'>
        <ScrollView className='brand cate_list' scrollX>
          <View className='warp'>
            
          </View>
        </ScrollView>
      </View>
      <ScrollView className='list' scrollY>
      </ScrollView>
      <View className='optBar'>
        <View onClick={close} className="icon"><IconFont name='24_guanbi' size={48} /></View>
        <Text className='txt'>模板</Text>
        <View onClick={applyTemplate} className='icon'><IconFont name='24_gouxuan' size={48} /></View>
      </View>
</View>;
};


const ToolBar0: React.FC<{ parent: Shell, model?: BrandType }> = ({ parent, model }) => {
  const [type, setType] = useState(0);
  const [brandList, setBrandList] = useState<BrandType[]>([]);
  const [brandIndex, setBrand] = useState<number>(-1);
  const [series, setSeries] = useState<BrandType[]>([]);

  const [currentModel, setCurrentModel] = useState<BrandType>(model);
    
  const [tempCurrentModel, setTempCurrentModel] = useState<BrandType>(currentModel);



  useEffect((async () => {
    
    switch (type) {
      case 1:
        let list = null;
        try {
          //@ts-ignore
          const res = JSON.parse(localStorage.getItem("phone_brand"));
          if (res && res.time + 15 * 86400000 > Date.now()) {
            list = res.list;
          }
        } catch (e) {
          console.error(e);
        }
        if (!list) {
          try {
            list = await api("/editor.phone_shell/phonebrand");
          } catch (e) {
            console.warn(e);
          }
        }
        if (!list) {
          return;
        }
        localStorage.setItem("phone_brand", JSON.stringify({
          time: Date.now(),
          list: list
        }));
        setBrandList(list);
        if (brandIndex == -1) {
          try {
            const res = JSON.parse(localStorage.getItem("myphone"));
            if (!res) {
              return;
            }
            for (const idx in list) {
              if (list[idx].id == res[0]) {
                setBrand(idx as any);
                break;
              }
            }
          } catch (e) {

          }

        }

    }
  }) as any, [type])

  //系列
  useEffect((async () => {
    if (!brandList || brandList.length == 0) {
      return;
    }
    setSeries(null);
    let list = null;
    try {
      //@ts-ignore
      const res = JSON.parse(localStorage.getItem("phone_series_" + brandList[brandIndex].id));
      if (res && res.time + 3 * 86400000 > Date.now()) {
        list = res.list;
      }
    } catch (e) {

      console.error(e);
    }
    if (!list) {
      try {
        list = await api("/editor.phone_shell/series", {
          id: brandList[brandIndex].id
        });
        console.log(list);
      } catch (e) {
        console.warn(e);
      }
    }
    if (!list) {
      return;
    }
    setSeries(list);
    if (!tempCurrentModel) {
      setTempCurrentModel(list[0].models[0]);
      setCurrentModel(list[0].models[0]);
    }
    localStorage.setItem("phone_series_" + brandList[brandIndex].id, JSON.stringify({
      time: Date.now(),
      list: list
    }));
  }) as any, [brandList, brandIndex]);


  const selectPhone = () => {
    setType(0);
    if (currentModel.id == tempCurrentModel.id) {

      return;
    }
    const mod = tempCurrentModel;
    setCurrentModel(mod);
    if (mod.phoneshell) {
      sendMessage(parent.editorProxy, "phoneshell", { id: mod.id, mask: mod.phoneshell.image });
    }
    localStorage.setItem("myphone", JSON.stringify([brandList[brandIndex].id, mod]));
  };

  const cancelMode = () => {
    setType(0);
    setBrand(0);
    setTempCurrentModel(currentModel);
  }

  return ([type].map((t) => {
    switch (t) {
      case 0:
        return <View className='tools' style='padding: 0 13%'>
          <View className='btn' onClick={() => setType(1)}>
            <IconFont name='24_bianjiqi_jixing' size={48} />
            <Text className='txt'>机型</Text>
          </View>
          <View onClick={() => setType(2)} className='btn'>
            <IconFont name='24_bianjiqi_moban' size={48} />
            <Text className='txt'>模板</Text>
          </View>
        </View>;

      case 1: //机型
        return <Fragment>
          <View className='tools' />
          <View className='mask' />
          <View className='switch-brank'>
            <View className='brand'>
              <ScrollView className='brand cate_list' scrollX>
                <View className='warp'>
                  {
                    brandList.length > 0 ? brandList.map((item: any, idx) => (
                      <View className={idx == brandIndex ? 'item active' : 'item'} key={item.id} onClick={() => setBrand(idx)}>
                        <Text className='text'>{item.name}</Text>
                        {idx == brandIndex ? <Image className='icon' src={require("../../source/switchBottom.png")} /> : null}
                      </View>
                    )) : <AtActivityIndicator size={64} mode='center' />
                  }
                </View>
              </ScrollView>
            </View>
            <ScrollView className='list' scrollY>
              {series ? series.map((ses) => {
                return <View key={`mod-${ses.id}`}>
                  <Text className='head'>{ses.name}系列</Text>
                  <View className='phone'>
                    {ses.models.map((mod) => {
                      return <View onClick={() => setTempCurrentModel(mod)} key={`mod-${mod.id}`} className={tempCurrentModel.id == mod.id ? 'item act' : "item"}>
                        <Text>{mod.name}</Text>
                      </View>
                    })}
                  </View>
                </View>
              }
              ) : <AtActivityIndicator className="phoneLoading" size={64} />}
            </ScrollView>
            <View className='optBar'>
              <View onClick={cancelMode} className="icon"><IconFont name='24_guanbi' size={48} /></View>
              <Text className='txt'>机型</Text>
              <View onClick={selectPhone} className='icon'><IconFont name='24_gouxuan' size={48} /></View>
            </View>
          </View>
        </Fragment>;

        //模板
      case 2:
        return <Template parent={parent} close={()=>setType(0)} />;
    }
  }))[0] as any;
}

@observer
export default class Shell extends Component<{}, {
  size?: { width: string | number; height: string | number };
  editorAnim?: boolean;
  data?: number;
  loadingTemplate?: boolean;
  currentModel?: BrandType;
}> {

  private store = new Store();

  private tplId: string;
  private productId: string;

  constructor(p) {
    super(p);
    // console.log(this.$router.params);
    this.tplId = this.$router.params['tpl_id'] || '20200826';
    this.productId = this.$router.params['id'] || '12';
    this.state = {
      loadingTemplate: true
    };
  }

  public editorProxy: WindowProxy | null | undefined;

  componentDidMount() {

    // @ts-ignore
    this.editorProxy = document.querySelector<HTMLIFrameElement>(".editor_frame").contentWindow;

    window.addEventListener("message", this.onMsg);


    if (!this.tplId && !this.productId) {
      Taro.showToast({
        title: "参数错误！",
        mask: true
      });
      setTimeout(() => Taro.navigateBack(), 2000);
    }
  }
  componentWillMount() {
    window.removeEventListener("message", this.onMsg);
  }

  onLoad = async () => {
    try {
      const res = JSON.parse(localStorage.getItem("myphone"));
      if (res) {
        if (res[1] && res[1].phoneshell) {
          this.setState({currentModel: res[1] as any});
          sendMessage(this.editorProxy, "phoneshell", { id: res[1].id, mask: res[1].phoneshell.image });
        }
      }
    } catch (e) {

    }

  }

  onMsg: { (e: MessageEvent<any>): void } = ({ data }) => {
    console.log("msg", data);
    if (!data) {
      return;
    }
    if (data.from == "editor") {
      switch (data.type) {
        case "onload":
          this.setState({
            loadingTemplate: false
          });
          this.onLoad();
          break;

        case "mainSize":
          // this.setEditorSize(data.data);
          break;

        case "selected":
          this.onSelected(data.data);
          break;
      }
    }
  }

  onSelected = (item?: { id: any, type: "img" | "text" | "container" }) => {
    if (!item) {
      this.store.tool = 0;
      return;
    }
    switch (item.type) {
      case "img":
        this.store.tool = 1;
    }
  }


  back = ()=> {
    if (Taro.getCurrentPages().length > 1) {
      Taro.navigateBack();
    } else {
      if (process.env.TARO_ENV == "h5") {
        window.location.href = "/";
      } else {
        Taro.reLaunch({url: "/pages/index"});
      }
    }
  }
  


  render() {
    const { loadingTemplate, size, currentModel, editorAnim } = this.state;
    const { tool } = this.store;

    if (!this.tplId && !this.productId) {
      return null;
    }

    return <View className='editor-page'>
      <View
        className='header'

      >
        <View onClick={this.back}>
          <IconFont name='24_shangyiye' color='#000' size={48} />
          </View>
        <View className='right'>下一步</View>
      </View>
      <View className="editor" style={size ? { height: size.height } : undefined}>
        {/* eslint-disable-next-line react/forbid-elements */}
        <iframe className="editor_frame" src={`http://192.168.0.100:8080/mobile?tpl_id=${this.tplId}&amp;id=${this.productId}&t=999}`}></iframe>
        {loadingTemplate ? <View className='loading'><AtActivityIndicator size={64} mode='center' /></View> : null}
      </View>

      {([tool].map((s) => {
        switch (s) {
          case 0:
            return <ToolBar0 parent={this} model={currentModel} />;

          case 1:
            return <View key={s} className='tools'>
              <View className='btn'>
                <IconFont name='24_bianjiqi_chongyin' size={48} />
                <Text className='txt'>换图</Text>
              </View>
              <View className='btn'>
                <IconFont name='24_bianjiqi_shuipingfanzhuan' size={48} />
                <Text className='txt'>水平</Text>
              </View>
              <View className='btn'>
                <IconFont name='24_bianjiqi_shuipingfanzhuan' size={48} />
                <Text className='txt'>垂直</Text>
              </View>
              <View className='btn'>
                <View className='icon'>
                  <IconFont name='24_bianjiqi_chongyin' size={48} />
                </View>
                <Text className='txt'>换图</Text>
              </View>
            </View>
        }
      }))[0]}
    </View>
  }
}
