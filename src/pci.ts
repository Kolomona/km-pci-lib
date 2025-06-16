// This code is experimental and is not all working properly
// TODO: Either fix or remove playlist handling
import type { FeedData, EpisodeData } from './types/pci.js';
// import type { FeedData, EpisodeData, Playlist, PlaylistItem } from './types/pci';

import axios from 'axios';
import { config, configurePCI } from './config.js';

let cachedHeaders: Record<string, string> | null = null;
let headersTimestamp: number | null = null;
const HEADER_VALIDITY_SECONDS = 180; // 3 minutes

async function getReusableHeaders(): Promise<Record<string, string>> {
  const PCI_KEY = config.PCI_KEY as string | undefined;
  const PCI_SECRET = config.PCI_SECRET as string | undefined;
  const USER_AGENT = config.USER_AGENT as string | undefined;
  const PCI_BASEURL = config.PCI_BASEURL as string | undefined;

  if (!PCI_KEY || !PCI_SECRET || !USER_AGENT || !PCI_BASEURL) {
    throw new Error('Missing API keys or configuration. Please call configurePCI() with PCI_KEY, PCI_SECRET, USER_AGENT, and PCI_BASEURL.');
  }

  const now = Math.floor(Date.now() / 1000);
  if (
    cachedHeaders &&
    headersTimestamp &&
    now - headersTimestamp < HEADER_VALIDITY_SECONDS
  ) {
    return cachedHeaders;
  }
  // Create new headers and cache them
  const input = PCI_KEY! + PCI_SECRET! + now;
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  cachedHeaders = {
    'X-Auth-Date': now.toString(),
    'X-Auth-Key': PCI_KEY!,
    Authorization: hashHex,
    ...(USER_AGENT ? { 'User-Agent': USER_AGENT } : {})
  };
  headersTimestamp = now;
  return cachedHeaders;
}

export async function getFeedFromPCIbyGuid(guid: string): Promise<FeedData> {
  if (!guid) {
    throw new Error('GUID must not be empty');
  }

  const headers = await getReusableHeaders();
  const PCI_BASEURL = config.PCI_BASEURL as string;
  const url = `${PCI_BASEURL}podcasts/byguid?guid=${guid}`;
  // console.log(`Fetching feed from PCI by GUID: ${guid} with URL: ${url}`);
  

  try {
    const response = await axios.get<FeedData>(url, { headers, timeout: 10000 });
    const data = response.data;

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response from Podcast Index API');
    }
    if (data.description === 'No feeds match this guid.') {
      throw new Error(`No feed found for guid: ${guid}`);
    }
    return data;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'ECONNABORTED') {
      throw new Error('Network timeout while fetching feed');
    }
    if (err && typeof err === 'object' && 'response' in err) {
      const response = (err as { response?: { status: number; statusText: string } }).response;
      throw new Error(`Failed to fetch feed: ${response?.status} ${response?.statusText}`);
    }
    throw new Error(`Network or parsing error: ${(err instanceof Error ? err.message : String(err))}`);
  }
}

export async function getEpisodesFromPCIbyGuid(feedGuid: string): Promise<EpisodeData> {
  if (!feedGuid) {
    throw new Error('feedGuid must not be empty');
  }

  const headers = await getReusableHeaders();
  const PCI_BASEURL = config.PCI_BASEURL as string;
  const url = `${PCI_BASEURL}episodes/bypodcastguid?guid=${feedGuid}`;

  try {
    const response = await axios.get<EpisodeData>(url, { headers, timeout: 10000 });
    const data = response.data;

    // Get feed metadata and merge
    const feedData = await getFeedFromPCIbyGuid(feedGuid);

    if (feedData && feedData.feed) {
      data.feedGuid = feedGuid;
      data.author = feedData.feed.author;
      data.title = feedData.feed.title;
      data.image = feedData.feed.image;
      data.link = feedData.feed.link;
      data.description = feedData.feed.description;
      data.rssUrl = feedData.feed.originalUrl;
      data.value = feedData.feed.value;
    }

    return data;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'ECONNABORTED') {
      throw new Error('Network timeout while fetching episodes');
    }
    if (err && typeof err === 'object' && 'response' in err) {
      const response = (err as { response?: { status: number; statusText: string } }).response;
      throw new Error(`Failed to fetch episodes: ${response?.status} ${response?.statusText}`);
    }
    throw new Error(`Network or parsing error: ${(err instanceof Error ? err.message : String(err))}`);
  }
}

export async function getEpisodeFromPCIbyGuids(feedGuid: string, itemGuid: string): Promise<EpisodeData | undefined> {
  const headers = await getReusableHeaders();
  const PCI_BASEURL = config.PCI_BASEURL as string;
  // https://api.podcastindex.org/api/1.0/episodes/byguid?guid=PC2084&feedid=920666&pretty
  const url = `${PCI_BASEURL}episodes/byguid?guid=${itemGuid}&podcastguid=${feedGuid}`;
  
  
  try {
    const response = await axios.get<EpisodeData>(url, { headers, timeout: 10000 });
    return response.data;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'ECONNABORTED') {
      throw new Error('Network timeout while fetching episode');
    }
    if (err && typeof err === 'object' && 'response' in err) {
      const response = (err as { response?: { status: number; statusText: string } }).response;
      throw new Error(`Failed to fetch episode: ${response?.status} ${response?.statusText}`);
    }
    throw new Error(`Network or parsing error: ${(err instanceof Error ? err.message : String(err))}`);
  }
}

export async function searchPciAlbums(query: string): Promise<any> {
  if (!query || !query.trim()) {
    throw new Error('Search query must not be empty');
  }

  const headers = await getReusableHeaders();
  const PCI_BASEURL = config.PCI_BASEURL as string;
  const url = `${PCI_BASEURL}search/music/byterm?q=${encodeURIComponent(query)}`;
  try {
    const response = await axios.get(url, { headers, timeout: 10000 });
    return response.data;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'ECONNABORTED') {
      throw new Error('Network timeout while searching albums');
    }
    if (err && typeof err === 'object' && 'response' in err) {
      const response = (err as { response?: { status: number; statusText: string } }).response;
      throw new Error(`Failed to search albums: ${response?.status} ${response?.statusText}`);
    }
    throw new Error(`Network or parsing error: ${(err instanceof Error ? err.message : String(err))}`);
  }
}

// export async function getPlaylistEpisodesFromPCIbyGuid(feedGuid: string): Promise<Playlist | undefined> {
//   // A music playlist is just a podcast feed with a medium=musicL
//   // A remoteItem is a song in the playlist, which has a feedGuid and itemGuid
//   // A songs feedGuid is akin to an Album, and the itemGuid is akin to a song in that album
//   // The author is the artist of the song, and the title> is the title of the song


  
//   // Get the FeedData from the feedGuid
//   // get the remoteItem guids from feed.url




//   const rssUrl = await getRssUrlFromGuid(feedGuid);
//   if (!rssUrl) {
//     throw new Error(`No RSS URL found for feed GUID: ${feedGuid}`);
//   }

//   const guidLarge = await getGuidsFromPlaylistUrl(rssUrl, config);

//   const playlist: Playlist = {
//     title: guidLarge?.title,
//     description: guidLarge?.description,
//     image: guidLarge?.image,
//     items: []
//   };

//   // Caches to avoid redundant API calls
//   const feedCache: Record<string, FeedData | undefined> = {};
//   const episodeCache: Record<string, EpisodeData | undefined> = {};

//   const songs = Array.isArray(guidLarge.songs) ? guidLarge.songs : [];
//   const itemPromises = songs.map(async (item: any) => {
//     try {
//       // Cache feed lookups
//       if (!feedCache[item.feedGuid]) {
//         feedCache[item.feedGuid] = await getFeedFromPCIbyGuid(item.feedGuid);
//       }
//       // Cache episode lookups
//       const episodeKey = `${item.feedGuid}:${item.itemGuid}`;
//       if (!episodeCache[episodeKey]) {
//         episodeCache[episodeKey] = await getEpisodeFromPCIbyGuids(item.feedGuid, item.itemGuid);
//       }

//       const remoteFeed = feedCache[item.feedGuid];
//       const remoteItem = episodeCache[episodeKey];

//       return {
//         title: remoteItem?.title || "",
//         artist: remoteFeed?.feed?.author || "",
//         enclosureUrl: item.enclosureUrl || item.enclosurUrl || "" // handle typo fallback
//       } as PlaylistItem;
//     } catch (err) {
//       // Optionally log error and skip this item
//       return undefined;
//     }
//   });

//   const resolvedItems = await Promise.all(itemPromises);
//   playlist.items = resolvedItems.filter(Boolean) as PlaylistItem[];

//   return playlist;
// }

export async function getRssUrlFromGuid(feedGuid: string): Promise<string | undefined> {
  if (!feedGuid) {
    throw new Error('feedGuid must not be empty');
  }

  // Optionally, you can add debug logging here if needed
  // console.log('getRssUrlFromGuid: ' + feedGuid);

  const feed = await getFeedFromPCIbyGuid(feedGuid);
  // console.log('getRssUrlFromGuid feed: ', feed);

  // Prefer feed.feed.originalUrl, fallback to feed.feed.url if available
  return feed.feed?.originalUrl || feed.feed?.url;
}

