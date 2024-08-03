export type User = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export type Video = {
  id: string;
  title: string;
  description: string;
  image: string;
  pubDate: Date;
  subVideoList: {
    id: string;
    index: number;
    title: string;
    duration: number;
  }[];
};
