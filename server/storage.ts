import { type Video, type InsertVideo, type ProcessedVideo } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getVideo(id: string): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: string, updates: Partial<Video>): Promise<Video | undefined>;
  getVideoByUrl(youtubeUrl: string): Promise<Video | undefined>;
}

export class MemStorage implements IStorage {
  private videos: Map<string, Video>;

  constructor() {
    this.videos = new Map();
  }

  async getVideo(id: string): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = randomUUID();
    const video: Video = { 
      ...insertVideo, 
      id,
      videoId: '',
      originalTitle: '',
      originalDescription: null,
      duration: null,
      viewCount: null,
      thumbnail: null,
      transcript: null,
      optimizedTitle: null,
      optimizedDescription: null,
      keywords: null,
      createdAt: new Date()
    };
    this.videos.set(id, video);
    return video;
  }

  async updateVideo(id: string, updates: Partial<Video>): Promise<Video | undefined> {
    const existing = this.videos.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.videos.set(id, updated);
    return updated;
  }

  async getVideoByUrl(youtubeUrl: string): Promise<Video | undefined> {
    return Array.from(this.videos.values()).find(
      (video) => video.youtubeUrl === youtubeUrl,
    );
  }
}

export const storage = new MemStorage();
