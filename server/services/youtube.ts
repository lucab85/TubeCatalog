import { google } from 'googleapis';
import { Innertube } from 'youtubei.js';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY || 'default_key'
});

export interface YouTubeVideoData {
  videoId: string;
  title: string;
  description: string;
  duration: string;
  viewCount: string;
  thumbnail: string;
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

export async function getVideoData(videoId: string): Promise<YouTubeVideoData> {
  try {
    const response = await youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: [videoId]
    });

    const video = response.data.items?.[0];
    if (!video) {
      throw new Error('Video not found or is not publicly accessible');
    }

    const snippet = video.snippet!;
    const statistics = video.statistics!;
    const contentDetails = video.contentDetails!;

    return {
      videoId,
      title: snippet.title || '',
      description: snippet.description || '',
      duration: contentDetails.duration || '',
      viewCount: statistics.viewCount || '0',
      thumbnail: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || ''
    };
  } catch (error) {
    console.error('YouTube API error:', error);
    throw new Error('Failed to fetch video data from YouTube API');
  }
}

export async function getVideoTranscript(videoId: string): Promise<string> {
  try {
    // Initialize YouTube inner API client
    const yt = await Innertube.create();
    
    // Get video info and transcript
    const info = await yt.getInfo(videoId);
    
    if (!info.captions) {
      throw new Error('No captions available for this video');
    }

    // Try to get transcript
    const transcript = await info.getTranscript();
    
    if (!transcript || !transcript.content) {
      throw new Error('No transcript content available');
    }

    // Extract text from transcript content
    const transcriptText = transcript.content.contents
      .map((item: any) => {
        if (item.text && item.text.runs) {
          return item.text.runs.map((run: any) => run.text).join('');
        }
        return '';
      })
      .filter((text: string) => text.trim().length > 0)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!transcriptText || transcriptText.length < 10) {
      throw new Error('Transcript content too short or empty');
    }

    return transcriptText;
  } catch (error) {
    console.error('Transcript extraction error:', error);
    throw new Error('Failed to extract video transcript');
  }
}
