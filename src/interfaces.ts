export interface FeedFromPCI {
  status: string; // "true"
  query: {
    guid: string;
    id: number;
  };
  feed: {
    id: number;
    podcastGuid: string;
    medium: string;
    title: string;
    url: string;
    originalUrl: string;
    link: string;
    description: string;
    author: string;
    ownerName: string;
    image: string;
    artwork: string;
    lastUpdateTime: number;
    lastCrawlTime: number;
    lastParseTime: number;
    lastGoodHttpStatusTime: number;
    lastHttpStatus: number;
    contentType: string;
    itunesId: number | null;
    itunesType: string;
    generator: string;
    language: string;
    explicit: boolean;
    type: number;
    dead: number;
    chash: string;
    episodeCount: number;
    crawlErrors: number;
    parseErrors: number;
    categories: unknown | null;
    locked: number;
    imageUrlHash: number;
  };
  description: string;
}


/// PCI episodes data structure

export interface Episodes {
  status: string;
  items: EpisodeItem[];
  count: number;
  query: number;
  description: string;
  feedGuid: string;
  author: string;
  title: string;
  image: string;
  link: string;
  rssUrl: string;
  value: Value;
}

export interface EpisodeItem {
  id: number;
  title: string;
  link: string;
  description: string;
  guid: string;
  datePublished: number;
  datePublishedPretty: string;
  dateCrawled: number;
  enclosureUrl: string;
  enclosureType: string;
  enclosureLength: number;
  duration: number;
  explicit: number;
  episode: number | null;
  episodeType: string;
  season: number;
  image: string;
  feedItunesId: number | null;
  feedUrl: string;
  feedImage: string;
  feedId: number;
  podcastGuid: string;
  feedLanguage: string;
  feedDead: number;
  feedDuplicateOf: number | null;
  chaptersUrl: string | null;
  transcriptUrl: string | null;
  value: Value;
}

export interface Value {
  model: {
    type: string;
    method: string;
    suggested?: string;
  };
  destinations: Destination[];
}

export interface Destination {
  name: string;
  type: string;
  address: string;
  split: number;
  customKey?: string;
  customValue?: string;
}

/// PCI Search Results Data Structure
export interface SearchResults {
  status: string;
  feeds: SearchFeed[];
  count: number;
  query: string;
  description: string;
}

export interface SearchFeed {
  id: number;
  title: string;
  url: string;
  originalUrl: string;
  link: string;
  description: string;
  author: string;
  ownerName: string;
  image: string;
  artwork: string;
  lastUpdateTime: number;
  lastCrawlTime: number;
  lastParseTime: number;
  inPollingQueue: number;
  priority: number;
  lastGoodHttpStatusTime: number;
  lastHttpStatus: number;
  contentType: string;
  itunesId: number | null;
  generator: string;
  language: string;
  type: number;
  dead: number;
  crawlErrors: number;
  parseErrors: number;
  categories: { [key: string]: string };
  locked: number;
  explicit: boolean;
  podcastGuid: string;
  medium: string;
  episodeCount: number;
  imageUrlHash: number;
  newestItemPubdate: number;
}


/// parsRss data structures

export interface Enclosure {
	url?: string;
	length?: number | string;
	type?: string;
}

export interface PodcastValueRecipient {
	[name: string]: any;
}

export interface PodcastValue {
	'podcast:valueRecipient'?: PodcastValueRecipient | PodcastValueRecipient[];
	[key: string]: any;
}

export interface PodcastChapters {
	url?: string;
	[key: string]: any;
}

export interface PodcastTranscript {
	[key: string]: any;
}

export interface PodcastAlternateEnclosure {
	[key: string]: any;
}

export interface PodcastPerson {
	[key: string]: any;
}

export interface ItunesImage {
	href?: string;
	[key: string]: any;
}

export interface Guid {
	'#text'?: string;
	isPermaLink?: boolean | string;
}

export interface Item {
	enclosure?: Enclosure;
	'podcast:alternateEnclosure'?: PodcastAlternateEnclosure;
	author?: string;
	'itunes:author'?: string;
	'podcast:chapters'?: PodcastChapters;
	pubDate?: string;
	description?: string;
	'itunes:duration'?: number | string;
	'podcast:episode'?: string | number;
	'itunes:episodeType'?: string;
	'itunes:explicit'?: string;
	'itunes:image'?: ItunesImage;
	'itunes:id'?: string;
	language?: string;
	guid?: Guid;
	'podcast:id'?: string;
	'itunes:keywords'?: string;
	link?: string;
	'podcast:location'?: string;
	'podcast:person'?: PodcastPerson;
	'podcast:season'?: string | number;
	title?: string;
	'podcast:transcript'?: PodcastTranscript | PodcastTranscript[];
	'podcast:value'?: PodcastValue;
	[key: string]: any;
}

export interface Channel {
	image?: { url?: string };
	'itunes:image'?: ItunesImage;
	title?: string;
	author?: string;
	language?: string;
	link?: string;
	description?: string;
	'podcast:guid'?: string;
	'podcast:value'?: PodcastValue;
	'podcast:person'?: PodcastPerson;
	'podcast:remoteItem'?: RemoteItem | RemoteItem[];
	[key: string]: any;
}

export interface RemoteItem {
	feedGuid?: string;
	itemGuid?: string;
	[key: string]: any;
}

export interface Episode {
	alternateEnclosure: PodcastAlternateEnclosure | null;
	author: string | null;
	chaptersUrl: string | null;
	dateCrawled: number;
	datePublished: number;
	datePublishedPretty: string;
	description: string;
	duration: number | string;
	enclosureLength: number | string;
	enclosureType: string | null;
	enclosureUrl: string | null;
	episode: string | number | null;
	episodeType: string | null;
	explicit: string;
	feedId: null;
	feedImage: string | null;
	feedItunesId: string | null;
	feedLanguage: string | null;
	guid: string | null;
	guidPermaLink: boolean | string | null;
	id: string | null;
	image: string | null;
	keywords: string | undefined;
	link: string | null;
	location: string | null;
	person: PodcastPerson | null;
	podcastPerson: PodcastPerson | null;
	season: string | number | 0;
	title: string | undefined;
	transcript: PodcastTranscript[] | PodcastTranscript | null;
	value: { destinations: PodcastValueRecipient[]; model: PodcastValue } | null;
}

export interface GetEpisodesResult {
	artwork?: string;
	episodes: Episode[];
	channel?: Channel;
}

export interface GetGuidsResult {
	feedGuid?: string;
	title?: string;
	author?: string;
	image?: string;
	url: string;
	link?: string;
	description?: string;
	value?: PodcastValue;
	songs: { feedGuid?: string; itemGuid?: string }[];
	channel?: Channel;
}