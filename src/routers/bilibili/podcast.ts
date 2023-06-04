import Router from '@koa/router';
import {
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
            86400
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
                86400
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

export default router;
