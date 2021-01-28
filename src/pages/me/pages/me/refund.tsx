
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Image,Input, Button } from '@tarojs/components'
import './refund.less'
import IconFont from '../../../../components/iconfont';
import { AtNavBar,AtTextarea} from 'taro-ui'
import {debuglog, setPageTitle} from "../../../../utils/common";

export default class Refund extends Component<any,{
    textValue:string
}> {

    config: Config = {
        navigationBarTitleText: '申请退款'
    }

    constructor(props){
        super(props);
        this.state = {
            textValue:""
        }
    }

    componentDidMount() {
        setPageTitle("申请退款")
    }

    handleChange = (value) => {
        this.setState({
            textValue:value
        })
    }

    render() {
        const { textValue } = this.state;
        return (
            <View className='refund'>
                <AtNavBar
                    onClickLeftIcon={()=>{
                        Taro.navigateBack();
                    }}
                    color='#121314'
                    title='申请退款'
                    border={false}
                    // fixed
                    leftIconType={{
                        value:'chevron-left',
                        color:'#121314',
                        size:24
                    }}
                />
                <View className='plist'>
                    <View className='order-info'>
                        <View className='order-img'>
                            <Image src='' className='img' />
                            <View className='big'><IconFont name='20_fangdayulan' size={40} /></View>
                        </View>
                        <View className='order-name'>
                            <Text className='name'>INS 6寸LOMO定制高…</Text>
                            <Text className='gg'>规格：210*210mm/20g超感纸/硬壳</Text>
                            <Text className='num'>x1</Text>
                        </View>
                        <View className='price'>
                            <Text className='symbol'>￥</Text>
                            <Text className='n'>49.9</Text>
                        </View>
                    </View>
                </View>
                <View className='total'>
                    <Text className='name'>退款金额</Text>
                    <View className='price'>
                        <Text className='symbol'>￥</Text>
                        <Text className='n'>49.9</Text>
                    </View>
                </View>
                <View className='type'>
                    <Text className='name'>退款类型</Text>
                    <View className='select'>
                        <Text className='txt'>请选择</Text>
                        <IconFont name='20_xiayiye' size={40} color='#9C9DA6' />
                    </View>
                </View>
                <View className='textarea'>
                    <AtTextarea
                        value={textValue}
                        onChange={this.handleChange}
                        maxLength={200}
                        placeholder='你想说点什么？'
                    />
                </View>
                <View className='upload-pic'>
                    <View className='upload'>
                        {/* @ts-ignore */}
                        <Input type='file' accept='image/*;' className='input' onChange={(e)=>{
                            debuglog(e.detail.value)
                        }} />
                        <IconFont name='24_jiahao' size={48} color='#D7D7DA' />
                    </View>
                </View>
                <View className='contact'>
                    <Text className='name'>联系方式</Text>
                    <Input type='text' className='phone' placeholder='请留下您的联系方式' />
                </View>
                <Button className='submit'>提交</Button>
            </View>
        )
    }
}
