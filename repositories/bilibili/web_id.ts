import { tryGetLong } from '@/utils/try-get.ts';

const getWebId = tryGetLong(
  async () => {
    const response = await fetch('https://space.bilibili.com/1/video');
    const html = await response.text();
    const matched = html.match(
      /<script id="__RENDER_DATA__" type="application\/json">(.*)<\/script>/,
    );
    if (!matched) {
      return '';
    }

    const renderData = JSON.parse(decodeURIComponent(matched[1]));

    return renderData['access_id'] as string;
  },
  ['bilibili', 'web_id'],
  false,
);

export const withWebId = async (url: URL | string) => {
  const withWebIdURL = new URL(url);

  const webId = await getWebId();
  withWebIdURL.searchParams.append('w_webid', webId);

  return withWebIdURL;
};
