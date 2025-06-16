# km-pci-lib

`km-pci-lib` is a library for interacting with the [Podcast Index](https://podcastindex.org/) API. It provides a set of utilities for querying podcast and episode data, handling authentication, and parsing responses from the Podcast Index service.

It's main function is to serve me and my projects but you may or may not find it useful.

I'm especially focusing on music.

## Features

- Search for podcasts by name, feed URL, or other criteria
- Retrieve episode lists for a given podcast
- Access podcast and episode metadata (descriptions, artwork, etc.)
- Handles Podcast Index API authentication
- Parses and structures JSON responses

## Installation

Clone this repository and include it in your project:

```sh
git clone https://github.com/yourusername/km-pci-lib.git
```

Then follow your language-specific instructions to add it as a dependency.

## Usage

1. Set your Podcast Index API credentials in a `.env` file at the root of your project.  
   The expected format is:

```
# Podcast index - Get your keys at podcastindex.org
PCI_KEY=your_api_key
PCI_SECRET=your_api_secret
USER_AGENT=YourAppName/v0.0.1
PCI_BASEURL=https://api.podcastindex.org/api/1.0/
```

2. Import and use the functions directly in your code:

```typescript
import { searchPodcasts, getEpisodes, getPodcastMetadata } from 'km-pci-lib/pci';
// For music-related endpoints:
import { searchMusic } from 'km-pci-lib/music';

// Search for podcasts
const results = await searchPodcasts("science");

// Get episodes for a podcast
const episodes = await getEpisodes(123456);

// Get podcast metadata
const metadata = await getPodcastMetadata(123456);

// Search for music (if supported)
const musicResults = await searchMusic("jazz");
```

The library will automatically load your API credentials and configuration from the `.env` file using `config.ts`.  
No need to pass credentials directly to each function.

## Configuration

Set your Podcast Index API credentials as environment variables or pass them directly to the client.

## API Reference

### Podcast Index (pci.ts)

- `getFeedFromPCIbyGuid(guid: string): Promise<FeedData>`  
  Fetch podcast feed metadata by Podcast GUID.

- `getEpisodesFromPCIbyGuid(feedGuid: string): Promise<EpisodeData>`  
  Retrieve all episodes for a given podcast feed GUID.

- `getEpisodeFromPCIbyGuids(feedGuid: string, itemGuid: string): Promise<EpisodeData | undefined>`  
  Retrieve a specific episode by feed GUID and item GUID.

- `searchPciAlbums(query: string): Promise<any>`  
  Search for music albums by keyword.

- `getRssUrlFromGuid(feedGuid: string): Promise<string | undefined>`  
  Get the RSS URL for a podcast feed by GUID.

### Music (music.ts)

- `getAlbum(guid: string): Promise<Album>`  
  Fetch an album (music podcast) and its songs by GUID.

- `getPlaylist(guid: string): Promise<Playlist>`  
  Fetch a playlist (music medium podcast) and its songs by GUID.

## Types

The library provides TypeScript type definitions for the data structures returned by the Podcast Index API.  
In particular, `music.ts` exports the following interfaces for music-related endpoints:

```typescript
export interface Album {
    feedGuid: string;
    medium: string;
    rssUrl: string;
    link: string;
    artist: string;
    title: string;
    description?: string;
    image?: string;
    songs: Song[];
    value: Value;
}

export interface Song {
    feedGuid: string;
    itemGuid: string;
    title: string;
    artist: string;
    image?: string;
    link?: string;
    description?: string;
    enclosureUrl?: string;
    value?: Value;
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

export interface Playlist extends Album {
    songs: Song[];
}
```

These interfaces help ensure type safety and provide autocompletion when working with music-related data in the library.

## Contributing

Contributions are welcome! Please open issues or submit pull requests.

## License

This project is licensed under the ISC License.
