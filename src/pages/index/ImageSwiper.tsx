import Taro, {useState} from "@tarojs/taro";
import {View, Text, Image, Swiper, SwiperItem, Button,Canvas} from "@tarojs/components";
import "./ImageSwiper.less";
import {ossUrl, RGBAster} from "../../utils/common";

interface ImageSwiperProps {
    item: any;
    parent:any;
    onItemClick?: (current: any) => void;
}
const ImageSwiper: Taro.FC<ImageSwiperProps> = props => {

    const {item, onItemClick,parent} = props;

    const [current, setCurrent] = useState<number>(0);
    const [color, setColor] = useState<string>("#FFF");
    const [fontColor, setFontColor] = useState<string>("#000")

    const getCurrentSwiperColor = (index) => {
        setCurrent(index)
        const img = item.clist[index].thumb_image;
        RGBAster({
            src: ossUrl(img, 0),
            canvasId:"img-canvas",
            parentThis:parent,
            options: {
                ignore: [ 'rgb(255,255,255)', 'rgb(0,0,0)' ],
                scale: 0.6
            }
        }).then(res => {
            const cArr = res.slice(1, 10);
            const currentColor = cArr[2].color;

            let colorArr = currentColor.split("(");
            colorArr = colorArr[1].split(")");
            colorArr = colorArr[0].split(",");
            let num = 0;
            colorArr.forEach(val => {
                num += val * 1
            });
            if (num / 3 > 200) {
                // 浅色
                setFontColor("#2c2c2c")
            } else {
                // 深色
                setFontColor("#fff")
            }
            setColor(`rgba(${colorArr.join(",")}, .5)`)

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
            {/* <Canvas canvasId="img-canvas" type="2d"></Canvas> */}
            <View style={process.env.TARO_ENV === 'h5'?'background:rgba(0, 0, 0, 0.03);':''} className='masks'>
                <View className='title'>
                    <Text className='txt' style={{color: fontColor}}>{item.title}</Text>
                    {item && item.subtitle ? <Text className='sub-title' style={{color: fontColor}}>{item.subtitle}</Text> : null}
                </View>
                <View className='swiper-back'>
                    <Swiper className='temp-swiper' vertical autoplay={false} circular={false} indicatorDots={false}
                            onChange={({detail: {current}}) => {
                                if (process.env.TARO_ENV === 'h5') {
                                    getCurrentSwiperColor(current)
                                }
                                if (process.env.TARO_ENV === 'weapp') {
                                    setCurrent(current)
                                }
                            }}
                    >
                        {
                            item && item.clist.map((child, cIdx) => (
                                <SwiperItem key={`child_${cIdx}`} onClick={onClick}>
                                    <Image src={ossUrl(child.thumb_image, 1)} className='photo' mode='aspectFill'/>
                                </SwiperItem>
                            ))
                        }
                    </Swiper>

                    <View className='indicatorDots'>
                        {
                            item && item.clist.map((_, index) => (
                                <View className={index == current ? 'dot active' : 'dot'} key={index+""} />
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
