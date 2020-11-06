
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image, Button } from '@tarojs/components'
import './photos.less'
import IconFont from '../../components/iconfont';
import { AtActivityIndicator } from 'taro-ui'
import {api, uploadApi} from "../../utils/net";
import uploadFile = Taro.uploadFile;
import UploadFile from "../../components/Upload/Upload";

export default class Photos extends Component<any,{
    navSwitchActive:number;
    loading: boolean;
    list: []
}> {

    config: Config = {
        navigationBarTitleText: '首页'
    }
    constructor(props){
        super(props);
        this.state = {
            navSwitchActive:0,
            loading: true,
            list: []
        }
    }

    componentDidMount() {
        this.getList(0)
    }

    async getList(start: number = 0, size: number = 10, type = this.state.navSwitchActive) {
        try{
            const res = await api("app.profile/imgs", {start, size, type: type === 1 ? "image" : "video"});
            console.log(res);
            this.setState({loading: false})
        }catch (e) {
            console.log("获取图库出错：", e)
        }
    }

    uploadFile = async files => {
        console.log(files)

    }


    render() {
        const { navSwitchActive, loading, list } = this.state;
        const tabs = ["图片","视频"];
        return (
            <View className='photos'>
                <View className='nav-bar'>
                    <View className='left' onClick={()=>{
                        Taro.navigateBack();
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314' />
                    </View>
                    <View className='center'>
                        <View className='nav-switch'>
                            {
                                tabs.map((item,index)=>(
                                    <View className={navSwitchActive==index?'item active':'item'} key={index} onClick={()=>{
                                        this.setState({
                                            navSwitchActive:index
                                        })
                                    }}>
                                        <Text className='txt'>{item}</Text>
                                    </View>
                                ))
                            }
                        </View>
                    </View>
                </View>
                <View className='container'>
                    {
                        list.length === 0
                            ? <View className='empty'>
                                <Image src={require('../../source/empty/nophoto.png')} className='img' />
                                <Text className='txt'>暂无素材</Text>
                                <UploadFile extraType={navSwitchActive === 0 ? 3 : 4}
                                            type="button"
                                            onChange={this.uploadFile}>
                                    <Button className='btn'>上传素材</Button>
                                </UploadFile>
                            </View>
                            : <View className="list_container">
                                <View className="list_filter">
                                    <Text>排序</Text>
                                    <View><IconFont size={48} name="24_tupianpaixu"/></View>
                                </View>
                                <View className="list_main">
                                    {
                                        list.map((item, idx) => {
                                            return <View className="img_item" key={idx}>
                                                <Text>asdasda{idx}</Text>
                                            </View>
                                        })
                                    }
                                </View>
                            </View>
                    }
                    {loading ? <AtActivityIndicator mode='center'></AtActivityIndicator> : null}
                </View>
            </View>
        )
    }
}
