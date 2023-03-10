import { getUserSubmissionList,getUserInfo } from "@/lib/bilibili";
import { GetServerSideProps } from "next";
import { FeedOptions, Item, Podcast } from "podcast";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    const host = req.headers.host;
    const id = req.url?.split("/").at(-1)!;

    try {
        const [user, submissionList] = await Promise.all([
            getUserInfo(id),
            getUserSubmissionList(id, 5),
        ]);

        const feedOptions = {
            title: user.name,
            description: user.description,
            siteUrl: `https://space.bilibili.com/${user.id}`,
            imageUrl: user.image,
            pubDate: new Date(),
            itunesAuthor: user.name,
            itunesImage: user.image,
            itunesOwner: {
                name: user.name,
            },
        } as FeedOptions;

        const itemList = submissionList.map((submission) => {
            return {
                title: submissionList.title,
                description: submissionList.description,
                url: submissionList.url,
                guid: submissionList.id,
                author: submissionList.author,
                date: submissionList.date,
                enclosure: {
                    url: `https://${host}/api/bilibili/${submissionList.type}/${submissionList.id}`,
                    type: "audio/mpeg",
                },
                itunesAuthor: submissionList.author,
                itunesDuration: submissionList.duration,
                itunesImage: submissionList.image,
                itunesTitle: submissionList.title,
            } as Item;
        });

        const podcast = new Podcast(feedOptions, itemList);

        res.setHeader("Content-Type", "text/xml");
        res.write(podcast.buildXml());
        res.end();
    } catch (error: any) {
        console.warn(error);
        res.statusCode = 500;
        res.statusMessage = error.message;
        res.end();
    }

    return {
        props: {},
    };
};

const User = () => {};

export default User;
