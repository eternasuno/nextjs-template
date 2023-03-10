import { getAudioPath } from '@/lib/bilibili';
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
        return await getAudioPath(id!);
    },
    on: {
        proxyRes: (proxyRes) => {
            proxyRes.headers['content-type'] = 'audio/mpeg';
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
