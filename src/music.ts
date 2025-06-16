import axios from 'axios';
import type { Album, Song, Value, Destination, Playlist } from './types/music.js';
import { XMLParser } from 'fast-xml-parser'; // Make sure to install fast-xml-parser
import { config, configurePCI } from './config.js';


// Cache podcastindex.org API headers to avoid redundant calls
// and to handle rate limiting more effectively.
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

export async function getAlbum(guid: string): Promise<Album> {
  if (!guid) {
    throw new Error('GUID must not be empty');
  }

  const headers = await getReusableHeaders();
  const PCI_BASEURL = config.PCI_BASEURL as string;
  const url = `${PCI_BASEURL}podcasts/byguid?guid=${guid}`;
  const response = await axios.get(url, { headers });
  if (response.status !== 200) {
    throw new Error(`Failed to fetch album data: ${response.statusText}`);
  }
  const feedData = response.data;
  const feed = feedData.feed;

  // Map the feed data to the Album interface
  const album: Album = {
    feedGuid: feed.podcastGuid || guid,
    medium: feed.medium || 'music',
    rssUrl: feed.url || feed.originalUrl || '',
    link: feed.link || '',
    artist: feed.author || feed.ownerName || '',
    title: feed.title || '',
    description: feed.description || '',
    image: feed.image || feed.artwork || '',
    songs: [], // To be filled in below
    value: feed.value as Value,
  };

  // Fetch the episodes and map them to Song[]
  const episodesUrl = `${PCI_BASEURL}episodes/bypodcastguid?guid=${guid}`;
  const episodesResponse = await axios.get(episodesUrl, { headers });
  if (episodesResponse.status !== 200) {
    throw new Error(`Failed to fetch episode data: ${episodesResponse.statusText}`);
  }
  const episodesData = episodesResponse.data;
  // Each item is a song
  album.songs = (episodesData.items || []).map((item: any): Song => ({
    feedGuid: item.podcastGuid,
    itemGuid: item.guid,
    title: item.title,
    artist: item.author,
    image: item.image || album.image,
    link: item.link,
    description: item.description,
    enclosureUrl: item.enclosureUrl,
    value: item.value as Value | undefined,
  }));
  return album;
}


export async function getPlaylist(guid: string): Promise<Playlist> {
  if (!guid) throw new Error('GUID must not be empty');
  const headers = await getReusableHeaders();
  const PCI_BASEURL = config.PCI_BASEURL as string;

  // 1. Get the podcast feed info (to get the RSS url and album info)
  const feedUrl = `${PCI_BASEURL}podcasts/byguid?guid=${guid}`;
  const feedResp = await axios.get(feedUrl, { headers });
  if (feedResp.status !== 200) throw new Error(`Failed to fetch playlist feed: ${feedResp.statusText}`);
  const feed = feedResp.data.feed;

  // 2. Get the RSS url for the playlist
  const rssUrl = feed.url || feed.originalUrl;
  if (!rssUrl) throw new Error('No RSS url found for playlist');

  // 3. Fetch the RSS feed XML
  const rssResp = await axios.get(rssUrl, { responseType: 'text' });
  if (rssResp.status !== 200) throw new Error(`Failed to fetch playlist RSS: ${rssResp.statusText}`);
  const rssXml = rssResp.data;

  // 4. Parse the RSS XML and extract <podcast:remoteItem> elements
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: false, // <--- keep namespace prefix!
    parseTagValue: true,
    parseAttributeValue: true,
  });
  const rss = parser.parse(rssXml);

  // Find remoteItems (handle both single and array cases)
  const channel = rss.rss?.channel || rss.channel;
  let remoteItems = [];
  if (channel && channel['podcast:remoteItem']) {
    remoteItems = Array.isArray(channel['podcast:remoteItem'])
      ? channel['podcast:remoteItem']
      : [channel['podcast:remoteItem']];
  }

  // Caches to avoid redundant API calls
  const feedCache: Record<string, Album> = {};
  const episodeCache: Record<string, Song | undefined> = {};

  const songs: Song[] = [];
  for (const item of remoteItems) {
    // Try all possible attribute names
    const feedGuid = item['@_feedGuid'] || item['@_feedguid'] || item.feedGuid || item.feedguid;
    const itemGuid = item['@_itemGuid'] || item['@_itemguid'] || item.itemGuid || item.itemguid;
    if (!feedGuid || !itemGuid) continue;

    if (!feedCache[feedGuid]) {
      feedCache[feedGuid] = await getAlbum(feedGuid);
    }
    const album = feedCache[feedGuid];

    // Find the song in the album's songs array
    const song = album.songs.find(s => s.itemGuid === itemGuid);
    if (song) {
      song.artist = album.artist; // Ensure artist is always the album artist
     
      songs.push(song);
    } else {
      // Optionally log missing songs for debugging
      console.warn(`Song not found for feedGuid=${feedGuid} itemGuid=${itemGuid}`);
    }
  }

  // Build the Playlist object (Playlist extends Album)
  const playlist: Playlist = {
    feedGuid: feed.podcastGuid || guid,
    medium: 'musicL',
    rssUrl: rssUrl,
    link: feed.link || '',
    artist: feed.author || feed.ownerName || '',
    title: feed.title || '',
    description: feed.description || '',
    image: feed.image || feed.artwork || '',
    songs,
    value: feed.value as Value,
    // Add any Playlist-specific fields here if needed
  };

  return playlist;
}