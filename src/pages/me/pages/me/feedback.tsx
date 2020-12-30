import {Image, ScrollView, Text, View} from "@tarojs/components";
import {AtInput, AtTextarea} from 'taro-ui'
import Taro, {useState} from "@tarojs/taro";
import IconFont from "../../../../components/iconfont";
import UploadFile from "../../../../components/Upload/Upload";
import "./feedback.less";
import {deviceInfo} from "../../../../utils/common";
import {api} from "../../../../utils/net";

const Feedback: Taro.FC<any> = (_) => {

    const feedBackArr = [
        {key: 1, name: "页面闪退", icon: "24_yemianshantui"},
        {key: 2, name: "网络传输", icon: "24_chuanshuwenti"},
        {key: 3, name: "操作体验", icon: "24_caozuotiyan"},
        {key: 4, name: "界面审美", icon: "24_jiemianshenmei"},
        {key: 5, name: "功能建议", icon: "24_gongnengjianyi"},
        {key: 6, name: "其他反馈", icon: "24_qitajianyi"},
    ];

    const initObj = {
        reason: 1,
        remark: "",
        tel: "",
        imgs: []
    }
    const [formData, setFormData] = useState({...initObj});

    const onUpload = (data) => {
        if (data) {
            const arr = [...formData.imgs];
            arr.push(data.cdnUrl);
            setFormData(prev => ({...prev, imgs: [...arr]}))
        }
    }

    function getWidth() {
        return {
            width: deviceInfo.env === 'h5' ? window.screen.width / 4 - 15 + "px" : deviceInfo.screenWidth / 4 - 15 + "px",
            height: deviceInfo.env === 'h5' ? window.screen.width / 4 - 15 + "px" : deviceInfo.screenWidth / 4 - 15 + "px",
        }
    }

    const onDelete = (_, idx) => {
        const arr = [...formData.imgs];
        arr.splice(idx, 1);
        setFormData(prev => ({...prev, imgs: [...arr]}))
    }

    const onSubmit = async () => {
        if (!formData.remark || !formData.tel) {
            Taro.showToast({
                title: "必填项不能为空",
                icon: "none"
            })
            return
        }
        console.log(console.log(formData))
        Taro.showLoading({title: "请稍后..."});
        try {
            await api("app.feedback/add", {
                classify: formData.reason,
                intro: formData.reason,
                images: formData.imgs.join(","),
                phone: formData.tel
            });
            Taro.hideLoading();
            Taro.showToast({
                title: "提交成功",
                icon: "success"
            });
            setFormData({...initObj})
        } catch (e) {
            Taro.hideLoading();
            console.log("提交出错：", e)
        }

    }

    return (
        <View className="feedback_container">
            {/* @ts-ignore */}
            <View className='nav-bar' style={{
                height: `${deviceInfo.env === "weapp" ? deviceInfo.menu.bottom : 44}px`,
                paddingTop: `${deviceInfo.env === "weapp" ? deviceInfo.statusBarHeight : 0}px`
            }}>
                <View className='left' onClick={() => {
                    Taro.navigateBack();
                }}>
                    <IconFont name='24_shangyiye' size={48} color='#121314'/>
                </View>
                <View className='center'>
                    <Text className='title'>问题反馈</Text>
                </View>
            </View>
            <ScrollView scrollY style={{
                height: `${deviceInfo.env === "weapp" ? deviceInfo.windowHeight - deviceInfo.menu.bottom : deviceInfo.windowHeight - 44}px`
            }}>
                <View className="feedback_selector">
                    {
                        feedBackArr.map((value, index) => (
                            <View className="feedback_item_wrap" key={index + ""}>
                                <View
                                    className={`feedback_item ${Number(formData.reason) === Number(value.key) ? "active" : ""}`}
                                    onClick={() => setFormData(prev => ({...prev, reason: Number(value.key)}))}
                                >
                                    {/* @ts-ignore */}
                                    <IconFont name={value.icon} size={48}
                                              color={Number(formData.reason) === Number(value.key) ? "#fff" : "#999"}/>
                                    <Text className="txt">{value.name}</Text>
                                </View>
                            </View>
                        ))
                    }
                </View>
                <View className="feedback_actions">
                    <View className="action_row">
                        <Text className="title important">我要反馈</Text>
                        <AtTextarea className="text_area" maxLength={200} height={150} placeholder="您想说点什么？"
                                    value={formData.remark}
                                    onChange={(remark, _) => setFormData(prev => ({...prev, remark}))}
                        />
                    </View>
                    <View className="action_row">
                        <View className="feedback_imgs">
                            {
                                formData.imgs.map((value, index) => (
                                    <View className="imgs_item_wrap" key={index + ""}>
                                        <View className="img_item" style={getWidth()}>
                                            <Image src={value}
                                                   className="img"
                                                   mode="aspectFill"
                                                   style={getWidth()}
                                            />
                                        </View>
                                        <View className="delete_btn" onClick={() => onDelete(value, index)}>
                                            <IconFont name="16_qingkong" size={32}/>
                                        </View>
                                    </View>
                                ))
                            }
                            {
                                formData.imgs.length < 4
                                    ? <View className="imgs_item_wrap">
                                        <View className="img_item">
                                            <UploadFile uploadType="image" extraType={1} count={3} className="upload_box"
                                                        onChange={onUpload} style={getWidth()}>
                                                <View className="upload_view" style={{
                                                    ...getWidth(),
                                                    borderRadius: "6px",
                                                    border: "1px dashed #eee",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    background: "#F5F6F9",
                                                }}>
                                                    <IconFont name="24_jiahao" size={48} color="#999"/>
                                                </View>
                                            </UploadFile>
                                        </View>
                                    </View>
                                    : null
                            }
                        </View>
                    </View>
                    <View className="action_row">
                        <Text className="title important">联系方式</Text>
                        <AtInput placeholder="请留下您的联系方式" className="account_number"
                                 name="tel"
                                 value={formData.tel}
                                 onChange={(tel: any, _) => setFormData(prev => ({...prev, tel}))}/>
                    </View>
                    <View className="submit_view">
                        <View className={`submit ${!formData.remark || !formData.tel ? "disable" : ""}`}
                              onClick={onSubmit}>
                            <Text className="txt">提交</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default Feedback
