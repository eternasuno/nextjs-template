import { getSeasonInfo, getUserInfo, getVideoInfo } from '@/lib/bilibili';
import cache from '@/lib/cache';
import config from '@/lib/config';
import { withPodcast } from '@/lib/middlewares';

export const GET = withPodcast<{ params: { uid: string; sid: string } }>(
    async (request, { params: { uid, sid } }) => {
        const { protocol, host, searchParams } = new URL(request.url);
        const domain = `${protocol}//${host}`;
        const limit = Number(searchParams.get('limit')) || config.feed.items_limit;

        const [user, season] = await Promise.all([
            cache.wrap(
                `bilibili_user_${uid}`,
                async () => getUserInfo(uid),
                config.cache.lasting_expire
            ),
            getSeasonInfo(sid, limit),
        ]);

        const videoList = await Promise.all(
            season.bvidList.map(async (bvid) =>
                cache.wrap(
                    `bilibili_video_${bvid}`,
                    async () => getVideoInfo(bvid),
                    config.cache.lasting_expire
                )
            )
        );

        return {
            author: user.name,
            description: season.description || user.description,
            image: season.image || user.image,
            items: videoList.map((video) => {
                const { id: bvid, name, description, pubDate, image } = video;
                const { id: cid, duration } = video.subVideoList[0];

                return {
                    description,
                    duration,
                    enclosure_type: 'video/mp4',
                    enclosure_url: `${domain}/bilibili/sounds/${bvid}/${cid}`,
                    image,
                    pubDate,
                    title: name,
                    url: `https://www.bilibili.com/video/${bvid}`,
                };
            }),
            title: season.name,
            url: `https://space.bilibili.com/${uid}/channel/collectiondetail?sid=${sid}`,
        };
    }
);
