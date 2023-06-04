import tryGet from './cache';
import { md5 } from './crypto';

export type User = {
    id: string;
    name: string;
    image: string;
    description: string;
};

export type SubVideo = {
    id: string;
    index: number;
    name: string;
    duration: number;
};

export type Video = {
    id: string;
    name: string;
    author: string;
    image: string;
    pubDate: Date;
    description: string;
    subVideoList: SubVideo[];
};

export const getUserInfo = async (id: string) => {
    const url = new URL('https://api.bilibili.com/x/space/wbi/acc/info');
    url.searchParams.append('mid', id);

    const data = await getApi(url);

    return {
        id: data.mid,
        name: data.name,
        image: data.face,
        description: data.sign,
    } as User;
};

export const getSubBVIdList = async (id: string, limit: number) => {
    const url = new URL('https://api.bilibili.com/x/space/wbi/arc/search');
    url.searchParams.append('mid', id);
    url.searchParams.append('ps', String(limit));

    const {
        list: { vlist },
    } = await getApi(url);

    if (!Array.isArray(vlist)) {
        return [] as string[];
    }

    return vlist.map((v) => v.bvid as string);
};

export const getVideoInfo = async (id: string) => {
    const url = new URL('https://api.bilibili.com/x/web-interface/view');
    url.searchParams.append('bvid', id);

    const data = await getApi(url);

    const subVideoList = (data.pages as any[])
        .map((item) => {
            return {
                id: item.cid,
                index: item.page,
                name: item.part,
                duration: item.duration,
            } as SubVideo;
        })
        .reverse();

    return {
        id,
        name: data.title,
        author: data.owner.name,
        image: data.pic,
        pubDate: new Date(parseInt(data.pubdate) * 1000),
        description: data.desc,
        subVideoList,
    } as Video;
};

export const getVideoPath = async (bvid: string, cid: string) => {
    const url = new URL('https://api.bilibili.com/x/player/playurl');
    url.searchParams.append('bvid', bvid);
    url.searchParams.append('cid', cid);
    url.searchParams.append('fnval', '16');

    const {
        dash: { audio },
    } = await getApi(url);

    return audio[0].baseUrl as string;
};

const getApi = async (url: URL) => {
    const signedUrl = await signSearch(url);
    const { code, message, data } = await getJson(signedUrl);
    if (code !== 0) {
        throw new Error(message);
    }

    return data;
};

const signSearch = async (url: URL) => {
    const salt = await tryGet('bilibili_wbi_salt', getWbiSalt, 86400, false);

    url.searchParams.append('wts', String(Math.round(Date.now() / 1000)));
    url.searchParams.sort();
    const search = url.searchParams
        .toString()
        .replace(/(?:%21|%27|%28|%29|\*)/g, '');

    url.search = `${search}&w_rid=${md5(`${search}${salt}`)}`;

    return url;
};

const getWbiSalt = async () => {
    const [originalSalt, mixinKeyEncTab] = await Promise.all([
        (async (): Promise<string> => {
            const {
                data: {
                    wbi_img: { img_url, sub_url },
                },
            } = await getJson('https://api.bilibili.com/x/web-interface/nav');
            return img_url.split(/[./]/).at(-2) + sub_url.split(/[./]/).at(-2);
        })(),
        getMixinKeyEncTab(),
    ]);

    return mixinKeyEncTab
        .splice(0, 32)
        .map((index) => originalSalt.charAt(index))
        .join('');
};

const getMixinKeyEncTab = async () => {
    const jsUrl = await getText(
        'https://space.bilibili.com/1',
        /[^"]*9.space[^"]*/
    );
    const array = await getText(`https:${jsUrl}`, /\[(?:\d+,){63}\d+\]/);

    return array ? (JSON.parse(array) as Array<number>) : [];
};

const getJson = async (url: URL | string) => (await get(url)).json();

const getText = async (url: URL | string, reg: RegExp) => {
    const text = await (await get(url)).text();
    return text.match(reg)?.at(0);
};

export const get = async (url: URL | string) => {
    const response = await fetch(url, {
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15',
            Referer: 'https://www.bilibili.com',
        },
    });
    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response;
};
