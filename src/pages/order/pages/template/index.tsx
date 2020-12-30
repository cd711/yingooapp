import Taro, {Component, Config} from '@tarojs/taro'
import {Image, ScrollView, Text, View} from '@tarojs/components'
import './index.less'
import IconFont from '../../../../components/iconfont'
import {api} from '../../../../utils/net'
import {inject, observer} from '@tarojs/mobx'
import {
    deviceInfo,
    getURLParamsStr,
    notNull,
    ossUrl,
    urlEncode,
    getSpecialRouter
} from '../../../../utils/common'
import LoadMore, {LoadMoreEnum} from "../../../../components/listMore/loadMore";
import LoginModal from "../../../../components/login/loginModal";
import {userStore} from "../../../../store/user";
import page from '../../../../utils/ext'
interface TagData {
    list: Array<any>,
    size: number,
    start: number,
    total: number
}

interface TagList {
    [key: string]: TagData;
}

@inject("templateStore")
@observer
@page({
    share:true
})
export default class Template extends Component<any, {
    switchActive: number;
    cates: Array<any>;
    topsHeight: number;
    otherHeight: number;
    switchTagActive: number;
    tagData: TagList;
    mainRightWidth: number;
    showAllCates: boolean;
    loadStatus: LoadMoreEnum;
    colHeight: any;
    hiddenBar: boolean
}> {
    config: Config = {
        navigationBarTitleText: '模板'
    }

    constructor(props) {
        super(props);
        this.state = {
            switchActive: 0,
            cates: [],
            topsHeight: 208,
            otherHeight: 500,
            switchTagActive: 0,
            tagData: {},
            mainRightWidth: 0,
            showAllCates: false,
            loadStatus: LoadMoreEnum.more,
            colHeight: {},
            hiddenBar: false
        }
    }

    async componentDidMount() {
        if (process.env.TARO_ENV === 'h5') {
            if (window.location.href.indexOf("template") == -1) {
                return;
            }
            window.addEventListener("resize", () => {
                this.calcDeviceRota();
            }, false)
        }

        const {j} = this.$router.params;
        if (!notNull(j)) {
            // 从首页快捷方式直接跳转过来
            this.setState({hiddenBar: true});

            this.fastInitCate()

        } else {
            this.getCate();
        }
    }

    fastInitCate = async () => {
        const {c, t} = this.$router.params;
        console.log(c, t)
        try {
            let res = await api("app.product/cate");
            res = res.map(v => {
                v.tags.unshift({
                    id: 0,
                    name: "全部"
                });
                return v
            });

            let ca = 0;
            const ta = 0;
            for (let index = 0; index < res.length; index++) {
                const element = res[index];
                console.log(parseInt(c) == element.tpl_category_id, element.tpl_category_id, index)
                if (parseInt(c) == element.tpl_category_id) {
                    ca = index
                    break;
                }
            }
            this.setState({
                cates: [...res],
                switchActive: ca,
                switchTagActive: ta
            }, () => {
                this.calcDeviceRota().then(() => {
                    this.getTagContext(res[ca].tags[ta]);
                    Taro.hideLoading();
                }).catch(() => {
                    Taro.hideLoading();
                });
            })

        } catch (e) {

        }
    }

    getCate = () => {
        Taro.showLoading({title: "加载中..."});
        api("app.product/cate").then((res) => {
            res = res.map((item) => {
                item.tags.unshift({
                    id: 0,
                    name: "全部"
                });
                return item
            });
            this.setState({cates: res})
            this.handleCate(res);
        }).catch((e) => {
            Taro.hideLoading();
            Taro.showToast({
                title: e,
                icon: "none",
                duration: 2000
            }).then(() => {
                Taro.reLaunch({
                    url: '/pages/tabbar/index/index'
                })
            });
        })
    }

    handleCate = (res) => {
        const {c, t} = this.$router.params;
        let ca = 0;
        const ta = 0;
        const cid = c ? parseInt(c) : 0;
        const tid = t ? parseInt(t) : 0;
        for (let index = 0; index < res.length; index++) {
            const element = res[index];
            ca = parseInt(element.id + "") == cid ? index : 0;
            for (let i = 0; i < element.tags.length; i++) {
                const tag = element.tags[i];
                if (parseInt(tag.id + "") == tid) {
                    // ta = i;
                    break;
                }
            }
        }
        this.setState({
            switchActive: ca,
            switchTagActive: ta
        }, () => {
            this.calcDeviceRota().then(() => {
                this.getTagContext(res[ca].tags[ta]);
                Taro.hideLoading();
            }).catch(() => {
                Taro.hideLoading();
            });
        })
        Taro.hideLoading();
    }

    calcDeviceRota = () => {
        return new Promise<void>((resolve, reject) => {
            const ww = deviceInfo.windowWidth;
            const query = Taro.createSelectorQuery;
            if (!query) {
                reject();
                return;
            }
            query().selectViewport().boundingClientRect((vres) => {
                query().selectAll(".t_tops").boundingClientRect((res: any) => {
                    query().selectAll('.left-menu').boundingClientRect((rect: any) => {
                        res.forEach((t_rect) => {
                            if (t_rect.height > 0) {
                                rect.forEach((l_rect) => {
                                    if (l_rect.width > 0) {
                                        const otherHeight = vres.height - t_rect.height;
                                        this.setState({
                                            topsHeight: t_rect.height,
                                            otherHeight,
                                            mainRightWidth: ww - l_rect.width
                                        });
                                        setTimeout(() => {
                                            resolve();
                                        }, 100);
                                    }
                                })
                            }
                        })

                    }).exec();
                }).exec();
            }).exec();
        })
    }

    componentWillUnmount() {
        if (process.env.TARO_ENV === 'h5') {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            window.removeEventListener("resize", () => {
            }, false)
        }
    }

    getTagContext = (tag) => {
        const {switchActive, cates, tagData, mainRightWidth, colHeight} = this.state;
        if (tag) {
            const tplid = cates[switchActive].tpl_category_id;
            const tagid = tag.id;
            const tagList = tagData && tagData[`${tplid}-${tagid}`] && tagData[`${tplid}-${tagid}`].list && tagData[`${tplid}-${tagid}`].list.length > 0 ? tagData[`${tplid}-${tagid}`].list : [];
            // const tagTotal = tagData && tagData[`${tplid}-${tagid}`].total && tagData[`${tplid}-${tagid}`].total>=0?tagData[`${tplid}-${tagid}`].total:0;
            if (tagList.length == 0) {

                colHeight[`${tplid}-${tagid}`] = [];
            }
            this.setState({
                loadStatus: LoadMoreEnum.loading
            })
            api("app.product_tpl/list", {
                start: tagList.length,
                size: 10,
                category_id: tplid,
                tag_id: tagid
            }).then((res) => {
                const tpl_type = cates && cates[switchActive] && cates[switchActive].tpl_type ? cates[switchActive].tpl_type : "";
                res.list = res.list.map((item, index) => {
                    const width = (mainRightWidth - (14 * 3)) / 2;
                    const height = tpl_type == "phone" ? width / (795 / 1635) : width / (item.attr.width / item.attr.height);
                    let top = 0;
                    let left = 0;
                    if (tagList.length == 0 && index < 2) {
                        if (tpl_type == "photo") {
                            if (index == 0) {
                                left = width + (2 * 14);
                                colHeight[`${tplid}-${tagid}`][0] = width;
                                colHeight[`${tplid}-${tagid}`][index + 1] = height;
                            } else {
                                const minHeight = Math.min(...colHeight[`${tplid}-${tagid}`]);
                                const minIndex = colHeight[`${tplid}-${tagid}`].indexOf(minHeight);
                                top = minHeight + 14;
                                left = minIndex % 2 == 0 ? 14 : width + (2 * 14);
                                colHeight[`${tplid}-${tagid}`][minIndex] += (height + 14);
                            }
                        }
                        if (tpl_type != "photo") {
                            left = index % 2 == 0 ? 14 : width + (2 * 14);
                            colHeight[`${tplid}-${tagid}`][index] = height;
                        }
                    } else {
                        const minHeight = Math.min(...colHeight[`${tplid}-${tagid}`]);
                        const minIndex = colHeight[`${tplid}-${tagid}`].indexOf(minHeight);
                        top = minHeight + 14;
                        left = minIndex % 2 == 0 ? 14 : width + (2 * 14);
                        colHeight[`${tplid}-${tagid}`][minIndex] += (height + 14);
                    }
                    item["width"] = width;
                    item["height"] = height;
                    item["top"] = top;
                    item["left"] = left;
                    return item;
                });

                res.list = tagList.concat(res.list);
                const {tagData} = this.state;
                tagData[`${tplid}-${tagid}`] = res;
                this.setState({
                    tagData,
                    loadStatus: res.list.length == res.total ? LoadMoreEnum.noMore : LoadMoreEnum.more
                });
                Taro.hideLoading();
            }).catch((e) => {
                console.log(e)
                this.setState({
                    loadStatus: LoadMoreEnum.noMore
                });
                Taro.showToast({
                    title: e,
                    icon: "none",
                    duration: 1500
                });
            })
        }
    }

    onScrollToLower = () => {
        const {switchActive, cates, switchTagActive, tagData, loadStatus} = this.state;
        const tags = cates && cates[switchActive] ? cates[switchActive].tags : [];
        // [`${tplid}-${tagid}`]
        const tplid = cates[switchActive].tpl_category_id;
        const tag = tags[switchTagActive];
        const tagid = tag.id;
        const tagList = tagData && tagData[`${tplid}-${tagid}`] && tagData[`${tplid}-${tagid}`].list && tagData[`${tplid}-${tagid}`].list.length > 0 ? tagData[`${tplid}-${tagid}`].list : [];
        const tagTotal = tagData && tagData[`${tplid}-${tagid}`] && tagData[`${tplid}-${tagid}`].total && tagData[`${tplid}-${tagid}`].total >= 0 ? tagData[`${tplid}-${tagid}`].total : 0;
        if (tags.length > 0 && tagList.length < tagTotal && loadStatus != LoadMoreEnum.loading) {

            this.getTagContext(tag)
        }
        if (tagList.length == tagTotal) {
            this.setState({
                loadStatus: LoadMoreEnum.noMore
            })
        }
    }

    onTagItemClick = (item, cid, tpl_type) => {
        if (tpl_type == "phone") {
            const str = getURLParamsStr(urlEncode({
                id: item.id,
                cid,
            }))
            Taro.navigateTo({
                url: `/pages/order/pages/template/detail?${str}&cp=${getSpecialRouter(this.$router)}`
            });
        }
        if (tpl_type == "photo") {
            const str = getURLParamsStr(urlEncode({
                id: 34,
                tplid: item.id,
                limit: "t"
            }))
            Taro.navigateTo({
                url: `/pages/editor/pages/printing/index?${str}`
            });
        }
    }

    onCateSwitch = (index, tags) => {
        this.setState({
            switchActive: index,
            switchTagActive: 0,
            tagData: {},
            showAllCates: false
        }, () => {
            if (tags.length > 0) {
                this.getTagContext(tags[0]);
            }
        });
    }

    routerBack = () => {
        if (Taro.getCurrentPages().length>1) {
            Taro.navigateBack();
        } else {
            if (deviceInfo.env == 'h5') {
                window.location.href = '/pages/tabbar/index/index'
            } else {
                Taro.switchTab({
                    url:'/pages/tabbar/index/index'
                })
            }
        }
    }

    render() {
        const router = this.$router;
        const {
            switchActive,
            cates,
            otherHeight,
            switchTagActive,
            tagData,
            mainRightWidth,
            showAllCates,
            loadStatus,
            colHeight,
            hiddenBar
        } = this.state;
        const tags = cates && cates[switchActive] ? cates[switchActive].tags : [];
        const tplid = cates && cates[switchActive] && cates[switchActive].tpl_category_id ? cates[switchActive].tpl_category_id : 0;
        const tagid = tags && tags[switchTagActive] && tags[switchTagActive].id ? tags[switchTagActive].id : 0;
        const tagList = tagData && tagData[`${tplid}-${tagid}`] && tagData[`${tplid}-${tagid}`].list && tagData[`${tplid}-${tagid}`].list.length > 0 ? tagData[`${tplid}-${tagid}`].list : [];
        const tpl_type = cates && cates[switchActive] && cates[switchActive].tpl_type ? cates[switchActive].tpl_type : "";

        return (
            <View className='template'>
                <LoginModal isTabbar={false}/>
                <View className='t_tops'
                      style={`padding-top:${deviceInfo.statusBarHeight}px;background: #FFF;`}>
                    <View className='nav-bar'>
                        <View className='left' onClick={this.routerBack}>
                            <IconFont name='24_shangyiye' size={48} color='#121314'/>
                        </View>
                        <View className="center"><View className="title">{router.params.title && decodeURIComponent(router.params.title) || ""}</View></View>
                        <View className="right"/>
                    </View>
                    {
                        showAllCates
                            ? <View className='all-category-warp'
                                    style={process.env.TARO_ENV === 'h5' ? "" : `top:${deviceInfo.statusBarHeight}px;`}>
                                <View className='nav-bar'>
                                    <View className='left' onClick={this.routerBack}>
                                        <IconFont name='24_shangyiye' size={48} color='#121314'/>
                                    </View>
                                    <View className="center"><View className="title">{router.params.title && decodeURIComponent(router.params.title) || ""}</View></View>
                                    <View className="right"/>
                                </View>
                                {
                                    !hiddenBar
                                        ? <View className='all-category'>
                                            <View className='title-box'>
                                                <Text className='txt'>全部品类</Text>
                                                <View onClick={() => {
                                                    this.setState({
                                                        showAllCates: false
                                                    })
                                                }}><IconFont name='24_guanbi' size={48} color='#121314'/></View>
                                            </View>
                                            <View className='all-item'>
                                                {
                                                    cates.length > 0 && cates.map((item, index) => (
                                                        <View className='item' key={item.id}
                                                              onClick={() => this.onCateSwitch(index, cates && cates[index] ? cates[index].tags : [])}>
                                                            <Image src={item.image} className='img'/>
                                                            <Text className='name'>{item.name}</Text>
                                                        </View>
                                                    ))
                                                }
                                            </View>
                                        </View>
                                        : null
                                }
                            </View>
                            : null
                    }

                    {
                        !hiddenBar
                            ? <View className='top-switch'
                                    style={{
                                        // marginTop: `${deviceInfo.env === "h5" ? 50 : (deviceInfo.menu.height + deviceInfo.statusBarHeight || 0)}px`
                                    }}
                            >
                                <ScrollView scrollX className='switch-scroll'>
                                    <View className='warp' style={`width:${Taro.pxTransform((cates.length + 1) * 128)}`}>
                                        {
                                            cates.length > 0 && cates.map((item, index) => (
                                                <View className={index == switchActive ? 'item active' : 'item'}
                                                      key={item.id}
                                                      onClick={() => this.onCateSwitch(index, cates && cates[index] ? cates[index].tags : [])}>
                                                    <Text className='text'>{item.name}</Text>
                                                    {index == switchActive ? <Image className='icon'
                                                                                    src={require("../../../../source/switchBottom.png")}/> : null}
                                                </View>
                                            ))
                                        }
                                    </View>
                                </ScrollView>
                                <View className='all' onClick={() => this.setState({showAllCates: true})}>
                                    <IconFont name='24_gengduofenlei' size={48} color='#121314'/>
                                </View>
                            </View>
                            : null
                    }
                </View>

                <View className='main' style={{
                    height: otherHeight + "px",
                    // marginTop: (hiddenBar ? topsHeight + deviceInfo.statusBarHeight : 0) + "px"
                }}>
                    <View className='left-menu' id="template_left_menu"
                          style={`height:${otherHeight}px;background:#FFF`}>
                        <ScrollView scrollY className='left-scroll' style={`height:${otherHeight}px;background:#FFF`}>
                            {
                                tags && tags.map((item, index) => (
                                    <View className={switchTagActive == index ? 'item active' : "item"} key={item.id}
                                          onClick={() => {
                                              if (switchTagActive != index) {
                                                  this.setState({
                                                      switchTagActive: index,
                                                      tagData: {}
                                                  }, () => {
                                                      this.getTagContext(item)
                                                  });
                                              }
                                          }}>
                                        <Text className='txt'>{item.name}</Text>
                                    </View>
                                ))
                            }
                        </ScrollView>
                    </View>
                    <ScrollView scrollY className='right-scroll' style={`width:${mainRightWidth}px;`}
                                onScrollToLower={this.onScrollToLower}>
                        {/* min-height:${colHeight[`${tplid}-${tagid}`]?Math.max(...colHeight[`${tplid}-${tagid}`]):0}px */}
                        <View style={`width:${mainRightWidth}px;height:${Taro.pxTransform(32)};`}/>
                        <View className='warp'
                              style={`width:${mainRightWidth}px;box-sizing:border-box;position: relative;min-height:${colHeight[`${tplid}-${tagid}`] ? Math.max(...colHeight[`${tplid}-${tagid}`]) : 0}px;`}>

                            {
                                tpl_type == "photo" && loadStatus != LoadMoreEnum.loading && tagList.length > 0 ?
                                    <View className='print-box'
                                          style={`width:${(mainRightWidth - (14 * 3)) / 2}px;height:${(mainRightWidth - (14 * 3)) / 2}px;position: absolute;top:0;left:14px`}
                                          onClick={() => {
                                              if (!userStore.isLogin) {
                                                  userStore.showLoginModal = true;
                                                  return
                                              }
                                              Taro.navigateTo({
                                                  url: `/pages/editor/pages/printing/index?id=34`
                                              })
                                          }}>
                                        <View className='print-warp'
                                              style={`width:${(mainRightWidth - (14 * 3)) / 2}px;height:${(mainRightWidth - (14 * 3)) / 2}px;`}>
                                            <Image src={require("../../../../source/editor-print.png")}
                                                   className='print'/>
                                            <Text className='print-txt'>直接冲印</Text>
                                        </View>
                                        <View className='nook'>
                                            <Text className='ntxt'>快速</Text>
                                        </View>
                                    </View> : null
                            }
                            {
                                tagList.map((item) => {
                                    return <View className='pic-box'
                                                 style={`width:${item.width}px;height:${item.height}px;position: absolute;top:${item.top}px;left:${item.left}px`}
                                                 onClick={() => this.onTagItemClick(item, cates[switchActive].tpl_category_id, tpl_type)}
                                                 key={item.id}>
                                        {
                                            tpl_type == "phone" ? <View className='ke'
                                                                        style={`width:${item.width}px;height:${item.height}px;`}>
                                                <Image src={ossUrl(item.thumb_image, 1)} className='item'
                                                       style={`width:${item.width}px;height:${item.height}px;border-radius: ${Taro.pxTransform(48)};`}
                                                       mode='scaleToFill'/>
                                                <Image src={require('../../../../source/ke.png')} className='phone'
                                                       style={`width:${item.width}px;height:${item.height}px;`}
                                                       mode='scaleToFill'/>
                                            </View> : <Image src={ossUrl(item.thumb_image, 1)} className='item'
                                                             style={`width:${item.width}px;height:${item.height}px;border-radius: ${Taro.pxTransform(16)};overflow: hidden;`}/>
                                        }
                                    </View>
                                })
                            }

                        </View>
                        <LoadMore status={loadStatus}/>
                    </ScrollView>
                </View>
            </View>
        )
    }
}
