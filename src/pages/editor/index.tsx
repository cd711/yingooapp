import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './index.less'

export default class Index extends Component<{}, {
  size?: {width: string; height: string};
  data?: number;
}> {

    componentDidMount() {
      window.addEventListener("message", this.onMsg);
    }
    componentWillMount() {
      window.removeEventListener("message", this.onMsg);
    }

    onMsg: {(e: MessageEvent<any>): void} = ({data}) => {
      if (data?.from == "editor") {
        switch (data.type) {
          case "mainSize":
            this.setEditorSize(data.data);
            break;
        }
      }
    }

    setEditorSize: {(size: {width: number; height: number}): void} = ({width, height}) => {
      let w = width;
      let h = height;
      if (w > 360) {
        w = 360;
        h = 360 / width * h;
      }
      if (h > 480) {
        h = 480;
        w = 480 / h * w;
      }
      this.setState({
        size: {
          width: `${w}rpx`,
          height: `${h}rpx`
        }
      })
    }
    render() {
      const {size} = this.state;
      return <View>
        <View className='editor' style={size}>
          <iframe src='http://localhost:8080/mobile?tpl_id=20200826&amp;id=12'></iframe>
        </View>
        </View>     
    }
}
