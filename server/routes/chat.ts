import { Router, type Request, type Response } from 'express';
import OpenAI from 'openai';

const router = Router();

// Initialize OpenAI with the API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Send message to AI and get response
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { message, model = 'gpt-4o', conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a string'
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'OpenAI API key not configured. Please contact administrator.'
      });
    }

    // Prepare conversation history for OpenAI
    const messages: ChatMessage[] = [
      // Add conversation history
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      // Add current user message
      {
        role: 'user' as const,
        content: message
      }
    ];

    // Validate model selection
    const validModels = ['gpt-4o', 'gpt-4', 'gpt-3.5-turbo'];
    const selectedModel = validModels.includes(model) ? model : 'gpt-4o';

    console.log(`Sending message to ${selectedModel}:`, message);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: selectedModel, // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: messages,
      max_tokens: 4000,
      temperature: 0.7,
      stream: false,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No response received from AI model');
    }

    console.log(`Received response from ${selectedModel}`);

    res.json({
      success: true,
      response: response,
      model: selectedModel,
      usage: completion.usage
    });

  } catch (error: any) {
    console.error('Chat API error:', error);

    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({
        success: false,
        message: 'OpenAI API quota exceeded. Please check your billing settings or try again later.'
      });
    }

    if (error.code === 'invalid_api_key') {
      return res.status(401).json({
        success: false,
        message: 'Invalid OpenAI API key. Please contact administrator.'
      });
    }

    if (error.code === 'model_not_found') {
      return res.status(400).json({
        success: false,
        message: 'The requested AI model is not available. Please try a different model.'
      });
    }

    if (error.code === 'context_length_exceeded') {
      return res.status(400).json({
        success: false,
        message: 'Conversation is too long. Please start a new chat or clear the current conversation.'
      });
    }

    // Network or connection errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'Unable to connect to AI service. Please check your internet connection and try again.'
      });
    }

    // Rate limiting
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please wait a moment before sending another message.'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while processing your message. Please try again.'
    });
  }
});

// Get available models
router.get('/models', async (req: Request, res: Response) => {
  try {
    const models = [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Most capable model, excellent for complex tasks',
        category: 'latest'
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        description: 'Advanced reasoning and creative tasks',
        category: 'advanced'
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and efficient for most tasks',
        category: 'standard'
      }
    ];

    res.json({
      success: true,
      models: models
    });

  } catch (error: any) {
    console.error('Models API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available models'
    });
  }
});

// Health check for chat service
router.get('/health', async (req: Request, res: Response) => {
  try {
    const hasApiKey = !!process.env.OPENAI_API_KEY;
    
    res.json({
      success: true,
      status: 'healthy',
      apiKeyConfigured: hasApiKey,
      availableModels: ['gpt-4o', 'gpt-4', 'gpt-3.5-turbo']
    });

  } catch (error: any) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Chat service health check failed'
    });
  }
});

export default router;