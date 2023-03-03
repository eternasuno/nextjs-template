import {
    getUserAudioList,
    getUserInfo,
    getUserVideoList,
} from "@/lib/bilibili";
import { GetServerSideProps } from "next";
import { FeedOptions, Item, Podcast } from "podcast";

const User = () => {};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    const host = req.headers.host;
    const mid = req.url?.split("/").at(-1)!;

    try {
        const [user, videoList, audioList] = await Promise.all([
            getUserInfo(mid),
            getUserVideoList(mid, 5),
            getUserAudioList(mid, 5),
        ]);
        console.debug(user);

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

        const videoItems = videoList.map((video) => {
            return {
                title: video.title,
                description: video.description,
                url: `https://www.bilibili.com/video/${video.bvid}`,
                guid: video.bvid,
                author: video.author,
                date: video.created,
                enclosure: {
                    url: `https://${host}/api/bilibili/video/${video.bvid}`,
                    type: "audio/mp3",
                },
                itunesAuthor: video.author,
                itunesDuration: video.length,
                itunesImage: video.pic,
                itunesTitle: video.title,
            } as Item;
        });

        const audioItems = audioList.map((audio) => {
            return {
                title: audio.title,
                url: `https://www.bilibili.com/audio/au${audio.id}`,
                guid: `au${audio.id}`,
                author: audio.uname,
                date: audio.passtime,
                enclosure: {
                    url: `https://${host}/api/bilibili/audio/${audio.id}`,
                    type: "audio/mpeg",
                },
                itunesAuthor: audio.uname,
                itunesDuration: audio.duration,
                itunesImage: audio.cover,
                itunesTitle: audio.title,
            } as Item;
        });

        const podcast = new Podcast(feedOptions, [
            ...videoItems,
            ...audioItems,
        ]);

        res.setHeader("Content-Type", "text/xml");
        res.write(podcast.buildXml());
        res.end();
    } catch (error: any) {
        console.warn(error);
        res.statusCode = 500;
        res.statusMessage = error.message;
    }

    return {
        props: {},
    };
};

export default User;
