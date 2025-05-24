export interface SpreadsheetCell {
  value: string;
  row: number;
  col: number;
}

export interface CloudStorageCredentials {
  type: 'google_drive' | 'dropbox' | 'amazon_s3';
  // Any additional fields needed for authentication
}

export interface GeneratedImage {
  id: number;
  url: string;
  prompt: string;
  fileName: string;
  batchId: number;
  createdAt: string;
}

export type AIModelType = 'openai' | 'midjourney' | 'gemini';
export type StorageType = 'google_drive' | 'dropbox' | 'amazon_s3';

export interface GenerationProgress {
  status: 'idle' | 'generating' | 'uploading' | 'publishing' | 'complete' | 'error';
  progress: number;
  message: string;
  error?: string;
}
