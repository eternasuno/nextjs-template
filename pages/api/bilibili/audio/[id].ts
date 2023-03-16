import { getAudioPath } from '@/lib/bilibili';
import { tryGet } from '@/lib/cache';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    externalResolver: true,
  },
};

const proxyMiddleware = createProxyMiddleware<NextApiRequest, NextApiResponse>({
  changeOrigin: true,
  logger: console,
  target: 'https://www.bilibili.com',
  pathRewrite: () => '',
  router: async (req) => {
    const id = req.query.id as string;
    return tryGet(
      `bilibili_audio_path_${id}`,
      async () => await getAudioPath(id!),
      '14400',
      false,
    );
  },
  on: {
    proxyReq: (proxyReq) => {
      proxyReq.setHeader('Referer', 'https://www.bilibili.com');
      proxyReq.setHeader('accept-encoding', 'identity');
      proxyReq.setHeader(
        'user-agent',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15',
      );
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
