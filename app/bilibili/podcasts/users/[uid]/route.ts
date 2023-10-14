import { getUserInfo, getVideoList } from '@/lib/bilibili';
import cache from '@/lib/cache';
import config from '@/lib/config';
import { withPodcast } from '@/lib/middlewares';

export const GET = withPodcast<{ params: { uid: string } }>(
    async (request, { params: { uid } }) => {
        const { protocol, host, searchParams } = new URL(request.url);
        const domain = `${protocol}//${host}`;
        const limit = Number(searchParams.get('limit')) || config.feed.items_limit;

        const [user, videoList] = await Promise.all([
            cache.wrap(
                `bilibili_user_${uid}`,
                async () => getUserInfo(uid),
                config.cache.lasting_expire
            ),
            getVideoList(uid, limit),
        ]);

        const { name, description, image } = user;

        return {
            author: name,
            description,
            image,
            items: videoList.map((video) => {
                const { id: bvid, name, description, pubDate, image } = video;
                const { id: cid, duration } = video.subVideoList[0];

                return {
                    description,
                    duration,
                    enclosure_type: 'audio/mp4',
                    enclosure_url: `${domain}/bilibili/sounds/${bvid}/${cid}`,
                    image,
                    pubDate,
                    title: name,
                    url: `https://www.bilibili.com/video/${bvid}`,
                };
            }),
            title: `${name}的视频投稿`,
            url: `https://space.bilibili.com/${uid}/video`,
        };
    }
);
