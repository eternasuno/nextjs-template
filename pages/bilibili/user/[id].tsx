import { getUserInfo, getUserVideoList } from '@/lib/bilibili';
import { tryGet } from '@/lib/cache';
import { GetServerSideProps } from 'next';
import { FeedOptions, Item, Podcast } from 'podcast';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const host = req.headers.host;
  const id = req.url?.split('/').at(-1)!;

  try {
    const [user, submissionList] = await Promise.all([
      tryGet(`bilibili_user_${id}`, async () => await getUserInfo(id)),
      tryGet(
        `bilibili_user_videos_${id}`,
        async () => await getUserVideoList(id, 5),
      ),
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
        title: submission.title,
        description: submission.description,
        url: submission.url,
        guid: submission.id,
        author: submission.author,
        date: submission.date,
        enclosure: {
          url: `https://${host}/api/bilibili/${submission.type}/${submission.id}`,
          type: submission.contentType,
        },
        itunesAuthor: submission.author,
        itunesDuration: submission.duration,
        itunesImage: submission.image,
        itunesTitle: submission.title,
      } as Item;
    });

    const podcast = new Podcast(feedOptions, itemList);

    res.setHeader('Content-Type', 'text/xml');
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
