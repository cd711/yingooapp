import {View, Image, Text, ScrollView} from "@tarojs/components";
import { AtTextarea, AtInput, AtNavBar } from 'taro-ui'
import Taro, {useState} from "@tarojs/taro";
import IconFont from "../../components/iconfont";
import UploadFile from "../../components/Upload/Upload";
import "./feedback.less";
import {deviceInfo} from "../../utils/common";

const Feedback: Taro.FC<any> = (_) => {

    const feedBackArr = [
        {name: "页面闪退", icon: "24_yemianshantui"},
        {name: "网络传输", icon: "24_chuanshuwenti"},
        {name: "操作体验", icon: "24_caozuotiyan"},
        {name: "界面审美", icon: "24_jiemianshenmei"},
        {name: "功能建议", icon: "24_gongnengjianyi"},
        {name: "其他反馈", icon: "24_qitajianyi"},
    ];

    const [formData, setFormData] = useState({
        reason: 0,
        remark: "",
        tel: "",
        imgs: []
    });

    const onUpload = (data) => {
        if (data) {
            const arr = [...formData.imgs];
            arr.push(data.cdnUrl);
            setFormData(prev => ({...prev, imgs: [...arr]}))
        }
    }

    function getWidth() {
        return {
            width: process.env.TARO_ENV === 'h5'?window.screen.width / 4 - 15:Taro.getSystemInfoSync().screenWidth/4-15,
            height: process.env.TARO_ENV === 'h5'?window.screen.width / 4 - 15:Taro.getSystemInfoSync().screenWidth/4-15,
        }
    }

    const onDelete = (_, idx) => {
        const arr = [...formData.imgs];
        arr.splice(idx, 1);
        setFormData(prev => ({...prev, imgs: [...arr]}))
    }

    const onSubmit = () => {
        if (!formData.remark) {
            return
        }

    }

    return (
        <View className="feedback_container">
            <View className="top_bar">
                <AtNavBar onClickLeftIcon={() => Taro.navigateBack()}
                          color='#121314' title="问题反馈" border
                          leftIconType={{value:'chevron-left', color:'#121314', size:24}}
                />
            </View>
            <ScrollView scrollY style={{height: deviceInfo.windowHeight - 50}}>
                <View className="feedback_selector">
                    {
                        feedBackArr.map((value, index) => (
                            <View className="feedback_item_wrap" key={index+""}>
                                <View className={`feedback_item ${Number(formData.reason) === index ? "active" : ""}`}
                                      onClick={() => setFormData(prev => ({...prev, reason: index}))}
                                >
                                    {/* @ts-ignore */}
                                    <IconFont name={value.icon} size={48} color={Number(formData.reason) === index ? "#fff" : "#999"}/>
                                    <Text className="txt">{value.name}</Text>
                                </View>
                            </View>
                        ))
                    }
                </View>
                <View className="feedback_actions">
                    <View className="action_row">
                        <Text className="title">我要反馈</Text>
                        <AtTextarea className="text_area" maxLength={200} height={150} placeholder="您想说点什么？"
                                    value={formData.remark}
                                    onChange={(remark, _) => setFormData(prev => ({...prev, remark}))}
                        />
                    </View>
                    <View className="action_row">
                        <View className="feedback_imgs">
                            {
                                formData.imgs.map((value, index) => (
                                    <View className="imgs_item_wrap" key={index+""}>
                                        <View className="img_item" style={getWidth()}>
                                            <Image src={value}
                                                   className="img"
                                                   mode="aspectFill"
                                                   style={getWidth()}
                                            />
                                        </View>
                                        <View className="delete_btn" onClick={() => onDelete(value, index)}>
                                            <IconFont name="16_qingkong" size={32} />
                                        </View>
                                    </View>
                                ))
                            }
                            <View className="imgs_item_wrap">
                                <View className="img_item">
                                    <UploadFile uploadType="image" extraType={1} className="upload_box" onChange={onUpload} style={getWidth()}>
                                        <View className="upload_view" style={getWidth()}>
                                            <IconFont name="24_jiahao" size={48} color="#999" />
                                        </View>
                                    </UploadFile>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View className="action_row">
                        <Text className="title">联系方式</Text>
                        <AtInput placeholder="请留下您的联系方式" className="account_number"
                                 name="tel"
                                 value={formData.tel}
                                 onChange={(tel: any, _) => setFormData(prev => ({...prev, tel}))} />
                    </View>
                    <View className="submit_view">
                        <View className={`submit ${!formData.remark ? "disable" : ""}`} onClick={onSubmit}>
                            <Text className="txt">提交</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default Feedback
