export type User = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export type Video = {
  id: string;
  name: string;
  author: string;
  description: string;
  image: string;
  pubDate: Date;
  subVideoList: {
    id: string;
    index: number;
    name: string;
    duration: number;
  }[];
};
