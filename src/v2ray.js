import * as utils from './utils.js';

export async function getv2ray_config(e) {
    const apiurl = utils.buildApiUrl(e.urls.join(','), e.sub, 'base64');
    const res = await utils.fetchResponse(apiurl, e.userAgent);
    if (res.data !== undefined && res.data !== null && res.data !== '') {
        return {
            status: res.status,
            headers: res.headers,
            data: res.data,
        };
    } else {
        throw new Error('获取订阅数据失败，请检查订阅链接是否有效');
    }
}
