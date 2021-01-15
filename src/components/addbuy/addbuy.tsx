
import Taro, { useState,useEffect } from '@tarojs/taro'
import { View,Image,Text, Button } from '@tarojs/components'
import './addbuy.less'
import IconFont from '../iconfont';
import Checkboxs from '../checkbox/checkbox';
import Counter from '../counter/counter';
import { ossUrl } from '../../utils/common';


const AddBuy: Taro.FC<{
    product:any,
    mainProducts:any,
    isChecked:boolean,
    onItemClick:()=>void,
    onCounterChange:(num:number)=>void,
    onDetailClick:()=>void;
}> = ({product,mainProducts,isChecked,onItemClick,onCounterChange,onDetailClick}) => {
    const [selectSku,setSelectSku] = useState(null);
    const [number,setNumber] = useState(1);
    useEffect(()=>{
        const currentP=mainProducts.merge_products.find((obj)=>obj.product.id==product.id);
        // console.log("当前sku_______",currentP.sku)
        if(currentP){
            setNumber(parseInt(currentP.quantity+""))
        }
        if (currentP && currentP.sku) {
            setSelectSku(currentP.sku)
        } else {
            setSelectSku(null)
        }
    },[mainProducts])

    return  <View className='xy_add_buy'>
            <Checkboxs isChecked={isChecked} disabled onCheckedClick={()=>{
                onItemClick && onItemClick()
            }}/>
            <Image className='pre_image' src={ossUrl(product && product.thumb_image?product.thumb_image:"",0)} />

            <View className='xy_add_buy_center'>
                <View className='xy_p_title'>
                    <View className='xy_top'>
                        <Text className='xy_txt'>{product && product.title?(product.title.length>6?product.title.substring(0,6)+"...":product.title):""}</Text>
                    </View>
                    <View className='xy_detail' onClick={(e)=>{
                        e.stopPropagation();
                        onDetailClick && onDetailClick();
                    }}>
                        <Text className='xy_txt'>详情</Text>
                        <IconFont name='20_xiayiye' size={30} color='#009EE7'/>
                    </View>
                </View>
                {
                    product && product.sku ?<View className='xy_center'>
                        <Text className='txt'>{product.sku.value.join("/")}</Text>
                    </View>:selectSku != null ? <View className='xy_center'>
                        <Text className='txt'>{selectSku.value.join("/")}</Text>
                    </View>:null
                }
                
                <View className='xy_bottom'>
                    <View className='xy_price'>
                        <View className='dp'>
                            <Text className='smy'>￥</Text>
                            <Text className='num'>{product.price}</Text>
                        </View>
                        <View className='ap'>
                            <Text className='ac'>原价：</Text>
                            <Text className='n'>￥{product.market_price}</Text>
                        </View>
                    </View>
                    {
                        isChecked?<Counter num={number} max={product.max_quantity} onButtonClick={onCounterChange}/>:<Button className='add_buy_btn'  onClick={(e)=>{
                            e.stopPropagation();
                            onItemClick && onItemClick()
                        }}>加购</Button>
                    }
                </View>
            </View>

            
            {/*  */}
        </View>
}
export default AddBuy;
