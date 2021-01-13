
import Taro, { useState,useEffect } from '@tarojs/taro'
import { View,Text, ScrollView, Button } from '@tarojs/components'
import './changePackage.less'
import IconFont from '../iconfont';
import Checkboxs from '../checkbox/checkbox';

// let n = 0;

interface ChangePackageParmes{
    isShow:boolean;
    onClose:()=>void;

}

const ChangePackage: Taro.FC<ChangePackageParmes> = ({isShow,onClose}) => {
    // const [isOpened,setIsOpened] = useState(false);

    // useEffect(()=>{
    //     if (isOpened != isShow) {
    //         setIsOpened(isShow)
    //     }
    // },[isShow]);


    return  <View className='xy_float_modal'>
            <View className={isShow?'float-layout float-layout--active':'float-layout'}>
                <View className='float-layout__overlay'></View>
                <View className='float-layout__container'>
                    <View className='xy_modal_container'>

                        <View className='title_bar'>
                            <View className='title'>
                                <Text className='txt'>更换套餐</Text>
                            </View>
                            <View className='close' onClick={()=>{
                                onClose && onClose()
                            }}>
                                <IconFont name='20_guanbi' size={40} color='#121314' />
                            </View>
                        </View>

                        <View className="vote_list_container">
                            <View className="current_package">
                                <Text className='current_package_name'>当前套餐</Text>
                                <View className='current_package_right'>
                                    <Text className='num'>10张</Text>
                                    <View className='price'>
                                        <Text className='symbol'>￥</Text>
                                        <Text className='number'>9.9</Text>
                                    </View>
                                </View>
                            </View>
                            <View className='more_vote_package'>
                                <Text className='txt'>更多优惠套餐</Text>
                            </View>
                            <ScrollView scrollY>
                                <View className='more_vote_list'>
                                    <View className='vote_item'>
                                        <View className='vote_left'>
                                            <Checkboxs isChecked onChange={()=>{}}/>
                                            <Text className='vote_offset'>20张</Text>
                                        </View>
                                        <View className='price'>
                                            <Text className='symbol'>￥</Text>
                                            <Text className='number'>9.9</Text>
                                        </View>
                                    </View>
                                    <View className='vote_item'>
                                        <View className='vote_left'>
                                            <Checkboxs isChecked={false} onChange={()=>{}}/>
                                            <Text className='vote_offset'>20张</Text>
                                        </View>
                                        <View className='price'>
                                            <Text className='symbol'>￥</Text>
                                            <Text className='number'>9.9</Text>
                                        </View>
                                    </View>
                                    <View className='vote_item'>
                                        <View className='vote_left'>
                                            <Checkboxs isChecked={false} onChange={()=>{}}/>
                                            <Text className='vote_offset'>20张</Text>
                                        </View>
                                        <View className='price'>
                                            <Text className='symbol'>￥</Text>
                                            <Text className='number'>9.9</Text>
                                        </View>
                                    </View>
                                </View>
                            </ScrollView>
                        </View>
                        
                        <Button className='red_change_button'>确定更换</Button>

                    </View>
                </View>
            </View>
        </View>
}
export default ChangePackage;
