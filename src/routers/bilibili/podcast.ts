import Router from '@koa/router';
import config from '../../config';
import {
    getSeasonInfo,
    getSubBVIdList,
    getUserInfo,
    getVideoInfo,
    User,
    Video,
} from '../../lib/bilibili';
import tryGet from '../../lib/cache';
import { Feed, FeedItem } from '../../lib/podcast';
import buildPodcast from '../../middleware/build-podcast';

const router = new Router();

router.use(buildPodcast());

router.get('/users/:uid/videos', async (ctx) => {
    const {
        params: { uid },
        state: { limit, soundsUrl },
    } = ctx;

    const [user, bvidList] = await Promise.all([
        tryGet<User>(
            `bilibili_user_${uid}`,
            async () => await getUserInfo(uid),
            config.cache.lasting_expire
        ),
        getSubBVIdList(uid, limit),
    ]);

    const videoList = await Promise.all(
        bvidList.map(async (bvid) =>
            tryGet<Video>(
                `bilibili_video_${bvid}`,
                async () => {
                    return getVideoInfo(bvid);
                },
                config.cache.lasting_expire
            )
        )
    );

    const feedItemList = videoList.map((video) => {
        const { id: bvid, name, description, pubDate, image } = video;
        const { id: cid, duration } = video.subVideoList[0];

        return {
            title: name,
            description,
            url: `https://www.bilibili.com/video/${bvid}`,
            pubDate,
            enclosure_url: `${soundsUrl}/videos/${bvid}/${cid}`,
            enclosure_type: 'audio/mp4',
            duration,
            image,
        } as FeedItem;
    });

    const { name, description, image } = user;

    return {
        title: `${name}的视频投稿`,
        author: name,
        description,
        url: `https://space.bilibili.com/${uid}/video`,
        image,
        items: feedItemList,
    } as Feed;
});

router.get('/users/:uid/seasons/:sid/videos', async (ctx) => {
    const {
        params: { uid, sid },
        state: { limit, soundsUrl },
    } = ctx;

    const [user, season] = await Promise.all([
        tryGet<User>(
            `bilibili_user_${uid}`,
            async () => await getUserInfo(uid),
            config.cache.lasting_expire
        ),
        getSeasonInfo(sid, limit),
    ]);

    const videoList = await Promise.all(
        season.bvidList.map(async (bvid) =>
            tryGet<Video>(
                `bilibili_video_${bvid}`,
                async () => {
                    return getVideoInfo(bvid);
                },
                config.cache.lasting_expire
            )
        )
    );

    const feedItemList = videoList.map((video) => {
        const { id: bvid, name, description, pubDate, image } = video;
        const { id: cid, duration } = video.subVideoList[0];

        return {
            title: name,
            description,
            url: `https://www.bilibili.com/video/${bvid}`,
            pubDate,
            enclosure_url: `${soundsUrl}/videos/${bvid}/${cid}`,
            enclosure_type: 'audio/mp4',
            duration,
            image,
        } as FeedItem;
    });

    return {
        title: season.name,
        author: user.name,
        description: season.description || user.description,
        url: `https://space.bilibili.com/${uid}/channel/collectiondetail?sid=${sid}`,
        image: season.image || user.image,
        items: feedItemList,
    } as Feed;
});

router.get('/videos/:bvid', async (ctx) => {
    const {
        params: { bvid },
        state: { limit, soundsUrl },
    } = ctx;

    const video = await tryGet<Video>(
        `bilibili_video_${bvid}`,
        async () => await getVideoInfo(bvid)
    );
    const {
        name: videoName,
        author,
        description,
        pubDate,
        image,
        subVideoList,
    } = video;

    const feedItemList = subVideoList.slice(0, limit).map((sub) => {
        const { id: cid, index, name, duration } = sub;

        return {
            title: name,
            description,
            url: `https://www.bilibili.com/video/${bvid}?p=${index}`,
            pubDate,
            enclosure_url: `${soundsUrl}/videos/${bvid}/${cid}`,
            enclosure_type: 'audio/mp4',
            duration,
            image,
        } as FeedItem;
    });

    return {
        title: videoName,
        author,
        description,
        url: `https://www.bilibili.com/video/${bvid}`,
        image,
        items: feedItemList,
    } as Feed;
});

export default router;
