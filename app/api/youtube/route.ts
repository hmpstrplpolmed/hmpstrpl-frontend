import { NextResponse } from 'next/server';
import { fetchYouTubeFeed } from '../../utils/youtube';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const channelParam = searchParams.get('channel') || undefined;
    const feed = await fetchYouTubeFeed(channelParam);

    return NextResponse.json({
      success: true,
      data: feed
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to fetch YouTube feed'
      },
      { status: 500 }
    );
  }
}
