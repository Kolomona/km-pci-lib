export interface FeedData {
  feed: {
    author: string;
    title: string;
    image: string;
    link: string;
    description: string;
    originalUrl: string;
    value?: any;
    url?: string;
  };
  description?: string;
  [key: string]: any;
}

export interface EpisodeData {
  [key: string]: any;
}

// export interface PlaylistItem {
//   title: string;
//   artist: string;
//   enclosureUrl: string;
// }

// export interface Playlist {
//   title?: string;
//   description?: string;
//   image?: string;
//   items: PlaylistItem[];
// }