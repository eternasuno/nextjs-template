import { getVideoInfo } from '@/lib/bilibili';
import config from '@/lib/config';
import { withPodcast } from '@/lib/middlewares';

export const GET = withPodcast<{ params: { bvid: string } }>(
    async (request, { params: { bvid } }) => {
        const { protocol, host, searchParams } = new URL(request.url);
        const domain = `${protocol}//${host}`;
        const limit = Number(searchParams.get('limit')) || config.feed.items_limit;

        const video = await getVideoInfo(bvid);

        const {
            name: videoName,
            author,
            description,
            pubDate,
            image,
            subVideoList,
        } = video;

        return {
            author,
            description,
            image,
            items: subVideoList.slice(0, limit).map((sub) => {
                const { id: cid, index, name, duration } = sub;

                return {
                    description,
                    duration,
                    enclosure_type: 'video/mp4',
                    enclosure_url: `${domain}/bilibili/sounds/${bvid}/${cid}`,
                    image,
                    pubDate,
                    title: name,
                    url: `https://www.bilibili.com/video/${bvid}?p=${index}`,
                };
            }),
            title: videoName,
            url: `https://www.bilibili.com/video/${bvid}`,
        };
    }
);
