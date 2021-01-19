import "./phoneSwiper.less"
import Taro, {useEffect, useState} from "@tarojs/taro";
import {Button, Image, Swiper, SwiperItem, Text, View} from "@tarojs/components";
import {ossUrl} from "../../../utils/common";
import {options} from "../../../utils/net";

interface PhoneSwiperProps {
    data: any[];
    onItemClick?: (value: any) => void;
    title: string;
    subtitle: string;
}

const PhoneSwiper: Taro.FC<PhoneSwiperProps> = props => {

    const {data, onItemClick, subtitle, title} = props;

    const [current, setCurrent] = useState<number>(0);
    const [datasource, setDataSource] = useState<any[]>([])

    useEffect(() => {
        const arr = [...data];

        setDataSource([...arr])
    }, [data])

    const onClick = () => {
        onItemClick && onItemClick(datasource[current])
    }

    return (
        <View className="phone_swiper_container">
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
                                <SwiperItem key={`child_${cIdx}`}>
                                    <View className="single_phone_shell_view">
                                        <View className="single_phone_shell"
                                              onClick={() => onItemClick(child)}>
                                            <Image src={`${options.sourceUrl}appsource/sjk.png`} className="shell_ke" />
                                            <Image src={require("../../../source/sxt.png")} className="shell_ke_tou" />
                                            <Image src={ossUrl(child.thumb_image, 1)}
                                                   className='photo' mode='aspectFill'/>
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

export default PhoneSwiper
