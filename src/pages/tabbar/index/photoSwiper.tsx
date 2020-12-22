import "./photoSwiper.less"
import Taro, {useEffect, useState} from "@tarojs/taro";
import {Button, Image, Swiper, SwiperItem, Text, View} from "@tarojs/components";
import {ossUrl} from "../../../utils/common";

interface PhotoSwiperProps {
    data: any[];
    onItemClick?: (value: any) => void;
    title: string;
    subtitle: string;
}

const PhotoSwiper: Taro.FC<PhotoSwiperProps> = props => {

    const {data, onItemClick, subtitle, title} = props;

    const [current, setCurrent] = useState<number>(0);
    const [datasource, setDataSource] = useState<any[]>([])

    useEffect(() => {
        let arr = [...data];
        arr = arr.map((value) => {
            let type = 1;
            const attr = value.info.attr;
            if (attr.width && attr.height) {
                switch (true) {
                    case attr.width < attr.height:
                        type = 1;
                        break;
                    case attr.width > attr.height:
                        type = 2;
                        break;
                    case attr.width == attr.height:
                        type = 3;
                        break;
                }
            }
            return {
                ...value,
                imgType: type
            }
        });
        setDataSource([...arr])
    }, [data])

    const onClick = () => {
        onItemClick && onItemClick(datasource[current])
    }

    return (
        <View className="photo_swiper_container">
            <View className='masks'>
                <View className='title'>
                    <Text className='txt'>{title}</Text>
                    {subtitle ? <Text className='sub-title'>{subtitle}</Text> : null}
                </View>
                <View className='swiper-back'>
                    <Swiper className='temp-swiper' autoplay={false} circular={false} indicatorDots={false}
                            onChange={({detail: {current}}) => setCurrent(current)}
                    >
                        {
                            datasource.map((child, cIdx) => (
                                <SwiperItem key={`child_${cIdx}`} className="photo_glob_swiper_item">
                                    <View
                                        className={`photo_swiper_item_view `}
                                        onClick={() => onItemClick(child)}>
                                        <View className={`over_hiden_view ${child.imgType === 1 ? "rectangle" : child.imgType === 2 ? "transverse" : "square_img"}`}>
                                            {
                                                child.imgType === 1
                                                    ? <Image src={require("../../../source/rectangle.svg")} mode="heightFix" className="square_view rectangle" />
                                                    : child.imgType === 2
                                                    ? <Image src={require("../../../source/transverse.svg")} mode="heightFix" className="square_view transverse" />
                                                    : <Image src={require("../../../source/square.svg")} mode="heightFix" className="square_view square" />
                                            }
                                            <Image src={ossUrl(child.thumb_image, 1)}
                                                   className={`${child.imgType === 1 ? "rectangle_img" : child.imgType === 2 ? "transverse_img" : "square_img"}`}
                                                   mode='aspectFill'/>
                                        </View>
                                    </View>
                                </SwiperItem>
                            ))
                        }
                    </Swiper>
                    <View className='indicatorDots'>
                        {
                            datasource.map((_, index) => (
                                <View className={index == current ? 'dot active' : 'dot'} key={index + ""}/>
                            ))
                        }
                    </View>
                </View>
                <Button className='now-design-btn' onClick={onClick}>立即设计</Button>
            </View>
        </View>
    )
}

export default PhotoSwiper
