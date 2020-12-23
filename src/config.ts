const config = {
    apiUrl: process.env.TARO_ENV === 'h5' ? "https://m.playbox.yingoo.com/api/" : `https://${process.env.NODE_ENV !== 'production' ? "m" : "m"}.playbox.yingoo.com/api/`,
    // 静态资源地址
    sourceUrl: "",
    // 编辑器本地地址
    editorUrl: process.env.NODE_ENV !== 'production' ? "https://m.playbox.yingoo.com" : "https://m.playbox.yingoo.com",
    // 本地H5地址
    h5Url: process.env.NODE_ENV !== 'production' ? "https://m.playbox.yingoo.com" : "https://m.playbox.yingoo.com",
    weappUrl: process.env.NODE_ENV !== 'production' ? "https://m.playbox.yingoo.com" : "https://m.playbox.yingoo.com",
};

export default config;
