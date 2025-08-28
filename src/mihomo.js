import * as utils from './utils.js';
export async function getmihomo_config(e) {
    if (!/meta|clash.meta|clash|clashverge|mihomo/i.test(e.userAgent)) {
        throw new Error('不支持的客户端');
    }
    e.urls = utils.splitUrlsAndProxies(e.urls);
    const [Mihomo_Top_Data, Mihomo_Rule_Data, Mihomo_Proxies_Data, Exclude_Package, Exclude_Address] = await Promise.all([
        utils.Top_Data(e.Mihomo_default),
        utils.Rule_Data(e.rule),
        getMihomo_Proxies_Data(e),
        e.exclude_package ? utils.fetchpackExtract() : null,
        e.exclude_address ? utils.fetchipExtract() : null,
    ]);
    if (!Mihomo_Proxies_Data?.data?.proxies || Mihomo_Proxies_Data?.data?.proxies?.length === 0) throw new Error('节点为空');
    if (Exclude_Package) Mihomo_Rule_Data.data['exclude-package'] = Exclude_Package;
    if (Exclude_Address) Mihomo_Rule_Data.data['route-exclude-address'] = Exclude_Address;
    Mihomo_Rule_Data.data.proxies = [...(Mihomo_Rule_Data?.data?.proxies || []), ...Mihomo_Proxies_Data?.data?.proxies];
    Mihomo_Rule_Data.data['proxy-groups'] = getMihomo_Proxies_Grouping(Mihomo_Proxies_Data.data, Mihomo_Rule_Data.data);
    Mihomo_Rule_Data.data['proxy-providers'] = Mihomo_Proxies_Data?.data?.providers;
    applyTemplate(Mihomo_Top_Data.data, Mihomo_Rule_Data.data, e);
    return {
        status: Mihomo_Proxies_Data.status,
        headers: Mihomo_Proxies_Data.headers,
        data: JSON.stringify(Mihomo_Top_Data.data, null, 4),
    };
}
/**
 * 随机从多个订阅 URL 中获取其响应头中的 subscription-userinfo 信息
 * 如果只有一个 URL，直接返回其 subscription-userinfo
 */
export async function getMihomo_Proxies_Data(e) {
    let res;
    if (e.urls.length === 1) {
        res = await utils.fetchResponse(e.urls[0], e.userAgent);
        if (res?.data?.proxies && Array.isArray(res?.data?.proxies) && res?.data?.proxies?.length > 0) {
            res.data.proxies.forEach((p) => {
                if (e.udp) p.udp = true;
            });
            return {
                status: res.status,
                headers: res.headers,
                data: {
                    ...res.data,
                    providers: {},
                },
            };
        } else {
            const apiurl = utils.buildApiUrl(e.urls[0], e.sub, 'clash');
            res = await utils.fetchResponse(apiurl, e.userAgent);
            if (res?.data?.proxies && Array.isArray(res?.data?.proxies) && res?.data?.proxies?.length > 0) {
                res.data.proxies.forEach((p) => {
                    if (e.udp) p.udp = true;
                });
                return {
                    status: res.status,
                    headers: res.headers,
                    data: {
                        ...res.data,
                        providers: {},
                    },
                };
            }
        }
    } else {
        const data = {
            proxies: [],
            providers: {},
        };
        const hesList = [];
        for (let i = 0; i < e.urls?.length; i++) {
            let res = await utils.fetchResponse(e.urls[i], e.userAgent);
            if (res?.data && Array.isArray(res?.data?.proxies)) {
                res.data.proxies.forEach((p) => {
                    p.name = `${p.name} [${i + 1}]`;
                    if (e.udp) p.udp = true;
                });
                hesList.push({
                    status: res.status,
                    headers: res.headers,
                });
                data.proxies.push(...res.data.proxies);
            } else {
                const apiurl = utils.buildApiUrl(e.urls[i], e.sub, 'clash');
                res = await utils.fetchResponse(apiurl, e.userAgent);
                if (res?.data?.proxies && Array.isArray(res?.data?.proxies)) {
                    res.data.proxies.forEach((p) => {
                        p.name = `${p.name} [${i + 1}]`;
                        if (e.udp) p.udp = true;
                    });
                    hesList.push({
                        status: res.status,
                        headers: res.headers,
                    });
                    data.proxies.push(...res.data.proxies);
                }
            }
        }
        const randomIndex = Math.floor(Math.random() * hesList.length);
        const hes = hesList[randomIndex];
        return {
            status: hes.status,
            headers: hes.headers,
            data: data,
        };
    }
}
/**
 * 将模板中的 proxies、proxy-groups、rules 等字段合并到目标配置对象
 * @param {Object} target - 目标配置对象（基础配置）
 * @param {Object} template - 模板配置对象
 */
export function applyTemplate(top, rule, e) {
    if (top.tun) {
        if (e.exclude_address && rule['route-exclude-address']) {
            top.tun['route-address'] = ['0.0.0.0/1', '128.0.0.0/1', '::/1', '8000::/1'];
            top.tun['route-exclude-address'] = rule['route-exclude-address'] || [];
        }
        if (e.exclude_package && rule['exclude-package']) {
            top.tun['exclude-package'] = rule['exclude-package'] || [];
        }
    }
    top['proxy-providers'] = rule['proxy-providers'] || {};
    top.proxies = rule.proxies || [];
    top['proxy-groups'] = rule['proxy-groups'] || [];
    top.rules = rule.rules || [];
    top['sub-rules'] = rule['sub-rules'] || {};
    top['rule-providers'] = { ...(top['rule-providers'] || {}), ...(rule['rule-providers'] || {}) };
}

/**
 * 获取 Mihomo 代理分组信息
 * @param {Array} proxies - 代理列表
 * @param {Array} groups - 策略组
 * @returns {Object} 分组信息
 */
export function getMihomo_Proxies_Grouping(proxies, groups) {
    const deletedGroups = []; // 用于记录已删除的组名
    const updatedGroups = groups['proxy-groups'].filter((group) => {
        let matchFound = false;
        // 确保 filter 存在并且是一个字符串
        let filter = group.filter;
        if (typeof filter !== 'string') {
            return true; // 保留没有 filter 的组
        }

        // 移除所有 (?i)，但保留后续内容
        const hasIgnoreCase = /\(\?i\)/i.test(filter);
        const cleanedFilter = filter.replace(/\(\?i\)/gi, '');

        let regex;
        try {
            regex = new RegExp(cleanedFilter, hasIgnoreCase ? 'i' : '');
        } catch (e) {
            console.warn(`无效的正则表达式: ${filter}`, e);
            return true; // 遇到错误时保留该组
        }

        // 遍历每个代理，检查是否与当前组的正则匹配
        for (let proxy of proxies.proxies) {
            if (regex.test(proxy.name)) {
                matchFound = true;
                break;
            }
        }

        // 如果没有匹配，记录删除的组并返回 false (删除该组)
        if (!matchFound && (!group.proxies || group.proxies.length === 0)) {
            deletedGroups.push(group.name);
            return false;
        }

        return true;
    });

    // 遍历所有策略组，删除 deletedGroups 中的代理
    updatedGroups.forEach((group) => {
        if (group.proxies) {
            group.proxies = group.proxies.filter((proxyName) => {
                // 只删除那些在 deletedGroups 中的代理
                return !deletedGroups.some((deletedGroup) => {
                    return deletedGroup.includes(proxyName); // 检查 deletedGroups 中是否包含该代理名称
                });
            });
        }
    });

    return updatedGroups;
}
