// import fetch from 'node-fetch';
import YAML from 'yaml';
export const backimg = 'https://t.alcy.cc/ycy';
export const subapi = 'https://sub-stort-nodejs.pages.dev';
export const mihomo_top = 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/Config/Mihomo_lite.yaml';
export const singbox_1_11 = 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/refs/heads/main/Config/singbox_1.11.X.json';
export const singbox_1_12 = 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/refs/heads/main/Config/singbox-1.12.X.json';
export const singbox_1_12_alpha = 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/refs/heads/main/Config/singbox-1.12.X.alpha.json';
export const beiantext = base64DecodeUtf8('6JCMSUNQ5aSHMjAyNTAwMDHlj7c=');
export const beiandizi = atob('aHR0cHM6Ly90Lm1lL01hcmlzYV9rcmlzdGk=');
// 实现base64解码UTF-8字符串的函数
export function base64DecodeUtf8(str) {
    const binary = atob(str);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
}
// 实现base64编码UTF-8字符串的函数
export function base64EncodeUtf8(str) {
    const bytes = new TextEncoder('utf-8').encode(str);
    const binary = String.fromCharCode.apply(null, bytes);
    return btoa(binary);
}
// 订阅链接
export function buildApiUrl(rawUrl, BASE_API, ua) {
    const params = new URLSearchParams({
        target: ua,
        url: rawUrl,
        emoji: 'true',
        list: 'true',
        new_name: 'true',
    });
    return `${BASE_API}/sub?${params}`;
}
// 处理请求
export async function fetchResponse(url, userAgent) {
    if (!userAgent) {
        userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3';
    }
    let response;
    try {
        response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': userAgent,
            },
        });
    } catch {
        return true;
    }
    // 直接使用 Object.fromEntries 转换 headers
    const headersObj = Object.fromEntries(response.headers.entries());
    // 替换非法 Content-Disposition 字段Add commentMore actions
    const sanitizedCD = sanitizeContentDisposition(response.headers);
    if (sanitizedCD) {
        headersObj['content-disposition'] = sanitizedCD;
    }
    // 获取响应体的文本内容
    const textData = await response.text();

    let jsonData;
    try {
        jsonData = YAML.parse(textData, { maxAliasCount: -1, merge: true });
    } catch (e) {
        try {
            jsonData = JSON.parse(textData);
        } catch (yamlError) {
            // 若YAML解析也失败，保留原始文本
            jsonData = textData;
        }
    }
    return {
        status: response.status,
        headers: headersObj,
        data: jsonData,
    };
}
// 将订阅链接和代理地址分离
export function splitUrlsAndProxies(urls) {
    const result = [];
    let proxyText = '';

    for (const url of urls) {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            result.push(url);
        } else {
            if (proxyText) {
                proxyText += '|';
            }
            proxyText += url;
        }
    }
    if (proxyText) {
        result.push(proxyText);
    }
    return result;
}
/**
 * 获取模板数据
 * @param {string} top - 模板文件地址
 * @returns {Promise<Object|null>} - 返回模板数据对象，或没有模板时返回 null
 */
export async function Top_Data(top) {
    return await fetchResponse(top);
}
/**
 * 获取基础配置数据，若未提供则使用默认配置地址
 * @param {string} rule - 配置文件地址
 * @returns {Promise<Object>} - 返回配置数据对象
 */
export async function Rule_Data(rule) {
    if (!rule) {
        throw new Error(`缺少规则模板`);
    }
    return await fetchResponse(rule);
}

export function configs(mihomo = '', singbox = '') {
    const data = {
        mihomo: [
            {
                label: '通用',
                options: [
                    {
                        label: '默认(精简版) (仅国内外分流) (与Github同步) ',
                        value: 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/Mihomo_default.yaml',
                    },
                    {
                        label: '默认(精简版) (仅国内外分流) (无去广告) (与Github同步) ',
                        value: 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/Mihomo_default_NoAds.yaml',
                    },
                    {
                        label: '默认(mihomo官方版) (与Github同步) ',
                        value: 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/Mihomo_official.yaml',
                    },
                    {
                        label: '默认(mihomo官方版) (无去广告) (与Github同步) ',
                        value: 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/Mihomo_official_NoAds.yaml',
                    },
                    {
                        label: '默认(ACL4SSR_Online_Full) (与Github同步)',
                        value: 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/Mihomo_ACL4SSR_Online_Full.yaml',
                    },
                    {
                        label: '默认(ACL4SSR_Online_Full) (无去广告Mihomo_ACL4SSR_Online_Full_NoAds.yaml) (与Github同步)',
                        value: 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/Mihomo_ACL4SSR_Online_Full_NoAds.yaml',
                    },
                    {
                        label: '默认(全分组) (与Github同步) ',
                        value: 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/Mihomo_default_full.yaml',
                    },
                    {
                        label: '默认(全分组) (无去广告) (与Github同步) ',
                        value: 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/Mihomo_default_full_NoAds.yaml',
                    },
                ],
            },
            {
                label: 'Mihomo-Party-ACL4SSR',
                options: [
                    {
                        label: 'ACL4SSR_Online_Full 全包重度用户使用(与Github同步)',
                        value: 'https://raw.githubusercontent.com/zhuqq2020/Mihomo-Party-ACL4SSR/main/ACL4SSR_Online_Full.yaml',
                    },
                    {
                        label: 'ACL4SSR_Online_Full_AdblockPlus 全包重度用户使用更多去广告(与Github同步)',
                        value: 'https://raw.githubusercontent.com/zhuqq2020/Mihomo-Party-ACL4SSR/main/ACL4SSR_Online_Full_AdblockPlus.yaml',
                    },
                    {
                        label: 'ACL4SSR_Online_Full_Tiktok 全包重度用户使用抖音全量(与Github同步)',
                        value: 'https://raw.githubusercontent.com/zhuqq2020/Mihomo-Party-ACL4SSR/main/ACL4SSR_Online_Full_Tiktok.yaml',
                    },
                    {
                        label: 'ACL4SSR_Online_Full_WithIcon 全包重度用户使用(与Github同步)(无图标)',
                        value: 'https://raw.githubusercontent.com/zhuqq2020/Mihomo-Party-ACL4SSR/main/ACL4SSR_Online_Full_WithIcon.yaml',
                    },
                    {
                        label: 'ACL4SSR_Online_Mini_MultiMode 专业版自动测速、故障转移、负载均衡(与Github同步)',
                        value: 'https://raw.githubusercontent.com/zhuqq2020/Mihomo-Party-ACL4SSR/main/ACL4SSR_Online_Mini_MultiMode.yaml',
                    },
                    {
                        label: '极简分流规则',
                        value: 'https://raw.githubusercontent.com/zhuqq2020/Mihomo-Party-ACL4SSR/main/极简分流规则.yaml',
                    },
                ],
            },
            {
                label: '网络收集',
                options: [
                    {
                        label: '布丁狗的订阅转换 (与Github同步)',
                        value: 'https://raw.githubusercontent.com/mihomo-party-org/override-hub/main/yaml/%E5%B8%83%E4%B8%81%E7%8B%97%E7%9A%84%E8%AE%A2%E9%98%85%E8%BD%AC%E6%8D%A2.yaml',
                    },
                ],
            },
            {
                label: 'Lanlan13-14',
                options: [
                    {
                        label: 'configfull 全分组版 (与Github同步)',
                        value: 'https://raw.githubusercontent.com/Lanlan13-14/Rules/main/configfull.yaml',
                    },
                    {
                        label: 'configfull_NoAd 全分组版 (与Github同步) (无去广告)',
                        value: 'https://raw.githubusercontent.com/Lanlan13-14/Rules/main/configfull_NoAd.yaml',
                    },
                    {
                        label: 'configfull_NoAd_lite 全分组版 (与Github同步) (无去广告) (精简版)',
                        value: 'https://raw.githubusercontent.com/Lanlan13-14/Rules/main/configfull_NoAd_lite.yaml',
                    },
                    {
                        label: 'configfull_lite 全分组版 (与Github同步) (精简版)',
                        value: 'https://raw.githubusercontent.com/Lanlan13-14/Rules/main/configfull_lite.yaml',
                    },
                ],
            },
        ],
        singbox: [
            {
                label: '通用',
                options: [
                    {
                        label: '默认(精简版) (与Github同步) ',
                        value: 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/singbox_default.yaml',
                    },
                    {
                        label: '默认(mini版) (与Github同步) ',
                        value: 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/singbox_default_mini.yaml',
                    },
                    {
                        label: '默认(全分组) (与Github同步) ',
                        value: 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/singbox_default_full.yaml',
                    },
                    {
                        label: 'DustinWin 全分组版[ads] (与Github同步) ',
                        value: 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/singbox_DustinWin_full.yaml',
                    },
                ],
            },
        ],
    };
    if (mihomo) {
        data.mihomo[0].options.unshift({
            label: '自定义规则',
            value: mihomo,
        });
    }
    if (singbox) {
        data.singbox[0].options.unshift({
            label: '自定义规则',
            value: singbox,
        });
    }
    return JSON.stringify(data);
}
export function modes(sub, userAgent) {
    const modes = {
        mihomo: {
            name: 'Clash (mihomo)',
            placeholder: '请输入clash订阅地址url，支持各种订阅或单节点链接',
            tipText: `
## mihomo 使用提示：

- 支持各种订阅或单节点链接，自动合并生成配置
- 使用 sub-store 后端转换
- 适用于 mihomo 客户端
- 去广告使用 [秋风广告规则](https://github.com/TG-Twilight/AWAvenue-Ads-Rule.git)
- 防止 DNS 泄漏(安全DNS/DoH)
- 屏蔽 WebRTC 泄漏(防止真实IP暴露)
- 内置 分应代理 和 IPCIDR
- 关闭所有覆写功能(不是关闭功能，是关闭覆写)以确保配置正常生效

## 配置信息

**userAgent** ${userAgent}

**转换后端** ${sub}
                `,
            protocolOptions: [
                { value: 'udp', label: '启用 UDP', checked: true },
                { value: 'ep', label: '启用分应用代理(仅Android)' },
                { value: 'ea', label: '启用分IPCIDR代理(ios/macOS/windows/linux 推荐)' },
            ],
        },
        singbox: {
            name: 'Singbox',
            placeholder: '请输入singbox订阅地址url，支持各种订阅或单节点链接',
            tipText: `
## singbox 使用提示：

- 支持各种订阅或单节点链接，自动合并生成配置
- 使用 sub-store 后端转换
- 适用于 sing-box 客户端
- 支持 1.11.x
- 支持 1.12.x
- 支持 1.13.x
- 去广告使用 [秋风广告规则](https://github.com/TG-Twilight/AWAvenue-Ads-Rule.git)
- 防止 DNS 泄漏(安全DNS/DoH)
- 屏蔽 WebRTC 泄漏(防止真实IP暴露)
- 内置 分应代理 和 IPCIDR
- 关闭所有覆写功能(不是关闭功能，是关闭覆写)以确保配置正常生效

## 配置信息

**userAgent** ${userAgent}

**转换后端** ${sub}
                `,
            protocolOptions: [
                { value: 'udp', label: '启用 UDP', checked: true },
                { value: 'udp_frag', label: '启用 UDP 分段' },
                { value: 'tls_frag', label: '启用 tls 分段' },
                { value: 'ep', label: '启用分应用代理(仅Android)' },
                { value: 'ea', label: '启用分IPCIDR代理(ios/macOS/windows/linux 推荐)' },
                { value: 'tailscale', label: '启用 tailscale' },
            ],
        },
        v2ray: {
            name: 'V2Ray',
            placeholder: '请输入V2Ray订阅地址url，支持各种订阅或单节点链接',
            tipText: `
**转换后端** ${sub}
                `,
            protocolOptions: [],
            noTemplate: true, // 添加此标志表示不需要 protocolOptions 和 模板
        },
    };
    return JSON.stringify(modes);
}

export function sanitizeContentDisposition(headers) {
    const contentDisposition = headers.get('Content-Disposition') || headers.get('content-disposition');

    if (!contentDisposition) return null;

    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);

    if (!filenameMatch) return null;

    const originalFilename = filenameMatch[1];

    // 检查是否含中文(或非 ASCII)
    const isNonAscii = /[^\x00-\x7F]/.test(originalFilename);
    if (!isNonAscii) return contentDisposition; // 不含中文，保持原样

    // 使用 fallback ASCII 名 + filename*=UTF-8''xxx 形式替换
    const fallback = 'download.json';
    const encoded = encodeURIComponent(originalFilename);

    return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}
/**
 * 获取应用包名列表
 * @returns {Promise<Object>} - 返回配置数据对象
 */
export async function fetchpackExtract() {
    const processNames = new Set();
    const urls = [
        'https://github.com/mnixry/direct-android-ruleset/raw/refs/heads/rules/@Merged/GAME.mutated.yaml',
        'https://github.com/mnixry/direct-android-ruleset/raw/refs/heads/rules/@Merged/APP.mutated.yaml',
    ];
    const excludeCommentKeywords = ['浏览器'];
    const excludeNames = new Set(['com.android.chrome']);
    for (const url of urls) {
        const res = await fetch(url, {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
            },
        });
        if (!res.ok) {
            console.error(`❌ 请求失败: ${url} - ${res.status} ${res.statusText}`);
            continue;
        }
        const text = await res.text();
        for (const line of text.split('\n')) {
            const match = line.match(/PROCESS-NAME\s*,\s*([^\s,]+)/);
            if (match) {
                const processName = match[1];
                const hasExcludedComment = excludeCommentKeywords.some((keyword) => line.includes(keyword));
                if (!hasExcludedComment && !excludeNames.has(processName)) {
                    processNames.add(processName);
                }
            }
        }
    }
    return [...processNames];
}
/**
 * 获取IPCIDR列表
 * @returns {Promise<Object>} - 返回配置数据对象
 */
export async function fetchipExtract() {
    const urls = ['https://raw.githubusercontent.com/Kwisma/clash-rules/release/cncidr.yaml'];
    const ipcidrs = [];

    for (const url of urls) {
        const res = await fetch(url, {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
            },
        });
        if (!res.ok) {
            console.error(`❌ 请求失败: ${url} - ${res.status} ${res.statusText}`);
            continue;
        }
        const data = await res.text();
        const jsondata = YAML.parse(data, { maxAliasCount: -1, merge: true });

        if (Array.isArray(jsondata.payload)) {
            ipcidrs.push(...jsondata.payload);
        }
    }
    return ipcidrs;
}
