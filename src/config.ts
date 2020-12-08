const config = {
    apiUrl: process.env.TARO_ENV === 'h5'?"/api/":"http://m.playbox.yingoo.com/api/",
    //静态资源地址
    sourceUrl:""
};

export default config;