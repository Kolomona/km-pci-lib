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