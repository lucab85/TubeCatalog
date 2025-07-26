import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Youtube, Copy, CheckCircle, AlertTriangle, Heading, AlignLeft, Tags, WandSparkles, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ProcessedVideo } from "@shared/schema";

export default function Home() {
  const [url, setUrl] = useState("");
  const [processedVideo, setProcessedVideo] = useState<ProcessedVideo | null>(null);
  const { toast } = useToast();

  const processMutation = useMutation({
    mutationFn: async (youtubeUrl: string) => {
      const response = await apiRequest("POST", "/api/videos/process", { youtubeUrl });
      return response.json() as Promise<ProcessedVideo>;
    },
    onSuccess: (data) => {
      setProcessedVideo(data);
      toast({
        title: "Success!",
        description: "Video has been successfully processed and cataloged.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Processing Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return;
    }
    processMutation.mutate(url);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const copyAllContent = async () => {
    if (!processedVideo) return;
    
    const allContent = `Title: ${processedVideo.optimizedTitle}

Description: ${processedVideo.optimizedDescription}

Keywords: ${processedVideo.keywords}`;

    await copyToClipboard(allContent, "All content");
  };

  const processAnother = () => {
    setUrl("");
    setProcessedVideo(null);
  };

  const formatDuration = (duration: string) => {
    if (!duration) return "";
    // Convert ISO 8601 duration to readable format
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;
    
    const hours = match[1] || "0";
    const minutes = match[2] || "0";
    const seconds = match[3] || "0";
    
    if (hours !== "0") {
      return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  const formatViewCount = (count: string) => {
    if (!count) return "0";
    const num = parseInt(count);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Youtube className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">YouTube Video Cataloger</h1>
              <p className="text-sm text-gray-600">AI-powered title, description, and keyword optimization</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Input Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Process YouTube Video</h2>
              <p className="text-gray-600">Enter a YouTube URL to automatically generate optimized title, description, and keywords</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="youtube-url" className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube Video URL
                </Label>
                <div className="relative">
                  <Input
                    type="url"
                    id="youtube-url"
                    name="youtube-url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="pl-12"
                    required
                    disabled={processMutation.isPending}
                  />
                  <Youtube className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Supports youtube.com and youtu.be URLs</p>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={processMutation.isPending}
              >
                {processMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Video...
                  </>
                ) : (
                  <>
                    <WandSparkles className="mr-2 h-4 w-4" />
                    Process Video
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Processing State */}
        {processMutation.isPending && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div>
                  <h3 className="font-medium text-gray-900">Processing your video...</h3>
                  <p className="text-sm text-gray-600">Fetching metadata, extracting transcript, and generating content</p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-gray-700">Video URL validated</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                  <span className="text-gray-700">Fetching video metadata...</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <span>Extracting transcript</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <span>Generating optimized content</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Display */}
        {processedVideo && (
          <div className="space-y-6">
            {/* Video Preview Card */}
            <Card className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Video Thumbnail */}
                <div className="md:w-80 h-48 md:h-auto relative bg-gray-100">
                  {processedVideo.thumbnail ? (
                    <>
                      <img 
                        src={processedVideo.thumbnail}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(processedVideo.duration || "")}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Youtube className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Video Info */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Original Video Details</h3>
                      <p className="text-sm text-gray-600">Source information from YouTube</p>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                      <CheckCircle className="inline w-3 h-3 mr-1" />
                      Processed
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Original Title</span>
                      <p className="text-sm text-gray-700 mt-1">{processedVideo.originalTitle}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Views:</span>
                        <span className="ml-1 font-medium">{formatViewCount(processedVideo.viewCount || "0")}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-1 font-medium">{formatDuration(processedVideo.duration || "")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Optimized Title */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Heading className="text-primary mr-2 w-5 h-5" />
                    Optimized Title
                  </h3>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(processedVideo.optimizedTitle || "", "Title")}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 font-medium">{processedVideo.optimizedTitle}</p>
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  <AlertTriangle className="inline w-3 h-3 mr-1" />
                  Optimized for SEO and engagement based on video content analysis
                </div>
              </CardContent>
            </Card>

            {/* Generated Description */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <AlignLeft className="text-primary mr-2 w-5 h-5" />
                    AI-Generated Description
                  </h3>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(processedVideo.optimizedDescription || "", "Description")}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <Textarea 
                    value={processedVideo.optimizedDescription || ""}
                    readOnly
                    className="min-h-32 border-0 bg-transparent resize-none focus:ring-0"
                  />
                </div>
                
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    <AlertTriangle className="inline w-3 h-3 mr-1" />
                    Generated from video transcript and content analysis
                  </span>
                  <span>{processedVideo.optimizedDescription?.length || 0} characters</span>
                </div>
              </CardContent>
            </Card>

            {/* Generated Keywords */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Tags className="text-primary mr-2 w-5 h-5" />
                    SEO Keywords (40)
                  </h3>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(processedVideo.keywords || "", "Keywords")}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">{processedVideo.keywords}</p>
                </div>
                
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    <AlertTriangle className="inline w-3 h-3 mr-1" />
                    Comma-separated, no hashtags, optimized for search visibility
                  </span>
                  <span>40 keywords</span>
                </div>
              </CardContent>
            </Card>

            {/* Success Message */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">Video Successfully Cataloged!</h3>
                    <p className="text-sm text-gray-700 mt-1">
                      Your YouTube video has been processed and optimized content has been generated. 
                      You can now copy the title, description, and keywords for publication.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button 
                    onClick={copyAllContent}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All Content
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={processAnother}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Process Another Video
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
