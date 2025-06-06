/**
 * Service for generating images using various AI models
 */

import { Buffer } from 'buffer';
import OpenAI from 'openai';

// Interface for image generation result
interface ImageGenerationResult {
  base64Data: string;
  mimeType: string;
}

// Initialize the OpenAI client with the API key
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Log the API key status (without revealing the key)
console.log(`OpenAI API Key status: ${process.env.OPENAI_API_KEY ? 'Set' : 'Not set'}`);

/**
 * Generate an image using the specified AI model
 * @param prompt The text prompt to generate the image from
 * @param model The AI model to use (openai, midjourney, gemini)
 * @returns Promise with the generated image data
 */
export async function generateImage(
  prompt: string,
  model: string
): Promise<ImageGenerationResult> {
  console.log(`Generating image with ${model} using prompt: ${prompt}`);
  
  try {
    switch (model) {
      case 'openai':
        return await generateWithOpenAI(prompt);
      case 'midjourney':
        return await generateWithMidjourney(prompt);
      case 'gemini':
        return await generateWithGemini(prompt);
      default:
        throw new Error(`Unsupported AI model: ${model}`);
    }
  } catch (error) {
    console.error(`Error generating image with ${model}:`, error);
    throw error;
  }
}

// Real OpenAI image generation
async function generateWithOpenAI(prompt: string): Promise<ImageGenerationResult> {
  try {
    // Make sure we have a valid API key
    if (!process.env.OPENAI_API_KEY) {
      console.log("Warning: OpenAI API key is not set - image generation will likely fail");
      throw new Error('OpenAI API key is not properly configured');
    }
    
    // Provide a default prompt if empty or contains placeholder text
    let cleanPrompt = prompt.trim();
    
    if (!cleanPrompt || cleanPrompt === '' || cleanPrompt === '(leave blank for now)') {
      // Use a default prompt that will work well with image generation
      cleanPrompt = "house exterior with natural lighting";
      console.log(`Using default prompt: "${cleanPrompt}"`);
    }
    
    // Format the prompt specifically for DALL-E to ensure it works well
    // This approach has been tested and works reliably with DALL-E
    const enhancedPrompt = `A professional, high-quality photograph of ${cleanPrompt}. Realistic style, detailed, high-resolution, well-lit. No text, no watermarks.`;
    
    console.log(`Sending request to OpenAI DALL-E with enhanced prompt: "${enhancedPrompt}"`);
    
    // Use OpenAI's DALL-E to generate an image
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json"
    });
    
    console.log("OpenAI image generation successful");
    
    // Get base64 image data from the response
    const base64Data = response.data?.[0]?.b64_json;
    
    if (!base64Data) {
      throw new Error('OpenAI API did not return image data');
    }
    
    return {
      base64Data,
      mimeType: 'image/png'
    };
  } catch (error: any) {
    console.error('Error generating image with OpenAI:', error);
    
    // Log specific error details for debugging
    if (error.message) {
      console.error('Error message:', error.message);
    }
    
    // Handle specific error cases
    if (error.message && error.message.includes('API key')) {
      throw new Error('OpenAI API key is invalid or missing. Please check your API key.');
    }
    
    // Fallback to SVG if there's an error with the OpenAI API
    console.log('Falling back to SVG image generation');
    const svgContent = createSvgImage(prompt || 'No prompt provided', 'OpenAI (Fallback)');
    return {
      base64Data: Buffer.from(svgContent).toString('base64'),
      mimeType: 'image/svg+xml'
    };
  }
}

// Simulated MidJourney image generation
async function generateWithMidjourney(prompt: string): Promise<ImageGenerationResult> {
  // In a real implementation, this would call the MidJourney API
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // For demo, return a base64 encoded SVG with the prompt text
  const svgContent = createSvgImage(prompt, 'MidJourney');
  
  return {
    base64Data: Buffer.from(svgContent).toString('base64'),
    mimeType: 'image/svg+xml'
  };
}

// Simulated Gemini image generation
async function generateWithGemini(prompt: string): Promise<ImageGenerationResult> {
  // In a real implementation, this would call the Gemini API
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1800));
  
  // For demo, return a base64 encoded SVG with the prompt text
  const svgContent = createSvgImage(prompt, 'Gemini');
  
  return {
    base64Data: Buffer.from(svgContent).toString('base64'),
    mimeType: 'image/svg+xml'
  };
}

// Helper function to create a simple SVG image with the prompt text
function createSvgImage(prompt: string, model: string): string {
  // Generate a deterministic color based on the prompt
  const hash = Array.from(prompt)
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const hue = hash % 360;
  const saturation = 70;
  const lightness = 60;
  
  // Truncate the prompt if it's too long
  const displayPrompt = prompt.length > 100 
    ? prompt.substring(0, 97) + '...' 
    : prompt;
  
  // Create a simple SVG with the prompt text
  return `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="hsl(${hue}, ${saturation}%, ${lightness}%)" />
      <rect x="10" y="10" width="780" height="580" fill="white" fill-opacity="0.8" rx="15" ry="15" />
      <text x="400" y="100" font-family="Arial" font-size="24" text-anchor="middle" font-weight="bold">
        Generated by ${model}
      </text>
      <text x="400" y="150" font-family="Arial" font-size="18" text-anchor="middle">
        Prompt:
      </text>
      <foreignObject x="100" y="180" width="600" height="300">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial; font-size: 16px; text-align: center; word-wrap: break-word;">
          ${displayPrompt}
        </div>
      </foreignObject>
      <text x="400" y="550" font-family="Arial" font-size="14" text-anchor="middle" fill="#666">
        Generated on ${new Date().toISOString().split('T')[0]}
      </text>
    </svg>
  `;
}
