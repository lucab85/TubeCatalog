import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { processVideoSchema } from "@shared/schema";
import { extractVideoId, getVideoData, getVideoTranscript } from "./services/youtube";
import { generateOptimizedContent } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.post("/api/videos/process", async (req, res) => {
    try {
      const { youtubeUrl } = processVideoSchema.parse(req.body);

      // Extract video ID
      const videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        return res.status(400).json({ 
          message: "Invalid YouTube URL format. Please provide a valid YouTube video URL." 
        });
      }

      // Check if video already exists
      const existingVideo = await storage.getVideoByUrl(youtubeUrl);
      if (existingVideo && existingVideo.optimizedTitle) {
        return res.json(existingVideo);
      }

      // Create initial video record
      const video = await storage.createVideo({ youtubeUrl });

      try {
        // Fetch video data from YouTube API
        const videoData = await getVideoData(videoId);
        
        // Update video with YouTube data
        await storage.updateVideo(video.id, {
          videoId: videoData.videoId,
          originalTitle: videoData.title,
          originalDescription: videoData.description,
          duration: videoData.duration,
          viewCount: videoData.viewCount,
          thumbnail: videoData.thumbnail
        });

        // Extract transcript
        let transcript = '';
        try {
          transcript = await getVideoTranscript(videoId);
        } catch (transcriptError) {
          console.warn('Transcript extraction failed:', transcriptError);
          // Continue without transcript - use description instead
          transcript = videoData.description || videoData.title;
        }

        // Update with transcript
        await storage.updateVideo(video.id, { transcript });

        // Generate optimized content using AI
        const optimizedContent = await generateOptimizedContent(
          videoData.title,
          videoData.description,
          transcript
        );

        // Update with optimized content
        const finalVideo = await storage.updateVideo(video.id, {
          optimizedTitle: optimizedContent.title,
          optimizedDescription: optimizedContent.description,
          keywords: optimizedContent.keywords
        });

        res.json(finalVideo);

      } catch (error) {
        console.error('Processing error:', error);
        
        // Clean up incomplete video record
        await storage.updateVideo(video.id, {
          optimizedTitle: null,
          optimizedDescription: null,
          keywords: null
        });

        if (error instanceof Error) {
          return res.status(500).json({ 
            message: error.message || "Failed to process video. Please check the URL and try again." 
          });
        }
        
        return res.status(500).json({ 
          message: "An unexpected error occurred while processing the video." 
        });
      }

    } catch (error) {
      console.error('Request validation error:', error);
      return res.status(400).json({ 
        message: "Invalid request data. Please provide a valid YouTube URL." 
      });
    }
  });

  app.get("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      console.error('Get video error:', error);
      res.status(500).json({ message: "Failed to retrieve video" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
