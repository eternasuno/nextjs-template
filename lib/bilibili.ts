export type User = {
    id: string;
    name: string;
    image: string;
    description: string;
};

export type Submission = {
    id: string;
    type: 'video' | 'audio';
    title: string;
    author: string;
    date: Date;
    duration: number;
    image: string;
    url: string;
    description: string;
};

export const getUserInfo = async (id: string) => {
    const url = new URL('https://api.bilibili.com/x/space/acc/info');
    url.searchParams.append('mid', id);

    const data = await get(url);

    return {
        id: data.mid,
        name: data.name,
        image: data.face,
        description: data.sign,
    } as User;
};

export const getUserSubmissionList = async(id:string, limit:number) => {
    const [videoList, audioList] = await Promise.all([
        getUserVideoList(id, limit), 
        getUserAudioList(id, limit),
    ]);

    return [...videoList, ...audioList]
        .sort((a, b) => b.date - a.date)
        .splice(0, limit);
};

export const getVideoPath = async (id: string) => {
    const cid = await getVideoCid(id);

    const url = new URL('https://api.bilibili.com/x/player/playurl');
    url.searchParams.append('bvid', id);
    url.searchParams.append('cid', cid);
    url.searchParams.append('fnval', '16');

    const {
        dash: { audio },
    } = await get(url);

    return audio[0].baseUrl as string;
};

export const getAudioPath = async (id: string) => {
    const url = new URL(
        'https://www.bilibili.com/audio/music-service-c/web/url',
    );
    url.searchParams.append('sid', id);

    const { cdns } = await get(url);

    return cdns[0] as string;
};

const getUserVideoList = async (id: string, limit: number) => {
    const url = new URL('https://api.bilibili.com/x/space/wbi/arc/search');
    url.searchParams.append('mid', id);
    url.searchParams.append('ps', String(limit));

    const {
        list: { vlist },
    } = await get(url);

    return vlist
        ? (vlist as any[]).map((video) => ({
            id: video.bvid,
            type: 'video',
            title: video.title,
            author: video.author,
            date: new Date(video.created * 1000),
            duration: convertDuration(video.length),
            image: video.pic,
            url: `https://www.bilibili.com/video/${video.bvid}`,
            description: video.description,
        } as Submission))
        : [];
};

const getUserAudioList = async (id: string, limit: number) => {
    const url = new URL(
        'https://api.bilibili.com/audio/music-service/web/song/upper',
    );
    url.searchParams.append('uid', id);
    url.searchParams.append('pn', '1');
    url.searchParams.append('ps', String(limit));
    url.searchParams.append('order', '1');

    const { data } = await get(url);

    return data
        ? (data as any[]).map((audio) => ({
            id: audio.id,
            type: 'audio',
            title: audio.title,
            author: audio.uname,
            date: new Date(audio.passtime * 1000),
            duration: audio.duration,
            image: audio.cover,
            url: `https://www.bilibili.com/audio/au${audio.id}`,
            description: audio.lyric,
        } as Submission))
        : [];
};

const getVideoCid = async (id: string) => {
    const url = new URL('https://api.bilibili.com/x/web-interface/view');
    url.searchParams.append('bvid', id);

    const { cid } = await get(url);
    return cid;
};

const get = async (url: URL) => {
    const response = await fetch(url.toString(), {
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15',
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

const convertDuration = (length: string) => {
    const [hours, minutes, seconds] = length.split(':');
    return (
        (parseInt(hours) || 0) * 3600 +
        (parseInt(minutes) || 0) * 60 +
        parseInt(seconds)
    );
};
