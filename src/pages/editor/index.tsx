import Taro, { Component } from '@tarojs/taro';
import { View } from '@tarojs/components';
import { AtActivityIndicator } from "taro-ui";
import './index.less';


export default class Index extends Component<{}, {
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

  componentDidMount() {
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
          break;

        case "mainSize":
          setTimeout(() => this.setEditorSize(data.data), 3000);
          break;
      }
    }
  }

  setEditorSize: { (size: { width: number; height: number }): void } = ({ width, height }) => {
    let w = width;
    let h = height;
    if (w > 540) {
      w = 540;
      h = 620 / width * h;
    }
    if (h > 960) {
      h = 960;
      w = 960 / h * w;
    }

    // document.body.querySelector(".editor").addEventListener("")
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
        <iframe className={`${editorAnim ? 'anim' : ''}`} src={`http://192.168.0.100:8080/mobile?tpl_id=${this.tplId}&amp;id=${this.productId}`}></iframe>
        {loadingTemplate ? <View className='loading'><AtActivityIndicator size={64} mode='center' /></View> : null}
      </View>
    </View>
  }
}
