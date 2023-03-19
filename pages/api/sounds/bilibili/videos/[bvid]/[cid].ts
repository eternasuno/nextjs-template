import { getVideoPath } from '@/lib/bilibili';
import tryGet from '@/lib/cache';
import { default as appConfig } from '@/lib/config';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    responseLimit: false,
    externalResolver: true,
  },
};

const proxyMiddleware = createProxyMiddleware<NextApiRequest, NextApiResponse>({
  changeOrigin: true,
  logger: console,
  target: 'https://www.bilibili.com',
  pathRewrite: () => '',
  router: async (req) => {
    try {
      const bvid = req.query.bvid as string;
      const cid = req.query.cid as string;

      return tryGet(
        `bilibili_video_path_${bvid}_${cid}`,
        async () => await getVideoPath(bvid, cid),
        appConfig.cache.lastingExpire,
      );
    } catch (error: any) {
      console.warn(error.message);
      return 'https://www.bilibili.com/404';
    }
  },
  on: {
    proxyReq: (proxyReq) => {
      proxyReq.setHeader('Referer', 'https://www.bilibili.com');
      proxyReq.setHeader('user-agent', appConfig.agent);
    },
    proxyRes: (proxyRes) => {
      proxyRes.headers['content-type'] = 'audio/mp4';
    },
    error: (err, _, res) => {
      console.warn(err);
      (res as NextApiResponse).status(500).send('Internal Server Error');
    },
  },
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  proxyMiddleware(req, res, (result: unknown) => {
    if (result instanceof Error) {
      throw result;
    }
  });
};

export default handler;
