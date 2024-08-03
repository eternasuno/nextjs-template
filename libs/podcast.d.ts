export type Feed = {
  title: string;
  author: string;
  description?: string;
  link: string;
  image: string;
  items?: Item[];
};

export type Item = {
  title: string;
  description?: string;
  link: string;
  pubDate: Date;
  enclosure_url: string;
  enclosure_type: string;
  duration: number;
  image: string;
};
