import Taro, { Component, useEffect, useState } from '@tarojs/taro';
import { Image, ScrollView, Text, View } from '@tarojs/components';
import { AtActivityIndicator } from "taro-ui";
import './editor.less';
import './shell.less';

import { api } from '../../utils/net';
import IconFont from '../../components/iconfont';
import { observable } from 'mobx';
import { observer } from '@tarojs/mobx';
import Fragment from '../../components/Fragment';

let editorProxy: WindowProxy | null | undefined;

export const sendMessage: { (type: string, data: any): void } = (type, data) => {
  editorProxy && editorProxy.postMessage({ from: "parent", type: type, data: data }, "*");
}

let rpcId = 0;
const rpcList = {}

function callEditor(name, ...args) {
  return new Promise((resolve, reject) => {
    rpcId ++;
    const id = rpcId;
    rpcList[id] = [resolve, reject];
    sendMessage("_req", {
      id: rpcId,
      fun: name,
      args: args
    });
  });
}






const defaultModel = {
  id: 1586,
  name: "华为 V30 Pro",
  phoneshell: {
    id: 37,
    image: "http://palybox-app.oss-cn-chengdu.aliyuncs.com/uploads/phoneshell/20200911/0e768b37d0f96869abfcca08303dce70.png"
  }
};

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


const ToolBar0: React.FC<{ parent: Shell, brand: number, model?: BrandType }> = ({ parent, model, brand }) => {
  const [type, setType] = useState(0);
  const [brandList, setBrandList] = useState<BrandType[]>([]);
  const [brandIndex, setBrand] = useState<number>(brand);
  const [series, setSeries] = useState<BrandType[]>([]);

  const [currentModel, setCurrentModel] = useState<BrandType>(model);
    
  const [tempCurrentModel, setTempCurrentModel] = useState<BrandType>(currentModel);



  useEffect((async () => {
    
    switch (type) {
      case 1:
        let list = null;
        try {
          //@ts-ignore
          const res = Taro.getStorageSync("phone_brand");
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
        setBrandList(list);
        if (brandIndex == -1) {
          setBrand(0);
        }
        if (model && model.phoneshell) {
          sendMessage("phoneshell", { id: model.id, mask: model.phoneshell.image });
        }
      
        Taro.setStorage({key: "phone_brand", data: {
          time: Date.now(),
          list: list
        }});
        

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
      const res = Taro.getStorageSync("phone_series_" + brandList[brandIndex].id);
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
    Taro.setStorage({key: "phone_series_" + brandList[brandIndex].id, data: {
      time: Date.now(),
      list: list
    }});
  }) as any, [brandList, brandIndex]);


  const selectPhone = () => {
    setType(0);
    if (currentModel.id == tempCurrentModel.id) {

      return;
    }
    const mod = tempCurrentModel;
    setCurrentModel(mod);
    if (mod.phoneshell) {
      sendMessage("phoneshell", { id: mod.id, mask: mod.phoneshell.image });
    }
    Taro.setStorage({key: "myphone", data: [brandList[brandIndex].id, mod]});
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
  currentBrand?: number;
  data?: number;
  loadingTemplate?: boolean;
  currentModel?: BrandType;
}> {

  private store = new Store();

  private tplId: any;
  // private productId: string;

  constructor(p) {
    super(p);
    // console.log(this.$router.params);
    this.tplId = this.$router.params['tpl_id'] || 0;
    // this.productId = this.$router.params['id'];
    this.state = {
      currentBrand: -1,
      loadingTemplate: true
    };
  }

  public editorProxy: WindowProxy | null | undefined;

  async componentDidMount() {

    // @ts-ignore
    this.editorProxy = document.querySelector<HTMLIFrameElement>(".editor_frame").contentWindow;
    editorProxy = this.editorProxy;
    window.addEventListener("message", this.onMsg);
    if (!this.tplId) {
      try {
        console.log("ccccccc", await callEditor("loadDraft"));
      } catch(e) {
        alert(e);
      }
    }

    // if (!this.tplId) {
    //   Taro.showToast({
    //     title: "参数错误！",
    //     mask: true
    //   });
    //   setTimeout(() => Taro.navigateBack(), 2000);
    // }
  }
  componentWillUnmount() {
    callEditor("saveDraft");
    alert(1);
  }
  componentWillMount() {
    window.removeEventListener("message", this.onMsg);
  }

  onLoad = async (type?: number) => {
    try {
      const res = Taro.getStorageSync("myphone") || defaultModel;
      if (res && res.length == 2) {
        this.setState({
          currentBrand: res[0]
        });
        
      }
      !type && await callEditor("saveDraft");
    } catch (e) {

    }

  }

  _res = (data) =>{
    const {id, res, err} = data.data;
    if (rpcList[id]) {
      const rpc = rpcList[id];
      delete rpcList[id];

      if (err) {
        rpc[1](err);
      } else {
        rpc[0](res);
      }
    }
  }

  onMsg: { (e: MessageEvent<any>): void } = async ({ data }) => {
    console.log("msg", data);
    if (!data) {
      return;
    }
    if (data.from == "editor") {
      switch (data.type) {
        case "_req": 
          const {id, fun, args} = data.data;
          
          if (this[`rpc_${fun}`]) {
            try {
              const res = await this[`rpc_${fun}`](...args)
              sendMessage("_res", {
                id,
                res
              });
            } catch(err) {
              sendMessage("_res", {
                id,
                err
              });
            }
          } else {
              sendMessage("_res", {
                id,
                err: "func not found"
              });
          }
          return;
        
          case "_res":
            this._res(data);
            return;

        case "onLoadEmpty":
          this.setState({
            loadingTemplate: false
          });
          callEditor("loadDraft")
          break;

        case "onload":
          this.setState({
            loadingTemplate: false
          });
          this.onLoad(data.data);
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
    const { loadingTemplate, size, currentModel, currentBrand } = this.state;
    const { tool } = this.store;

   

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
        <iframe className="editor_frame" src={`http://192.168.0.100:8080/mobile?tpl_id=${this.tplId}&t=999}`}></iframe>
        {loadingTemplate ? <View className='loading'><AtActivityIndicator size={64} mode='center' /></View> : null}
      </View>

      {([tool].map((s) => {
        switch (s) {
          case 0:
            return <ToolBar0 parent={this} brand={currentBrand} model={currentModel} />;

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
