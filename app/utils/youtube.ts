export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  views: number;
  category: string;
}

export interface YouTubeChannelInfo {
  id: string;
  name: string;
  handle: string;
  url: string;
  subscribeUrl: string;
}

// Configurable defaults via environment variables
export const DEFAULT_HANDLE = process.env.NEXT_PUBLIC_YOUTUBE_HANDLE || '@HMPSTRPLPOLMED';
export const DEFAULT_CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || 'UCYgLaGInjSKwB69JG6jB-MQ';
export const DEFAULT_CHANNEL_NAME = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_NAME || 'HMPS TRPL POLMED';

// In-memory cache for resolved channel IDs to avoid repetitive scraping
const channelIdCache = new Map<string, string>();

/**
 * Dynamically resolves a YouTube Channel ID (UC...) from a handle (@handle) or URL.
 * If already a channel ID or cached, returns immediately without network request.
 */
export async function resolveChannelId(handleOrIdentifier: string = DEFAULT_HANDLE): Promise<string> {
  const trimmed = handleOrIdentifier.trim();

  // If it's already a valid YouTube Channel ID (starts with UC and roughly 24 chars)
  if (/^UC[A-Za-z0-9_-]{22}$/.test(trimmed)) {
    return trimmed;
  }

  // Check cache
  if (channelIdCache.has(trimmed)) {
    return channelIdCache.get(trimmed)!;
  }

  try {
    const cleanHandle = trimmed.startsWith('@') ? trimmed : `@${trimmed.replace(/^https?:\/\/(?:www\.)?youtube\.com\//, '').replace(/^@/, '')}`;
    const targetUrl = `https://www.youtube.com/${cleanHandle}`;

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 86400 }, // Cache resolution for 24h
      signal: AbortSignal.timeout(4000)
    });

    if (res.ok) {
      const html = await res.text();
      // Match meta itemprop="identifier" content="UC..." or channel_id=UC...
      const idMatch =
        html.match(/<meta itemprop="identifier" content="(UC[A-Za-z0-9_-]{22})"/i) ||
        html.match(/<meta itemprop="channelId" content="(UC[A-Za-z0-9_-]{22})"/i) ||
        html.match(/channel_id=(UC[A-Za-z0-9_-]{22})/i) ||
        html.match(/"browseId":"(UC[A-Za-z0-9_-]{22})"/i);

      if (idMatch && idMatch[1]) {
        const resolved = idMatch[1];
        channelIdCache.set(trimmed, resolved);
        return resolved;
      }
    }
  } catch (err) {
    console.warn(`resolveChannelId: Failed to auto-discover channel ID for "${handleOrIdentifier}":`, err);
  }

  // Fallback to default channel ID
  return DEFAULT_CHANNEL_ID;
}


function decodeXml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Dynamically categorizes video based on title keywords.
 * Easily extends without breaking existing filters.
 */
export function detectVideoCategory(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('workshop') || lower.includes('development') || lower.includes('series') || lower.includes('tutorial') || lower.includes('coding')) {
    return 'workshop';
  }
  if (lower.includes('webinar') || lower.includes('seminar') || lower.includes('talkshow') || lower.includes('kuliah umum')) {
    return 'webinar';
  }
  if (lower.includes('turnamen') || lower.includes('tournament') || lower.includes('competition') || lower.includes('lomba') || lower.includes('event')) {
    return 'event';
  }
  return 'general';
}

export function parseYouTubeRss(xmlText: string): { channelName: string; videos: YouTubeVideo[] } {
  // Extract channel author name from feed
  const authorMatch = xmlText.match(/<author>\s*<name>([^<]+)<\/name>/i);
  const channelName = authorMatch ? decodeXml(authorMatch[1].trim()) : DEFAULT_CHANNEL_NAME;

  const entries: YouTubeVideo[] = [];
  const entryMatches = xmlText.match(/<entry>[\s\S]*?<\/entry>/g);
  if (!entryMatches) return { channelName, videos: [] };

  for (const entry of entryMatches) {
    const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/i);
    const titleMatch = entry.match(/<title>([^<]+)<\/title>/i);
    const publishedMatch = entry.match(/<published>([^<]+)<\/published>/i);
    const descMatch = entry.match(/<media:description>([\s\S]*?)<\/media:description>/i);
    const thumbMatch = entry.match(/<media:thumbnail[^>]+url="([^"]+)"/i);
    const viewsMatch = entry.match(/<media:statistics[^>]+views="(\d+)"/i);

    if (videoIdMatch && titleMatch) {
      const id = videoIdMatch[1].trim();
      const rawTitle = titleMatch[1].trim();
      const title = decodeXml(rawTitle);
      const description = descMatch ? decodeXml(descMatch[1].trim()) : '';
      const publishedAt = publishedMatch ? publishedMatch[1].trim() : new Date().toISOString();
      const thumbnail = thumbMatch ? thumbMatch[1] : `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      const views = viewsMatch ? parseInt(viewsMatch[1], 10) : 0;

      entries.push({
        id,
        title,
        description,
        publishedAt,
        thumbnail,
        views,
        category: detectVideoCategory(title)
      });
    }
  }

  return { channelName, videos: entries };
}

const SCRAPE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  // Skip the EU consent interstitial
  Cookie: 'CONSENT=YES+1; SOCS=CAI'
};

/**
 * Converts YouTube relative time text ("3 months ago", "3mo ago") into an approximate ISO date.
 */
function relativeTimeToIso(text: string): string {
  const match = text.match(/(\d+)\s*(second|sec|s|minute|min|hour|hr|h|day|d|week|wk|w|month|mo|year|yr|y)/i);
  if (!match) return new Date().toISOString();
  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const msPerUnit: Record<string, number> = {
    s: 1000, sec: 1000, second: 1000,
    min: 60_000, minute: 60_000,
    h: 3_600_000, hr: 3_600_000, hour: 3_600_000,
    d: 86_400_000, day: 86_400_000,
    w: 604_800_000, wk: 604_800_000, week: 604_800_000,
    mo: 2_592_000_000, month: 2_592_000_000,
    y: 31_536_000_000, yr: 31_536_000_000, year: 31_536_000_000
  };
  return new Date(Date.now() - amount * (msPerUnit[unit] ?? 0)).toISOString();
}

/**
 * Fallback when the RSS feed is unavailable: scrapes the channel's /videos tab (ytInitialData).
 */
export async function scrapeChannelVideos(channelId: string): Promise<YouTubeVideo[]> {
  const res = await fetch(`https://www.youtube.com/channel/${channelId}/videos`, {
    headers: SCRAPE_HEADERS,
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(8000)
  });
  if (!res.ok) return [];

  const html = await res.text();
  const dataMatch = html.match(/var ytInitialData = (\{[\s\S]*?\});<\/script>/);
  if (!dataMatch) return [];

  const lockups: any[] = [];
  const walk = (node: any) => {
    if (Array.isArray(node)) {
      node.forEach(walk);
    } else if (node && typeof node === 'object') {
      if (node.lockupViewModel) lockups.push(node.lockupViewModel);
      Object.values(node).forEach(walk);
    }
  };
  walk(JSON.parse(dataMatch[1]));

  const seen = new Set<string>();
  const videos: YouTubeVideo[] = [];
  for (const lockup of lockups) {
    const id: string | undefined = lockup.contentId;
    if (!id || lockup.contentType !== 'LOCKUP_CONTENT_TYPE_VIDEO' || seen.has(id)) continue;
    seen.add(id);

    const meta = lockup.metadata?.lockupMetadataViewModel;
    const title: string = meta?.title?.content ?? '';
    const parts: any[] = (meta?.metadata?.contentMetadataViewModel?.metadataRows ?? [])
      .flatMap((row: any) => row.metadataParts ?? []);
    const labels = parts.map((p) => p.accessibilityLabel || p.text?.content || '');
    const viewsLabel = labels.find((l) => /view/i.test(l)) ?? '';
    const timeLabel = labels.find((l) => /ago/i.test(l)) ?? '';

    videos.push({
      id,
      title,
      description: '',
      publishedAt: relativeTimeToIso(timeLabel),
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      views: parseInt(viewsLabel.replace(/[^\d]/g, ''), 10) || 0,
      category: detectVideoCategory(title)
    });
  }
  return videos;
}

/**
 * Dynamically fetches YouTube feed and channel information for any handle or channel ID.
 */
export async function fetchYouTubeFeed(identifier: string = DEFAULT_HANDLE): Promise<{
  channel: YouTubeChannelInfo;
  videos: YouTubeVideo[];
}> {
  const channelId = await resolveChannelId(identifier);
  const handle = identifier.startsWith('@') ? identifier : DEFAULT_HANDLE;
  const channelUrl = `https://www.youtube.com/${handle}`;
  const subscribeUrl = `https://www.youtube.com/${handle}?sub_confirmation=1`;

  let channelName = DEFAULT_CHANNEL_NAME;
  let videos: YouTubeVideo[] = [];

  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000)
    });

    if (res.ok) {
      const parsed = parseYouTubeRss(await res.text());
      channelName = parsed.channelName || DEFAULT_CHANNEL_NAME;
      videos = parsed.videos;
    } else {
      console.warn(`fetchYouTubeFeed: RSS feed returned ${res.status} for channel "${channelId}"`);
    }
  } catch (error) {
    console.warn(`fetchYouTubeFeed: Error fetching feed for channel "${channelId}":`, error);
  }

  // YouTube's RSS endpoint is intermittently down (404/500); fall back to the channel page
  if (videos.length === 0) {
    try {
      videos = await scrapeChannelVideos(channelId);
    } catch (error) {
      console.warn(`fetchYouTubeFeed: Fallback scrape failed for channel "${channelId}":`, error);
    }
  }

  return {
    channel: {
      id: channelId,
      name: channelName,
      handle,
      url: channelUrl,
      subscribeUrl
    },
    videos
  };
}

/**
 * Convenience helper returning just the list of videos.
 */
export async function fetchYouTubeVideos(identifier?: string): Promise<YouTubeVideo[]> {
  const feed = await fetchYouTubeFeed(identifier);
  return feed.videos;
}
