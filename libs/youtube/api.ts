import { tryGet, tryGetLong } from '@/libs/cache.ts';
import { convert } from '@/libs/jmespath.ts';
import type { Channel, Video } from '@/libs/youtube/types.d.ts';
import { Innertube, UniversalCache } from '@LuanRT/youtubei.js';

const yt = await Innertube.create({
  lang: 'zh-Hans-CN',
  cache: new UniversalCache(false),
  generate_session_locally: true,
  retrieve_player: false,
});

export const getChannelInfo = async (
  id: string,
  limit: number,
  keyword?: string,
) => {
  const channel = await yt.getChannel(id);
  const videosChannel = await channel.getVideos();
  const resltChannel = keyword
    ? await videosChannel.search(keyword)
    : videosChannel;

  const query = `{
      id: external_id
      title: title,
      description: description,
      link: url,
      image: thumbnail[0].url
    }`;
  const channelInfo = convert<Channel>(resltChannel.metadata, query);

  const videos = resltChannel.videos.filter(isLive);
  // deno-lint-ignore no-explicit-any
  let nextChannel: any = resltChannel;
  while (videos.length < limit) {
    nextChannel = await nextChannel.getContinuation();
    videos.push(...nextChannel.videos.filter(isLive));
  }

  const videoIds = convert<string[]>(videos.slice(0, limit), '[*].id');

  channelInfo.videos = await Promise.all(
    videoIds.map((id) => getVideoInfo(id)),
  );

  return channelInfo;
};

export const getVideoInfo = tryGetLong(
  async (id: string) => {
    const query = `{
      id: basic_info.id,
      title: basic_info.title,
      description: basic_info.short_description,
      duration: to_number(basic_info.duration),
      image: basic_info.embed.iframe_url,
      pubDate: to_date(streaming_data.formats[0].last_modified)
    }`;
    const info = await yt.getBasicInfo(id);

    return convert<Video>(info, query);
  },
  'youtube_video_info',
  true,
);

export const getVideoDownloadURL = tryGet(
  async (id: string) => {
    const response = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${id}`,
        aFormat: 'mp3',
        isAudioOnly: true,
      }),
    });

    const data = await response.json();

    return data.url;
  },
  'youtube_video_path',
  60_000,
  false,
);

// deno-lint-ignore no-explicit-any
const isLive = (video: any) =>
  convert<string>(video, 'thumbnail_overlays[0].style') !== 'LIVE';
