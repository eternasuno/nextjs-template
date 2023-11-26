import cache from './cache';
import config from './config';
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

export type Season = {
    id: string;
    name: string;
    image: string;
    description: string;
    bvidList: string[];
};

export const getUserInfo = async (id: string) => {
    const url = new URL('https://api.bilibili.com/x/space/wbi/acc/info');
    url.searchParams.append('mid', id);

    const data = await getApi(url);

    return {
        description: data.sign,
        id: data.mid,
        image: data.face,
        name: data.name,
    } as User;
};

export const getSubBVIdList = async (
    id: string,
    limit: number,
    keyword?: string
) => {
    const url = new URL('https://api.bilibili.com/x/space/wbi/arc/search');
    url.searchParams.append('mid', id);
    url.searchParams.append('ps', String(limit));
    url.searchParams.append('dm_cover_img_str', 'bm8gd2ViZ2');
    keyword && url.searchParams.append('keyword', keyword);

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
                duration: item.duration,
                id: item.cid,
                index: item.page,
                name: item.part,
            } as SubVideo;
        })
        .reverse();

    return {
        author: data.owner.name,
        description: data.desc,
        id,
        image: data.pic,
        name: data.title,
        pubDate: new Date(parseInt(data.pubdate) * 1000),
        subVideoList,
    } as Video;
};

export const getSeasonInfo = async (id: string, limit: number) => {
    const url = new URL(
        'https://api.bilibili.com/x/polymer/space/seasons_archives_list'
    );
    url.searchParams.append('mid', '1');
    url.searchParams.append('season_id', id);
    url.searchParams.append('page_num', '1');
    url.searchParams.append('page_size', '1');
    const { meta } = await getApi(url);

    const bvidList =
        meta.total > 0
            ? (await getSeasonVideoList(id, meta.total))
                  .sort((a, b) => b.pubdate - a.pubdate)
                  .slice(0, limit)
                  .map((archive) => archive.bvid)
            : [];

    return {
        bvidList,
        description: meta?.description,
        id,
        image: meta?.cover,
        name: meta?.name,
    } as Season;
};

export const getVideoPath = async (bvid: string, cid: string) => {
    const url = new URL('https://api.bilibili.com/x/player/playurl');
    url.searchParams.append('bvid', bvid);
    url.searchParams.append('cid', cid);
    url.searchParams.append('platform', 'html5');

    const {
        durl: [{ url: path }],
    } = await getApi(url);

    return path as string;
};

const getSeasonVideoList = async (id: string, total: number) =>
    (
        await Promise.all(
            Array.from(
                { length: Math.ceil(total / 99) },
                (_, index) => index + 1
            ).map(async (page) => {
                const url = new URL(
                    'https://api.bilibili.com/x/polymer/space/seasons_archives_list'
                );
                url.searchParams.append('mid', '1');
                url.searchParams.append('season_id', id);
                url.searchParams.append('page_num', String(page));
                url.searchParams.append('page_size', '99');

                const { archives } = await getApi(url);

                return archives as Array<{ bvid: string; pubdate: number }>;
            })
        )
    ).reduce((acc, item) => acc.concat(item), []);

const getApi = async (url: URL) => {
    const signedUrl = await signSearch(url);
    const { code, message, data } = await (await get(signedUrl)).json();
    if (code !== 0) {
        throw new Error(message);
    }

    return data;
};

const signSearch = async (url: URL) => {
    url.searchParams.append('wts', String(Math.round(Date.now() / 1000)));
    url.searchParams.sort();

    const search = url.searchParams
        .toString()
        .replace(/(?:%21|%27|%28|%29|\*)/g, '');

    const salt = await cache.wrap(
        'bilibili_wbi_salt',
        getWbiSalt,
        config.cache.lasting_expire
    );
    url.search = `${search}&w_rid=${md5(`${search}${salt}`)}`;

    return url;
};

const getWbiSalt = async () => {
    const [originalSalt, mixinKeyEncTab] = await Promise.all([
        getOriginalSalt(),
        getMixinKeyEncTab(),
    ]);

    return mixinKeyEncTab
        .splice(0, 32)
        .map((index) => originalSalt.charAt(index))
        .join('');
};

const getOriginalSalt = async (): Promise<string> => {
    const {
        data: {
            wbi_img: { img_url, sub_url },
        },
    } = await (await get('https://api.bilibili.com/x/web-interface/nav')).json();

    return img_url.split(/[./]/).at(-2) + sub_url.split(/[./]/).at(-2);
};

const getMixinKeyEncTab = async () => {
    const jsUrl = (await (await get('https://space.bilibili.com/1')).text())
        .match(/[^"]*9.space[^"]*/)
        ?.at(0);

    const array = (await (await get(`https:${jsUrl}`)).text())
        .match(/\[(?:\d+,){63}\d+\]/)
        ?.at(0);

    return array ? (JSON.parse(array) as Array<number>) : [];
};

export const get = async (url: URL | string) => {
    const response = await fetch(url, {
        headers: {
            Referer: 'https://www.bilibili.com',
            'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15',
        },
    });
    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response;
};
