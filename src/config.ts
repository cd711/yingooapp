const config = {
    apiUrl: process.env.TARO_ENV === 'h5'?"/api/":"http://test.playbox.yingoo.com/api/",
    // 静态资源地址
    sourceUrl:"",
    // 编辑器本地地址
    editorUrl: "192.168.0.166",
    // 本地H5地址
    h5Url: "192.168.0.126"
};

export default config;
