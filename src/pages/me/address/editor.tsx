import { ComponentType } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input,Picker,Button } from '@tarojs/components'
import './editor.less'
import IconFont from '../../../components/iconfont';
import { api } from '../../../utils/net';
import { AtTextarea,AtSwitch } from 'taro-ui';
import region from '../../../utils/region';

export default class Editor extends Component<any,{
    pickerRange:Array<any>;
    pickerValue:Array<number>;
    region:string;
    addressValue:string;
    atSwitchValue:boolean
}> {

    config: Config = {
        navigationBarTitleText: '新增地址'
    }

    constructor(props){
        super(props);
        this.state = {
            pickerRange:[],
            pickerValue:[0,0,0],
            region:"",
            addressValue:"",
            atSwitchValue:false
        }
    }
    componentWillMount() { }

    componentDidMount() { 
        let range = this.state.pickerRange;
        let temp:Array<string> = [];
        for (let i = 0; i < region.length; i++) {
            temp.push(region[i].name);
        }
        range.push(temp);
        temp = [];
        for (let i = 0; i < region[0].city.length; i++) {
            temp.push(region[0].city[i].name);
        }
        range.push(temp);
        temp = [];
        for (let i = 0; i < region[0].city[0].districtAndCounty.length; i++) {
            temp.push(region[0].city[0].districtAndCounty[i]);
        }
        range.push(temp);
        this.setState({
            pickerRange: range
        })
    }

    componentWillUnmount() { }

    onPickerChange = (e) => {
        let regionTemp = this.state.region;
        let rangeTemp = this.state.pickerRange;
        let valueTemp = this.state.pickerValue;

        valueTemp = e.detail.value;
        regionTemp = rangeTemp[0][valueTemp[0]] + ' - ' + rangeTemp[1][valueTemp[1]] + ' - ' + rangeTemp[2][valueTemp[2]];
        this.setState({
            region: regionTemp,
            pickerRange: rangeTemp,
            pickerValue: valueTemp
        })
        console.log(regionTemp,rangeTemp,valueTemp)
    }

    onPickerColumnChange = (e) => {
        let rangeTemp = this.state.pickerRange;
        let valueTemp = this.state.pickerValue;

        let column = e.detail.column;
        let row = e.detail.value;

        valueTemp[column] = row;

        switch (column) {
            case 0:
                let cityTemp:Array<any> = [];
                let districtAndCountyTemp:Array<any> = [];
                for (let i = 0; i < region[row].city.length; i++) {
                    cityTemp.push(region[row].city[i].name);
                }
                for (let i = 0; i < region[row].city[0].districtAndCounty.length; i++) {
                    districtAndCountyTemp.push(region[row].city[0].districtAndCounty[i]);
                }
                valueTemp[1] = 0;
                valueTemp[2] = 0;
                rangeTemp[1] = cityTemp;
                rangeTemp[2] = districtAndCountyTemp;
                break;
            case 1:
                let districtAndCountyTemp2:Array<any> = [];
                for (let i = 0; i < region[valueTemp[0]].city[row].districtAndCounty.length; i++) {
                    districtAndCountyTemp2.push(region[valueTemp[0]].city[row].districtAndCounty[i]);
                }
                valueTemp[2] = 0;
                rangeTemp[2] = districtAndCountyTemp2;
                break;
            case 2:
                break;
        }

        this.setState({
            pickerRange: rangeTemp,
            pickerValue: valueTemp
        })
    }
    onAtSwitchChange = (value) => {
        console.log(value)
        this.setState({
            atSwitchValue:value
        })
    }

    render() {
        const { pickerRange,pickerValue,addressValue,atSwitchValue } = this.state;
        return (
            <View className='editor'>

                <View className='nav-bar'>
                    <View className='left' onClick={()=>{
                        Taro.navigateBack();
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314' />
                    </View>
                    <View className='center'>
                        <Text className='title'>新增地址</Text>
                    </View>
                </View>
                <View className='container'>
                    <View className="item">
                        <Text className="name">联系人：</Text>
                        <Input type='text' className='input-name' placeholder='请输入名称' maxLength={10}/>
                    </View>
                    <View className="item">
                        <Text className="name">手机号：</Text>
                        <Input type='number' placeholder='请填写收货手机号' maxLength={11}/>
                    </View>
                    <Picker
                        mode='multiSelector' 
                        onChange={this.onPickerChange}
                        onColumnChange={this.onPickerColumnChange}
                        range={pickerRange}
                        value={pickerValue}
                    >
                        <View className="item">
                            <Text className="name">所在地区：</Text>
                            <View className='right'>
                                <Text className='region'>请选择省/市/县（区）</Text>
                                <View className='sym'><IconFont name='20_xiayiye' size={40} color='#9C9DA6' /></View>
                            </View>
                        </View>
                    </Picker>
                    <View className="item column">
                        <Text className="name">详细地址：</Text>
                        <AtTextarea
                            value={addressValue}
                            onChange={(value)=>{
                                this.setState({
                                    addressValue:value
                                })
                            }}
                            maxLength={30}
                            placeholder='请输入详细的地址信息'
                        />
                    </View>
                    <View className="item">
                        {/* <Text className="name">设为默认地址</Text> */}
                        <AtSwitch title="设为默认地址" color='#42DAC4' border={false} onChange={this.onAtSwitchChange} checked={atSwitchValue}/>
                    </View>
                </View>
                <Button className='save-btn'>保存</Button>
            </View>
        )
    }
}
