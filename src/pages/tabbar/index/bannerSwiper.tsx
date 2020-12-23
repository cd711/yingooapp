import "./bannerSwiper.less";
import Taro, {useState} from "@tarojs/taro";
import {Image, Swiper, SwiperItem, View} from "@tarojs/components";

interface BannerSwiperProps {
    banners: [];
    onItemClick?: (data, current) => void;
}
const BannerSwiper: Taro.FC<BannerSwiperProps> = props => {

    const {
        banners = [],
        onItemClick
    } = props;

    const [active, setActive] = useState(0);

    return (
        <View className="banner_swiper_container">
            <div className="swiper_main">
                <Swiper
                    className='index_banner_swiper'
                    indicatorColor='#00000050'
                    indicatorActiveColor='#fff'
                    circular
                    interval={3000}
                    indicatorDots={false}
                    onChange={({detail: {current}}) => setActive(current)}
                >
                    {
                        banners.map((value: any, index) => {
                            return <SwiperItem key={`${index}`}>
                                <View className='index_banner_swiper_item' onClick={() => onItemClick(value, index)}>
                                    <Image src={value.thumb_image} className="index_banner_swiper_item_img" mode="widthFix"/>
                                </View>
                            </SwiperItem>
                        })
                    }
                </Swiper>
            </div>
            <div className="swiper_dots">
                {
                    banners.map((_, index) => (
                        <View key={`${index}`} className={`dot ${active === index ? "active" : ""}`} />
                    ))
                }
            </div>
        </View>
    )
}

export default BannerSwiper
