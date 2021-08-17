
// let productionUrl = "https://m.playbox.yingoo.com/api/";
const urlPrefix = "https://y.ewaga.com";
let productionUrl = `${urlPrefix}/api/`;
const testApiUrl = productionUrl;
if (process.env.TARO_ENV == "h5") {
    // @ts-ignore
    // eslint-disable-next-line no-undef
    productionUrl = common_config.url ? common_config.url : productionUrl;
}
const config = {
    apiUrl: process.env.NODE_ENV !== 'production' ? productionUrl : productionUrl,
    // apiUrl:"https://yin.gaozhenzhen.com/api/",
    // 静态资源地址
    sourceUrl: "https://palybox-app.oss-cn-chengdu.aliyuncs.com/",
    // 编辑器本地地址
    editorUrl: process.env.NODE_ENV !== 'production' ? urlPrefix : urlPrefix,
    // editorUrl:"https://yin.gaozhenzhen.com",
    // 本地H5地址
    h5Url: process.env.NODE_ENV !== 'production' ? urlPrefix : urlPrefix,
    // h5Url:"https://yin.gaozhenzhen.com",
    weappUrl: process.env.NODE_ENV !== 'production' ? urlPrefix : urlPrefix,
    // weappUrl:"https://yin.gaozhenzhen.com"
};

export default config;
