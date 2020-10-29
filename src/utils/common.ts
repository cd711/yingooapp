export function ossUrl(url:string,type:number) {
    let u = '';
    switch (type) {
        case 0:
            u = `${url}?x-oss-process=style/s`
            break;
        case 1:
            u = `${url}?x-oss-process=style/m`
            break;
        default:
            u = `${url}?x-oss-process=style/b`
            break;
    }
    return u;
}