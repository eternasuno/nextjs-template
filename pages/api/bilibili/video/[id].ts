import { getVideoPath } from '@/lib/bilibili';
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
        return await getVideoPath(id!);
    },
    on: {
        proxyReq: (proxyReq, req, res) => {
            proxyReq.removeHeader('User-Agent');
        },
        proxyRes: (proxyRes) => {
            proxyRes.headers['content-type'] = 'audio/mp3';
        },
        error: (err, _, res) => {
            console.warn(err);
            (res as NextApiResponse).status(500).send('Internal Server Error');
        },
    },
});

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    proxyMiddleware(req, res, (result: unknown) => {
        if (result instanceof Error) {
            throw result;
        }
    });
};

export default handle;
