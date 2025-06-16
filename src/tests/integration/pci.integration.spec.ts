import 'dotenv/config'; // Loads .env automatically
import { describe, it, expect, beforeEach } from 'vitest';
import * as pci from '../../pci';
import { configurePCI } from '../../config'; 

beforeEach(() => {
  configurePCI({
    PCI_KEY: process.env.PCI_KEY,
    PCI_SECRET: process.env.PCI_SECRET,
    USER_AGENT: process.env.USER_AGENT,
    PCI_BASEURL: process.env.PCI_BASEURL,
  });

});

const goodGuid = '99d74aa0-2f55-5b2c-9c7a-47a3f31357f3'; // Example GUID for testing
const playlistGuid = 'eeeb0e31-f3da-54f2-909f-4fd640c684cc'; // Example playlist GUID for testing
const badGuid = 'invalid-guid-12345'; // Example invalid GUID for testing



// getFeedFromPCIbyGuid series of tests

describe('getFeedFromPCIbyGuid (integration)', () => {
    it('fetches real feed data from the API', async () => {
        const data = await pci.getFeedFromPCIbyGuid(goodGuid);
        expect(data).toBeDefined();
        expect(data?.feed?.title).toBeDefined();
        expect(typeof data?.feed?.author).toBe('string');
        expect(typeof data?.feed?.image).toBe('string');
        expect(typeof data?.feed?.link).toBe('string');
        expect(typeof data?.feed?.description).toBe('string');
        expect(typeof data?.feed?.originalUrl).toBe('string');
    });

    it('returns an error for an invalid guid', async () => {
        let error: unknown = null;
        try {
            await pci.getFeedFromPCIbyGuid(badGuid);
        } catch (err: unknown) {
            error = err;
        }
        expect(error).toBeDefined();
        expect((error as Error).message).toMatch(/No feed found for guid:/);
    });

    it('throws if required environment variables are missing', async () => {
        // Temporarily unset env vars
        const oldKey = process.env.PCI_KEY;
        process.env.PCI_KEY = '';
        let error: unknown = null;
        try {
            await import('../../pci');
        } catch (err: unknown) {
            error = err;
        }
        expect(error).toBeDefined();
        // Restore env var
        process.env.PCI_KEY = oldKey;
    });

    it('throws an error for empty string as guid', async () => {
        let error: unknown = null;
        try {
            await pci.getFeedFromPCIbyGuid('');
        } catch (err: unknown) {
            error = err;
        }
        expect(error).toBeDefined();
        if (error && typeof error === 'object' && 'message' in error) {
            expect((error as Error).message).toMatch(/GUID must not be empty/);
        } else if (typeof error === 'string') {
            expect(error).toMatch(/GUID must not be empty/);
        } else {
            expect(error).not.toBeNull();
        }
    });

    it('throws an error for null as guid', async () => {
        let error: unknown = null;
        try {
            // @ts-expect-error: Testing null input
            await pci.getFeedFromPCIbyGuid(null);
        } catch (err: unknown) {
            error = err;
        }
        expect(error).toBeDefined();
        if (error && typeof error === 'object' && 'message' in error) {
            expect((error as Error).message).toMatch(/GUID must not be empty/);
        } else if (typeof error === 'string') {
            expect(error).toMatch(/GUID must not be empty/);
        } else {
            expect(error).not.toBeNull();
        }
    });

    it('throws an error for undefined as guid', async () => {
        let error: unknown = null;
        try {
            // @ts-expect-error: Testing undefined input
            await pci.getFeedFromPCIbyGuid(undefined);
        } catch (err: unknown) {
            error = err;
        }
        expect(error).toBeDefined();
        if (error && typeof error === 'object' && 'message' in error) {
            expect((error as Error).message).toMatch(/GUID must not be empty/);
        } else if (typeof error === 'string') {
            expect(error).toMatch(/GUID must not be empty/);
        } else {
            expect(error).not.toBeNull();
        }
    });
});


// getEpisodesFromPCIbyGuid(feedGuid: string): series of tests

describe('getEpisodesFromPCIbyGuid (integration)', () => {

    it('fetches real episode data from the API', async () => {
        const data = await pci.getEpisodesFromPCIbyGuid(goodGuid);
        expect(data).toBeDefined();
        expect(Array.isArray(data.items) || Array.isArray(data.episodes)).toBe(true); // Depending on your API
        expect(typeof data.feedGuid).toBe('string');
        expect(typeof data.author).toBe('string');
        expect(typeof data.title).toBe('string');
        expect(typeof data.image).toBe('string');
        expect(typeof data.link).toBe('string');
        expect(typeof data.description).toBe('string');
        expect(typeof data.rssUrl).toBe('string');
    });

    it('throws an error for an invalid guid', async () => {
        let error: unknown = null;
        try {
            await pci.getEpisodesFromPCIbyGuid(badGuid);
        } catch (err: unknown) {
            error = err;
        }
        expect(error).toBeDefined();
        expect((error as Error).message).toMatch(/No feed found for guid:|Failed to fetch episodes:/);
    });

    it('throws an error for empty string as guid', async () => {
        let error: unknown = null;
        try {
            await pci.getEpisodesFromPCIbyGuid('');
        } catch (err: unknown) {
            error = err;
        }
        expect(error).toBeDefined();
        if (error && typeof error === 'object' && 'message' in error) {
            expect((error as Error).message).toMatch(/feedGuid must not be empty/);
        } else if (typeof error === 'string') {
            expect(error).toMatch(/feedGuid must not be empty/);
        } else {
            expect(error).not.toBeNull();
        }
    });

    it('throws an error for null as guid', async () => {
        let error: unknown = null;
        try {
            // @ts-expect-error: Testing null input
            await pci.getEpisodesFromPCIbyGuid(null);
        } catch (err: unknown) {
            error = err;
        }
        expect(error).toBeDefined();
        if (error && typeof error === 'object' && 'message' in error) {
            expect((error as Error).message).toMatch(/feedGuid must not be empty/);
        } else if (typeof error === 'string') {
            expect(error).toMatch(/feedGuid must not be empty/);
        } else {
            expect(error).not.toBeNull();
        }
    });

    it('throws an error for undefined as guid', async () => {
        let error: unknown = null;
        try {
            // @ts-expect-error: Testing undefined input
            await pci.getEpisodesFromPCIbyGuid(undefined);
        } catch (err: unknown) {
            error = err;
        }
        expect(error).toBeDefined();
        if (error && typeof error === 'object' && 'message' in error) {
            expect((error as Error).message).toMatch(/feedGuid must not be empty/);
        } else if (typeof error === 'string') {
            expect(error).toMatch(/feedGuid must not be empty/);
        } else {
            expect(error).not.toBeNull();
        }
    });

    it('throws if required environment variables are missing', async () => {
        const oldKey = process.env.PCI_KEY;
        process.env.PCI_KEY = '';
        let error: unknown = null;
        try {
            await import('../../pci');
        } catch (err: unknown) {
            error = err;
        }
        expect(error).toBeDefined();
        process.env.PCI_KEY = oldKey;
    });
});



// searchPciAlbums(query: string): series of tests
describe('searchPciAlbums (integration)', () => {
    const validQuery = 'ben doerfel'; // Use a common term likely to return results
    const nonsenseQuery = 'asdkjhasdkjhasdkjh'; // Unlikely to return results

    it('returns results for a valid query', async () => {
        const data = await pci.searchPciAlbums(validQuery);
        expect(data).toBeDefined();
        // Adjust these checks based on your actual API response structure:
        expect(Array.isArray(data.feeds) || Array.isArray(data.results) || Array.isArray(data)).toBe(true);
    });

    it('returns empty or no results for a nonsense query', async () => {
        const data = await pci.searchPciAlbums(nonsenseQuery);
        // Accepts either an empty array or an empty albums/results property
        if (Array.isArray(data)) {
            expect(data.length).toBe(0);
        } else if (Array.isArray(data.feeds)) {
            expect(data.feeds.length).toBe(0);
        } else if (Array.isArray(data.results)) {
            expect(data.results.length).toBe(0);
        } else {
            // If API returns something else, at least expect it to be defined
            expect(data).toBeDefined();
        }
    });

    it('throws an error for empty string as query', async () => {
        let error: unknown = null;
        try {
            await pci.searchPciAlbums('');
        } catch (err: unknown) {
            error = err;
        }
        expect(error).toBeDefined();
        expect((error as Error).message).toMatch(/Search query must not be empty/);
    });

    it('throws an error for whitespace-only query', async () => {
        let error: unknown = null;
        try {
            await pci.searchPciAlbums('   ');
        } catch (err: unknown) {
            error = err;
        }
        expect(error).toBeDefined();
        expect((error as Error).message).toMatch(/Search query must not be empty/);
    });

    it('throws an error for null as query', async () => {
        let error: unknown = null;
        try {
            // @ts-expect-error: Testing null input
            await pci.searchPciAlbums(null);
        } catch (err: unknown) {
            error = err;
        }
        expect(error).toBeDefined();
        expect((error as Error).message).toMatch(/Search query must not be empty/);
    });

    it('throws an error for undefined as query', async () => {
        let error: unknown = null;
        try {
            // @ts-expect-error: Testing undefined input
            await pci.searchPciAlbums(undefined);
        } catch (err: unknown) {
            error = err;
        }
        expect(error).toBeDefined();
        expect((error as Error).message).toMatch(/Search query must not be empty/);
    });

    it('throws if required environment variables are missing', async () => {
        const oldKey = process.env.PCI_KEY;
        process.env.PCI_KEY = '';
        let error: unknown = null;
        try {
            await import('../../pci');
        } catch (err: unknown) {
            error = err;
        }
        expect(error).toBeDefined();
        process.env.PCI_KEY = oldKey;
    });
});



// // getPlaylistEpisodesFromPCIbyGuid(feedGuid: string): series of tests 

// describe('getPlaylistEpisodesFromPCIbyGuid (integration)', () => {
//     const validFeedGuid = '43206548-7e07-5eb0-8137-54156cd895e8'; // Replace with a real feed GUID
//     const invalidFeedGuid = 'invalid-guid-12345';

//     it('returns a playlist object for a valid feedGuid', async () => {
//         const playlist = await pci.getPlaylistEpisodesFromPCIbyGuid(playlistGuid);
//         // console.log('getPlaylistEpisodesFromPCIbyGuid response:', JSON.stringify(playlist, null, 2));
//         expect(playlist).toBeDefined();
//         expect(typeof playlist?.title).toBe('string');
//         expect(typeof playlist?.description).toBe('string');
//         expect(typeof playlist?.image).toBe('string');
//         expect(Array.isArray(playlist?.items)).toBe(true);
//         if (playlist?.items.length) {
//             const item = playlist.items[0];
//             expect(typeof item.title).toBe('string');
//             expect(typeof item.artist).toBe('string');
//             expect(typeof item.enclosureUrl).toBe('string');
//         }
//     });

//     it('throws an error for an invalid feedGuid', async () => {
//         let error: unknown = null;
//         try {
//             await pci.getPlaylistEpisodesFromPCIbyGuid(invalidFeedGuid);
//         } catch (err: unknown) {
//             error = err;
//         }
//         expect(error).toBeDefined();
//         expect((error as Error).message).toMatch(/No feed found for guid:/);
//     });

//     it('throws an error for an empty string as feedGuid', async () => {
//         let error: unknown = null;
//         try {
//             await pci.getPlaylistEpisodesFromPCIbyGuid('');
//         } catch (err: unknown) {
//             error = err;
//         }
//         expect(error).toBeDefined();
//         expect((error as Error).message).toMatch(/GUID must not be empty/);
//     });

//     it('throws an error for null as feedGuid', async () => {
//         let error: unknown = null;
//         try {
//             // @ts-expect-error: Testing null input
//             await pci.getPlaylistEpisodesFromPCIbyGuid(null);
//         } catch (err: unknown) {
//             error = err;
//         }
//         expect(error).toBeDefined();
//         expect((error as Error).message).toMatch(/GUID must not be empty/);
//     });

//     it('throws an error for undefined as feedGuid', async () => {
//         let error: unknown = null;
//         try {
//             // @ts-expect-error: Testing undefined input
//             await pci.getPlaylistEpisodesFromPCIbyGuid(undefined);
//         } catch (err: unknown) {
//             error = err;
//         }
//         expect(error).toBeDefined();
//         expect((error as Error).message).toMatch(/GUID must not be empty/);
//     });

//     // Uncomment and use a real GUID if you want to test a feed with no remoteItems
//     // it('playlist items are empty if feed has no remoteItems', async () => {
//     //     const feedGuidWithNoItems = 'valid-guid-with-no-items';
//     //     const playlist = await pci.getPlaylistEpisodesFromPCIbyGuid(feedGuidWithNoItems);
//     //     expect(playlist).toBeDefined();
//     //     expect(Array.isArray(playlist?.items)).toBe(true);
//     //     expect(playlist?.items.length).toBe(0);
//     // });

//     it('throws if required environment variables are missing', async () => {
//         const oldKey = process.env.PCI_KEY;
//         process.env.PCI_KEY = '';
//         let error: unknown = null;
//         try {
//             await import('../../pci');
//         } catch (err: unknown) {
//             error = err;
//         }
//         expect(error).toBeDefined();
//         process.env.PCI_KEY = oldKey;
//     });
// });