import "./index.less";
import Taro from "@tarojs/taro";
import {View, Text, Image} from "@tarojs/components";
import {options} from "../../utils/net";

interface DiscountProps {
    list: Array<{id: string | number, name: string, price: string}>;
    onClose?: () => void;
}
const Discount: Taro.FC<DiscountProps> = props => {

    const {list = [], onClose} = props;

    return (
        <View className="discount_modal_container">
           <View className="discount_modal_body">
               <Image src={`${options.sourceUrl}appsource/rect.png`} className="bg_img" mode="widthFix" />
               <View className="discount_modal_main">
                   <View className="tit_header">
                       <Text className="b_t">印的越多越</Text><Text className="r_t">优惠</Text>
                   </View>
                   <View className="discount_table">
                       <View className="row head">
                           <Text className="num">张数</Text>
                           <Text className="price">单价</Text>
                       </View>
                       {
                           list.map((value, index) => (
                               <View className="row" key={index.toString()}>
                                   <Text className="num">{value.name}</Text>
                                   <Text className="price">{value.price}</Text>
                               </View>
                           ))
                       }
                   </View>
               </View>
           </View>
           <View className="discount_modal_close" onClick={onClose}>
               <Image src={`${options.sourceUrl}appsource/guanb.png`} className="close_btn" mode="aspectFit" />
           </View>
        </View>
    )
}

export default Discount
