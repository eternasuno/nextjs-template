export type Channel = {
  id: string;
  title: string;
  description: string;
  link: string;
  image: string;
  videos: Video[];
};

export type Video = {
  id: string;
  title: string;
  duration: number;
  description: string;
  image: string;
  pubDate: Date;
};
