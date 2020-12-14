const config = {
    apiUrl: process.env.TARO_ENV === 'h5' ? "/api/" : "http://test.playbox.yingoo.com/api/",
    // 静态资源地址
    sourceUrl: "",
    // 编辑器本地地址
    editorUrl: "https://m.playbox.yingoo.com",
    // 本地H5地址
    h5Url: "https://m.playbox.yingoo.com",
    weappUrl: "m.playbox.yingoo.com",
};

export default config;
