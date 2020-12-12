import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input,Picker,Button } from '@tarojs/components'
import './editor.less'
import IconFont from '../../../components/iconfont';
import { api } from '../../../utils/net';
import { AtTextarea,AtSwitch } from 'taro-ui';
// import region from '../../../utils/region';
import TipModal from '../../../components/tipmodal/TipModal'
import { observer, inject } from '@tarojs/mobx';
import { userStore } from '../../../store/user';
import {templateStore} from '../../../store/template';
import isEmpty from 'lodash/isEmpty';
import { fixStatusBarHeight } from '../../../utils/common';

interface CityModal {
    province:any,
    city:Array<any>
    area:Array<any>
}
@inject("userStore","templateStore")
@observer
export default class Editor extends Component<any,{
    pickerRange:Array<any>;
    pickerValue:Array<number>;
    region:string;
    addressValue:string;
    atSwitchValue:boolean;
    regionArray:Array<CityModal>;
    inputName:string;
    inputNumber:string;
    tipModalShow:boolean;
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
            atSwitchValue:false,
            regionArray:[],
            inputName:"",
            inputNumber:"",
            tipModalShow:false
        }
    }

    componentDidMount() {
        if (!userStore.isLogin) {
            Taro.switchTab({
                url:'/pages/index/index'
            })
        }
        this.getRegion()
        
    }
    componentDidShow(){
        const {id} = this.$router.params
        if (id && parseInt(id)>0) {
           Taro.setNavigationBarTitle({
               title:'编辑地址'
           });
        //    document.title = '编辑地址';
        }
    }
    getRegionInfo(region:Array<any>){
        const {id} = this.$router.params
        if (id && parseInt(id)>0) {
            api("app.address/info",{id}).then((res)=>{
                let p:any = {};
                let c:any = {};
                let a:any = {};
                for (const iterator of region) {
                    if (iterator.id==res.province_id) {
                        p = iterator;
                    }
                    if(iterator.id == res.city_id) {
                        c = iterator;
                    }
                    if(iterator.id == res.area_id) {
                        a = iterator;
                    }
                }

                this.setState({
                    inputName:res.contactor_name,
                    inputNumber:res.phone,
                    atSwitchValue:res.is_default>0?true:false,
                    addressValue:res.address,
                    region:p.name+' '+c.name+' '+a.name,

                });
                Taro.hideLoading();
           }).catch((e)=>{
                setTimeout(() => {
                    Taro.navigateBack();
                }, 2000);
                Taro.showToast({
                    title:e,
                    icon:'none',
                    duration:2000,
                })
            })
        }else {
            Taro.hideLoading();
        }

    }
    private province:Array<any> = [];
    getRegion = () => {     
        Taro.showLoading({title:"加载中..."});   
        api("common/area").then((res)=>{
            const range = this.state.pickerRange;
            const temp = this.formatRegion(res);
            range.push(this.getItemName(this.province));
            range.push(this.getItemName(temp[0].city));
            range.push(this.getItemName(temp[0].area[0]));
            this.setState({
                pickerRange:range,
                regionArray:temp
            });
            this.getRegionInfo(res);
        }).catch(()=>{
            setTimeout(() => {
                Taro.navigateBack();
            }, 2000);
            Taro.showToast({
                title:'获取数据失败！请稍后再试...',
                icon:'none',
                duration:2000,
            })
        })
    }

    getItemName(arr:Array<any>){
        const temp:Array<any> = [];
        for (const iterator of arr) {
            temp.push(iterator.name);
        }
        return temp;
    }

    formatRegion(regionArray:Array<any>){
        const region:Array<CityModal> = [];
        for (const iterator of regionArray) {
            if (iterator.level == 1) {
                const data:CityModal = {
                    province:{},
                    city:[],
                    area:[]
                };
                this.province.push(iterator);
                data.province = iterator;
                for (const citerator of regionArray) {
                    if (iterator.id==citerator.pid && citerator.level == 2) {
                        data.city.push(citerator);
                        const tempa:Array<any> = [];
                        for (const aitem of regionArray) {
                            if (citerator.id==aitem.pid && aitem.level == 3) {
                                tempa.push(aitem)
                            }
                        }
                        data.area.push(tempa)
                    }
                }
                region.push(data);
            }
        }
        return region; 
    }

    onPickerChange = (e) => {
        let regionTemp = this.state.region;
        const rangeTemp = this.state.pickerRange;
        let valueTemp = this.state.pickerValue;
        // let regionArray = this.state.regionArray;
        valueTemp = e.detail.value;
        regionTemp = rangeTemp[0][valueTemp[0]] + ' ' + rangeTemp[1][valueTemp[1]] + ' ' + rangeTemp[2][valueTemp[2]];
        this.setState({
            region: regionTemp,
            pickerRange: rangeTemp,
            pickerValue: valueTemp
        })
        console.log(regionTemp,rangeTemp,valueTemp)

    }

    onPickerColumnChange = (e) => {
        
        const rangeTemp = this.state.pickerRange;
        const valueTemp = this.state.pickerValue;

        const column = e.detail.column;
        const row = e.detail.value;

        valueTemp[column] = row;
        const regionArray = this.state.regionArray;
        switch (column) {
            case 0:
                let cityTemp:Array<any> = [];
                let districtAndCountyTemp:Array<any> = [];

                cityTemp = regionArray[row].city;
                districtAndCountyTemp = regionArray[row].area[0];

                valueTemp[1] = 0;
                valueTemp[2] = 0;
                rangeTemp[1] = this.getItemName(cityTemp);
                rangeTemp[2] = this.getItemName(districtAndCountyTemp);
                break;
            case 1:
                let districtAndCountyTemp2:Array<any> = [];
                districtAndCountyTemp2 = this.getItemName(regionArray[valueTemp[0]].area[row])
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
        // console.log(value)
        this.setState({
            atSwitchValue:value
        })
    }
    checkInfo() {
        const { addressValue,inputName,inputNumber,region } = this.state;
        const pattern = /(13\d|14[579]|15[^4\D]|17[^49\D]|18\d)\d{8}/g;
        if (inputName.length==0) {
            Taro.showToast({
                title:'联系人不能为空！',
                icon:'none',
                duration:1000
            });
            return false;
        }
        if (!pattern.test(inputNumber)) {
            Taro.showToast({
                title:'手机号码错误！',
                icon:'none',
                duration:1000
            });
            return false;
        }
        if (region.length == 0) {
            Taro.showToast({
                title:'请选择省/市/县（区）',
                icon:'none',
                duration:1000
            });
            return false;
        }
        if (addressValue.length == 0) {
            Taro.showToast({
                title:'请填写详细地址',
                icon:'none',
                duration:1000
            });
            return false;
        }
        return true
    }
    onSave = () => {
        const { pickerValue,addressValue,atSwitchValue,inputName,inputNumber,regionArray } = this.state;
        const p = regionArray[pickerValue[0]].province;
        const c = regionArray[pickerValue[0]].city[pickerValue[1]];
        const a = regionArray[pickerValue[0]].area[pickerValue[1]][pickerValue[2]];
        if (!this.checkInfo()) {
            return;  
        }
        Taro.showLoading({title:"保存中..."});
        let url = "app.address/add";
        const data = {
            province_id:p.id,
            city_id:c.id,
            area_id:a.id,
            address:addressValue,
            is_default:atSwitchValue?1:0,
            contactor_name:inputName,
            phone:inputNumber
        };
        const {id} = this.$router.params
        if (id && parseInt(id)>0) {
            url = 'app.address/edit';
            data["id"] = id;
            console.log(id);
        }
        api(url,data).then(()=>{
            Taro.hideLoading();
            Taro.showToast({
                title:"保存成功!",
                icon:"success",
                duration:1500
            });
            userStore.getUserInfo();
            setTimeout(() => {
                Taro.navigateBack();
            }, 1500);
        }).catch((e)=>{
            Taro.hideLoading();
            Taro.showToast({
                title:e,
                icon:"none",
                duration:1500
            });
            setTimeout(() => {
                Taro.navigateBack();
            }, 1400);
        })

    }

    //删除事件
    onDel = ()=> {
        const {id} = this.$router.params
        if (id && parseInt(id)>0) {
            Taro.showLoading({title:"正在删除..."});
            api('app.address/del',{id}).then(()=>{
                Taro.hideLoading();
                userStore.getUserInfo();
                if (!isEmpty(templateStore.address)) {
                    templateStore.address = null;
                }
                setTimeout(() => {
                    Taro.navigateBack();
                }, 1500);
                Taro.showToast({
                    title:'删除成功!',
                    icon:'none',
                    duration:1500
                })
            }).catch(()=>{
                Taro.hideLoading();
                setTimeout(() => {
                    Taro.navigateBack();
                }, 1500);
                Taro.showToast({
                    title:'删除失败，稍后在试!',
                    icon:'none',
                    duration:1500
                })
            })
        }
    }


    render() {
        const { pickerRange,pickerValue,addressValue,atSwitchValue,region,inputName,inputNumber,tipModalShow } = this.state;
        const {id} = this.$router.params;
        return (
            <View className='editor'>
                {/* @ts-ignore */}
                <View className='nav-bar' style={fixStatusBarHeight()}>
                    <View className='left' onClick={()=>{
                        Taro.navigateBack();
                    }}>
                        <IconFont name='24_shangyiye' size={48} color='#121314' />
                    </View>
                    <View className='center'>
                        <Text className='title'>{id && parseInt(id)>0?'编辑地址':'新增地址'}</Text>
                    </View>
                </View>
                <View className='container'>
                    <View className='item'>
                        <Text className='name'>联系人：</Text>
                        <Input type='text' className='input-name' placeholder='请输入名称' maxLength={10} value={inputName} onInput={({detail:{value}})=>this.setState({inputName:value})} />
                    </View>
                    <View className='item'>
                        <Text className='name'>手机号：</Text>
                        <Input type='number' placeholder='请填写收货手机号' maxLength={11} value={inputNumber} onInput={({detail:{value}})=>this.setState({inputNumber:value})} />
                    </View>
                    <Picker
                      mode='multiSelector' 
                      onChange={this.onPickerChange}
                      onColumnChange={this.onPickerColumnChange}
                      range={pickerRange}
                      value={pickerValue}
                    >
                        <View className='item'>
                            <Text className='name'>所在地区：</Text>
                            <View className='right'>
                                <Text className={region.length>0?'region selected':'region'}>{region.length>0?region:'请选择省/市/县（区）'}</Text>
                                <View className='sym'><IconFont name='20_xiayiye' size={40} color='#9C9DA6' /></View>
                            </View>
                        </View>
                    </Picker>
                    <View className='item column'>
                        <Text className='name'>详细地址：</Text>
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
                    <View className='item'>
                        {/* <Text className="name">设为默认地址</Text> */}
                        <AtSwitch title='设为默认地址' color='#42DAC4' border={false} onChange={this.onAtSwitchChange} checked={atSwitchValue} />
                    </View>
                    {
                        id && parseInt(id)>0?<View className='item del' onClick={()=>{
                            this.setState({
                                tipModalShow:true
                            })
                        }}>
                            <Text className='deltxt'>删除该地址</Text>
                        </View>:null
                    }
                </View>
                <Button className='save-btn' onClick={this.onSave}>保存</Button>
                <TipModal isShow={tipModalShow} tip='是否要删除该地址？？' onCancel={()=>{
                    this.setState({
                        tipModalShow:false
                    })
                }} onOK={()=>{
                    this.onDel();
                    this.setState({
                        tipModalShow:false
                    })
                }} cancelText='取消' okText='删除' />
            </View>
        )
    }
}
