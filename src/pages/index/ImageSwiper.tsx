import Taro, {useState} from "@tarojs/taro";
import {View, Text, Image, Swiper, SwiperItem, Button} from "@tarojs/components";
import "./index.less";
import {ossUrl} from "../../utils/common";
import RGBAster from "rgbaster";

interface ImageSwiperProps {
    item: any;
    onItemClick?: (current: any) => void;
}
const ImageSwiper: Taro.FC<ImageSwiperProps> = props => {

    const {item, onItemClick} = props;

    const [current, setCurrent] = useState<number>(0);
    const [color, setColor] = useState<string>("transparent");

    const getCurrentSwiperColor = (index) => {
        setCurrent(index)
        const img = item.clist[index].thumb_image;
        RGBAster(ossUrl(img, 0), {
            ignore: [ 'rgb(255,255,255)', 'rgb(0,0,0)' ],
            scale: 0.6
        }).then(res => {
            const cArr = res.slice(1, 10);
            // console.log(cArr)
            setColor(cArr[2].color)

        }).catch(e => {
            console.log(e)
        })
    }

    const onClick = () => {
        const currentItem = item.clist[current];
        if (currentItem) {
            onItemClick && onItemClick(currentItem)
        }
    }

    return (
        <View className='temp-warp' style={{background: color}}>
            <View style='background:rgba(0, 0, 0, 0.03);' className='mask'>
                <View className='title'>
                    <Text className='txt'>{item.title}</Text>
                    {item.subtitle ? <Text className='sub-title'>{item.subtitle}</Text> : null}
                </View>
                <View className='swiper-back'>
                    <Swiper className='temp-swiper' vertical autoplay={true} circular={false} indicatorDots={false}
                            onChange={({detail: {current}}) => {
                                getCurrentSwiperColor(current)
                            }}
                    >
                        {
                            item.clist.map((child, cIdx) => (
                                <SwiperItem key={`child_${cIdx}`} onClick={onClick}>
                                    <Image src={ossUrl(child.thumb_image, 1)} className='photo' mode='aspectFill'/>
                                </SwiperItem>
                            ))
                        }
                    </Swiper>

                    <View className='indicatorDots'>
                        {
                            item.clist.map((_, index) => (
                                <View className={index == current ? 'dot active' : 'dot'} key={index} />
                            ))
                        }
                    </View>
                </View>
                <Button className='now-design-btn' onClick={onClick}>立即设计</Button>
            </View>
        </View>
    )
}

export default ImageSwiper
