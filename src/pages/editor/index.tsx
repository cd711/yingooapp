import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './index.less'

export default class Index extends Component<{}, {
  size?: {width: string | number; height: string | number};
  editorAnim?: boolean;
  data?: number;
}> {

    componentDidMount() {
      window.addEventListener("message", this.onMsg);
    }
    componentWillMount() {
      window.removeEventListener("message", this.onMsg);
    }

    onMsg: {(e: MessageEvent<any>): void} = ({data}) => {
      console.log("msg", data);
      if (!data) {
        return;
      }
      if (data.from == "editor") {
        switch (data.type) {
          case "mainSize":
            setTimeout(()=>this.setEditorSize(data.data), 3000);
            break;
        }
      }
    }

    setEditorSize: {(size: {width: number; height: number}): void} = ({width, height}) => {
      
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
      setTimeout(()=> this.setState({
        editorAnim: false}), 3000);
    }
    render() {
      const {size, editorAnim} = this.state;

      
      return <View>
        <View className={`editor ${editorAnim ? ' anim' : ''}`} style={size ? {width: size.width, height: size.height} : undefined}>
          {/* eslint-disable-next-line react/forbid-elements */}
          <iframe className={`${editorAnim ? 'anim' : ''}`} src='http://192.168.0.100:8080/mobile?tpl_id=20200826&amp;id=12'></iframe>
        </View>
        </View>     
    }
}
