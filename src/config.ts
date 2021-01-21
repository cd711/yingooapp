const testApiUrl = "https://test.playbox.yingoo.com/api/";
let productionUrl = "https://m.playbox.yingoo.com/api/";
if (process.env.TARO_ENV == "h5") {
    // @ts-ignore
    // eslint-disable-next-line no-undef
    productionUrl = common_config.url ? common_config.url : productionUrl;
    // 11111111
}
const config = {
    apiUrl: process.env.NODE_ENV !== 'production' ? testApiUrl : productionUrl,
    // apiUrl:"https://yin.gaozhenzhen.com/api/",
    // 静态资源地址
    sourceUrl: "https://cdn.playbox.yingoo.com/",
    // 编辑器本地地址
    editorUrl: process.env.NODE_ENV !== 'production' ? "https://test.playbox.yingoo.com" : "https://m.playbox.yingoo.com",
    // editorUrl:"https://yin.gaozhenzhen.com",
    // 本地H5地址
    h5Url: process.env.NODE_ENV !== 'production' ? "https://test.playbox.yingoo.com" : "https://m.playbox.yingoo.com",
    // h5Url:"https://yin.gaozhenzhen.com",
    weappUrl: process.env.NODE_ENV !== 'production' ? "https://test.playbox.yingoo.com" : "https://m.playbox.yingoo.com",
    // weappUrl:"https://yin.gaozhenzhen.com"
};

export default config;
