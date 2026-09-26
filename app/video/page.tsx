import type { Metadata } from 'next';
import { fetchYouTubeFeed } from '../utils/youtube';
import VideoClient from './VideoClient';

export const metadata: Metadata = {
  title: 'Video & Workshop HMPS TRPL Polmed - YouTube Resmi',
  description:
    'Tonton video tutorial workshop game development, webinar cybersecurity, mini tournament, dan liputan kegiatan HMPS TRPL Politeknik Negeri Medan langsung dari YouTube resmi.',
  keywords: [
    'Video HMPS TRPL',
    'YouTube HMPS TRPL',
    'Workshop Game Development TRPL',
    'Webinar TRPL Polmed',
    'Tutorial Coding Polmed'
  ]
};

export default async function VideoPage() {
  const { channel, videos } = await fetchYouTubeFeed();

  return <VideoClient initialVideos={videos} channel={channel} />;
}

