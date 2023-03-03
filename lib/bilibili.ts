import fetch from "node-fetch";

const get = async (url: URL) => {
    const response = await fetch(url.toString(), {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15",
        },
    });
    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const { code, message, data } = (await response.json()) as any;
    if (code !== 0) {
        throw new Error(message);
    }

    return data;
};

export type User = {
    mid: Number;
    name: string;
    face: string;
    sign: string;
};

export const getUserInfo = async (mid: string) => {
    const url = new URL("https://api.bilibili.com/x/space/acc/info");
    url.searchParams.append("mid", mid);

    return (await get(url)) as User;
};

export type Video = {
    bvid: string;
    cid: Number;
    title: string;
    author: string;
    description: string;
    created: Date;
    length: Number;
    pic: string;
};

export const getUserVideoList = async (mid: string, limit: Number) => {
    const url = new URL("https://api.bilibili.com/x/space/wbi/arc/search");
    url.searchParams.append("mid", mid);
    url.searchParams.append("ps", String(limit));

    const {
        list: { vlist },
    } = await get(url);

    return vlist
        ? (vlist as any[]).map((video) => {
              const { created, length, ...rest } = video;
              return {
                  ...rest,
                  created: new Date(created * 1000),
                  length: convertDuration(length),
              } as Video;
          })
        : [];
};

export type Audio = {
    id: Number;
    title: string;
    uname: string;
    lyric: string;
    passtime: Date;
    duration: Number;
    cover: string;
};

export const getUserAudioList = async (uid: string, limit: Number) => {
    const url = new URL(
        "https://api.bilibili.com/audio/music-service/web/song/upper",
    );
    url.searchParams.append("uid", uid);
    url.searchParams.append("pn", "1");
    url.searchParams.append("ps", String(limit));
    url.searchParams.append("order", "1");

    const { data } = await get(url);

    return data
        ? (data as any[]).map((audio) => {
              const { passtime, ...rest } = audio;
              return {
                  ...rest,
                  passtime: new Date(passtime * 1000),
              };
          })
        : [];
};

export const getVideoPath = async (bvid: string) => {
    const cid = await getVideoCid(bvid);

    const url = new URL("https://api.bilibili.com/x/player/playurl");
    url.searchParams.append("bvid", bvid);
    url.searchParams.append("cid", cid);
    url.searchParams.append("fnval", "16");

    const {
        dash: { audio },
    } = await get(url);

    return audio[0].baseUrl as string;
};

export const getAudioPath = async (sid: string) => {
    const url = new URL(
        "https://www.bilibili.com/audio/music-service-c/web/url",
    );
    url.searchParams.append("sid", sid);

    const { cdns } = await get(url);

    return cdns[0] as string;
};

const getVideoCid = async (bvid: string) => {
    const url = new URL("https://api.bilibili.com/x/web-interface/view");
    url.searchParams.append("bvid", bvid);

    const { cid } = await get(url);
    return cid;
};

const convertDuration = (length: string) => {
    const [hours, minutes, seconds] = length.split(":");
    return (
        (parseInt(hours) || 0) * 3600 +
        (parseInt(minutes) || 0) * 60 +
        parseInt(seconds)
    );
};
