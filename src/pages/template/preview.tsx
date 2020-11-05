import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image, Button } from '@tarojs/components'
import './preview.less';
import IconFont from '../../components/iconfont';
// import { api } from '../../utils/net'

// import {templateStore} from '../../store/template';
import { observer, inject } from '@tarojs/mobx';
// import { AtLoadMore } from 'taro-ui';
// import lodash from 'lodash';
// import moment from 'moment';
// import {ossUrl} from '../../utils/common'
import { PlaceOrder } from './place';

const pics = [
    "https://i.ibb.co/sK68FQ0/c6a8dc33e8a84646b4cdc30f5cea391efc8a141c2bef0-UJ8-MBJ.jpg",
    "https://i.ibb.co/n6Ky6bV/cfff57e742254d16d383aa0e580ca03baa37099fed129-PZBbzk-fw1200.jpg",
    "https://i.ibb.co/sK68FQ0/c6a8dc33e8a84646b4cdc30f5cea391efc8a141c2bef0-UJ8-MBJ.jpg",
    "https://i.ibb.co/n6Ky6bV/cfff57e742254d16d383aa0e580ca03baa37099fed129-PZBbzk-fw1200.jpg",
    "https://i.ibb.co/sK68FQ0/c6a8dc33e8a84646b4cdc30f5cea391efc8a141c2bef0-UJ8-MBJ.jpg",
    "https://i.ibb.co/n6Ky6bV/cfff57e742254d16d383aa0e580ca03baa37099fed129-PZBbzk-fw1200.jpg",
]



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
  
  
  
  

  

@inject("templateStore")
@observer
export default class Preview extends Component<{},{
    placeOrderShow:boolean;
}> {

    config: Config = {
        navigationBarTitleText: '预览'
    }
    
    constructor(props){
        super(props);
        this.state = {
            placeOrderShow:false
        }
    }
    componentDidMount() {
        editorProxy = document.querySelector<HTMLIFrameElement>(".editor_frame").contentWindow;
    
        window.addEventListener("message", this.onMsg);
    
       
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
            const {doc} = Taro.getStorageSync("doc_draft");
            console.log(doc);
            
            callEditor("setDoc", doc);
            
          // callEditor("loadDraft")
          break;

        case "onload":
          
        case "mainSize":
          // this.setEditorSize(data.data);
          break;

        case "selected":
          break;
      }
    }
  }




    onPlaceOrderClose= () => {
        this.setState({
            placeOrderShow:false
        });
    }
    
    render() {
        const { placeOrderShow } = this.state;

        return (
            <View className='preview'>
                <View className='nav-bar'>
                    <View className='left' onClick={()=>{
                        window.location.replace('/editor/shell');
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314' />
                    </View>
                    <View className='center'>
                        <Text className='title'>预览</Text>
                    </View>
                    <View className='right'>
                        <IconFont name='24_fenxiang' size={48} color='#121314' />
                    </View>
                </View>
                <View className='container'>
                <iframe className="editor_frame" src={`http://192.168.0.100:8080/mobile?tpl_id=0`}></iframe>
                </View>
                <View className='bottom'>
                    <View className='editor'>
                        {/* 保存按钮 图标:24_qubaocun 文字:保存 */}
                        <IconFont name='24_qubianji' size={48} color='#707177' />
                        <Text className='txt'>编辑</Text>
                    </View>
                    <Button className='noworder' onClick={()=>{
                        this.setState({
                            placeOrderShow:true
                        })
                    }}>立即下单</Button>
                </View>
                <PlaceOrder isShow={placeOrderShow} onClose={this.onPlaceOrderClose} images={pics} onButtonClose={this.onPlaceOrderClose} onBuyNumberChange={(n)=>{
                    console.log(n);
                }} />
            </View>
        )
    }
}
