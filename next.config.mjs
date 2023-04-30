/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/bilibili/users/:uid/videos',
        destination: '/api/bilibili/podcast/users/:uid/videos',
      },
      {
        source: '/bilibili/users/:uid/audios',
        destination: '/api/bilibili/podcast/users/:uid/audios',
      },
      {
        source: '/bilibili/users/:uid/seasons/:sid',
        destination: '/api/bilibili/podcast/users/:uid/seasons/:sid',
      },
      {
        source: '/bilibili/videos/:bvid',
        destination: '/bilibili/podcast/videos/:bvid',
      },
      {
        source: '/bilibili/sounds/audios/:id',
        destination: '/api/bilibili/sounds/audios/:id',
      },
      {
        source: '/bilibili/sounds/videos/:bvid/:cid',
        destination: '/api/bilibili/sounds/videos/:bvid/:cid',
      },
    ];
  },
};

export default nextConfig;
