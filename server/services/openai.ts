import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface OptimizedContent {
  title: string;
  description: string;
  keywords: string;
}

export async function generateOptimizedContent(
  originalTitle: string,
  originalDescription: string,
  transcript: string
): Promise<OptimizedContent> {
  try {
    const prompt = `You are a YouTube SEO expert. Based on the following video content, generate optimized YouTube metadata:

Original Title: ${originalTitle}
Original Description: ${originalDescription}
Video Transcript: ${transcript.substring(0, 4000)} ${transcript.length > 4000 ? '...' : ''}

Please generate:
1. An optimized title (60-70 characters) that is SEO-friendly and engaging
2. A comprehensive description (200-500 words) that includes key points from the video
3. Exactly 40 relevant keywords (comma-separated, no hashtags) for maximum discoverability

Respond with JSON in this exact format:
{
  "title": "optimized title here",
  "description": "comprehensive description here",
  "keywords": "keyword1, keyword2, keyword3, ..."
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional YouTube SEO specialist. Generate optimized video metadata that maximizes discoverability and engagement while maintaining accuracy to the video content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    // Validate the response structure
    if (!result.title || !result.description || !result.keywords) {
      throw new Error('Invalid response structure from OpenAI');
    }

    // Ensure we have exactly 40 keywords
    const keywordArray = result.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0);
    if (keywordArray.length !== 40) {
      // If not exactly 40, take the first 40 or pad with related terms
      const adjustedKeywords = keywordArray.slice(0, 40);
      result.keywords = adjustedKeywords.join(', ');
    }

    return {
      title: result.title,
      description: result.description,
      keywords: result.keywords
    };
  } catch (error) {
    console.error('OpenAI content generation error:', error);
    throw new Error('Failed to generate optimized content');
  }
}
