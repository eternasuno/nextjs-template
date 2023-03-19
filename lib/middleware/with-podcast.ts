import tryGet from '@/lib/cache';
import { buildXml, Feed } from '@/lib/podcast';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

const withPodcast =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const podcast = await tryGet(req.url!, async () => {
        const feed = await handler(req, res);
        return buildXml(feed as Feed);
      });

      res.status(200).setHeader('Content-Type', 'text/xml').send(podcast);
    } catch (error: any) {
      console.warn(error);
      res.status(500).send(error.message);
    }
  };

export default withPodcast;
