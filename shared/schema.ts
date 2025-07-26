import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  youtubeUrl: text("youtube_url").notNull(),
  videoId: text("video_id").notNull(),
  originalTitle: text("original_title").notNull(),
  originalDescription: text("original_description"),
  duration: text("duration"),
  viewCount: text("view_count"),
  thumbnail: text("thumbnail"),
  transcript: text("transcript"),
  optimizedTitle: text("optimized_title"),
  optimizedDescription: text("optimized_description"),
  keywords: text("keywords"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVideoSchema = createInsertSchema(videos).pick({
  youtubeUrl: true,
});

export const processVideoSchema = z.object({
  youtubeUrl: z.string().url("Please enter a valid URL").refine(
    (url) => {
      const youtubeDomains = ['youtube.com', 'youtu.be', 'www.youtube.com', 'www.youtu.be'];
      try {
        const urlObj = new URL(url);
        return youtubeDomains.some(domain => urlObj.hostname === domain);
      } catch {
        return false;
      }
    },
    "Please enter a valid YouTube URL"
  ),
});

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;
export type ProcessVideoRequest = z.infer<typeof processVideoSchema>;

export interface ProcessedVideo {
  id: string;
  youtubeUrl: string;
  videoId: string;
  originalTitle: string;
  originalDescription?: string;
  duration?: string;
  viewCount?: string;
  thumbnail?: string;
  transcript?: string;
  optimizedTitle?: string;
  optimizedDescription?: string;
  keywords?: string;
}
