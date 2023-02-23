import { getUserInfo, getUserVideoList } from "@/lib/bilibili";
import { GetServerSideProps } from "next";
import { FeedOptions, Item, Podcast } from "podcast";

const User = () => {};

const convertDuration = (length: string) => {
    const [minutes, seconds] = length.split(":");
    return parseInt(minutes) * 60 + parseInt(seconds);
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    const host = req.headers.host;
    const mid = req.url?.split("/").at(-1)!;

    try {
        const [user, videoList] = await Promise.all([
            getUserInfo(mid),
            getUserVideoList(mid),
        ]);

        const feedOptions = {
            title: user.name,
            description: user.sign,
            siteUrl: `https://space.bilibili.com/${mid}`,
            imageUrl: user.face,
            pubDate: new Date(),
            itunesAuthor: user.name,
            itunesImage: user.face,
            itunesOwner: {
                name: user.name,
            },
        } as FeedOptions;

        const items = videoList.map((video: any) => {
            return {
                title: video.title,
                description: video.description,
                url: `https://www.bilibili.com/video/${video.bvid}`,
                guid: video.bvid,
                author: video.author,
                date: new Date(video.created),
                enclosure: {
                    url: `https://${host}/api/audio/bilibili/${video.bvid}`,
                    type: "video/mp4",
                },
                itunesAuthor: video.author,
                itunesDuration: convertDuration(video.length),
                itunesImage: video.pic,
                itunesTitle: video.title,
            } as Item;
        });

        const podcast = new Podcast(feedOptions, items);

        res.setHeader("Content-Type", "text/xml");
        res.write(podcast.buildXml());
        res.end();
    } catch (error: any) {
        res.statusCode = 500;
        res.statusMessage = error.message;
    }

    return {
        props: {},
    };
};

export default User;
