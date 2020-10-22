import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './index.less'


export default class Index extends Component<{}, {
  size?: { width: string | number; height: string | number };
  editorAnim?: boolean;
  data?: number;
}> {

  private tplId: string;
  private productId: string;

  constructor(p) {
    super(p);
    this.tplId = this.$router.params.query ? this.$router.params.query['tpl_id'] : '20200960';
    this.productId = this.$router.params.query ? this.$router.params.query['id'] : '12';
  
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
        case "mainSize":
          setTimeout(() => this.setEditorSize(data.data), 3000);
          break;
      }
    }
  }

  setEditorSize: { (size: { width: number; height: number }): void } = ({ width, height }) => {

    let w = width;
    let h = height;
    if (w > 270) {
      w = 270;
      h = 360 / width * h;
    }
    if (h > 480) {
      h = 480;
      w = 480 / h * w;
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
    }), 3000);
  }

  render() {
    const { size, editorAnim } = this.state;

    if (!this.tplId && !this.productId) {
      return null;
    }
    return <View>
      <View className={`editor ${editorAnim ? ' anim' : ''}`} style={size ? { height: size.height } : undefined}>
        {/* eslint-disable-next-line react/forbid-elements */}
        <iframe className={`${editorAnim ? 'anim' : ''}`} src={`http://192.168.0.100:8080/mobile?tpl_id=${this.tplId}&amp;id=${this.productId}`}></iframe>
      </View>
    </View>
  }
}
