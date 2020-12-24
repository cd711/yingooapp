const config = {
    apiUrl: process.env.TARO_ENV === 'h5' ? "/api/" : `https://${process.env.NODE_ENV !== 'production' ? "test" : "m"}.playbox.yingoo.com/api/`,
    // 静态资源地址
    sourceUrl: "",
    // 编辑器本地地址
    editorUrl: process.env.NODE_ENV !== 'production' ? "https://test.playbox.yingoo.com" : "https://test.playbox.yingoo.com",
    // 本地H5地址
    h5Url: process.env.NODE_ENV !== 'production' ? "https://test.playbox.yingoo.com" : "https://test.playbox.yingoo.com",
    weappUrl: process.env.NODE_ENV !== 'production' ? "https://test.playbox.yingoo.com" : "https://test.playbox.yingoo.com",
};

export default config;
