import Taro, { Component } from '@tarojs/taro';
import { View } from '@tarojs/components';
import { AtActivityIndicator } from "taro-ui";
import './editor.less';
import { api } from '../../utils/net';


export const sentMessage: {(proxy: WindowProxy | null | undefined, type: string, data: any): void} = (proxy, type, data) => {
  proxy && proxy.postMessage({from: "parent", type: type, data: data}, "*");

}


export default class Shell extends Component<{}, {
  size?: { width: string | number; height: string | number };
  editorAnim?: boolean;
  data?: number;
  loadingTemplate?: boolean;
}> {

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

  private editorProxy: WindowProxy | null | undefined;

  componentDidMount() {
    
    // @ts-ignore
    this.editorProxy = document.querySelector<HTMLIFrameElement>(".editor_frame").contentWindow;
    
    window.addEventListener("message", this.onMsg);
    
    
    if (!this.tplId && !this.productId) {
      Taro.showToast({
        title: "参数错误！",
        mask: true
      });
      setTimeout(()=>Taro.navigateBack(), 2000);
    }
  }
  componentWillMount() {
    window.removeEventListener("message", this.onMsg);
  }

  onLoad = async ()=> {
    try {
      const phoneList = await api("/editor.phone_shell/smartphones", {
        brand_id: 1202,
        series_id: 1392
      });
      if (phoneList.list && phoneList.list.length > 0) {
        sentMessage(this.editorProxy, "phoneshell", phoneList.list[0].phoneshell);
      }
    } catch (e) {
      console.error(e);
    }
  }

  onMsg: { (e: MessageEvent<any>): void } = ({ data }) => {
    // console.log("msg", data);
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
          this.setEditorSize(data.data);
          break;
      }
    }
  }

  setEditorSize: { (size: { width: number; height: number }): void } = ({ width, height }) => {

    let w = width;
    let h = height;
    w = 750;
    h = 750 / width * h;
  
    if (h > 960) {
      h = 960;
      w = 960 / h * w;
    }

    this.setState({
      editorAnim: true,
      size: {
        width: Taro.pxTransform(w),
        height: Taro.pxTransform(h)
      }
    });
    setTimeout(() => this.setState({
      editorAnim: false
    }), 1000);
  }

  render() {
    const { loadingTemplate, size, editorAnim } = this.state;

    if (!this.tplId && !this.productId) {
      return null;
    }

    return <View>
      <View className={`editor ${editorAnim ? ' anim' : ''}`} style={size ? { height: size.height } : undefined}>
        {/* eslint-disable-next-line react/forbid-elements */}
        <iframe className={`editor_frame ${editorAnim ? 'anim' : ''}`} src={`http://192.168.0.100:8080/mobile?tpl_id=${this.tplId}&amp;id=${this.productId}&t=999}`}></iframe>
        {loadingTemplate ? <View className='loading'><AtActivityIndicator size={64} mode='center' /></View> : null}
      </View>
    </View>
  }
}
