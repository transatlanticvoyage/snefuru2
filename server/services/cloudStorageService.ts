/**
 * Service for uploading images to various cloud storage providers
 */
import { Dropbox } from 'dropbox';
import { Buffer } from 'buffer';

// Initialize Dropbox client with access token
const dropboxClient = new Dropbox({ 
  accessToken: process.env.DROPBOX_ACCESS_TOKEN 
});

// Log if we have a Dropbox token (without revealing it)
console.log(`Dropbox API token status: ${process.env.DROPBOX_ACCESS_TOKEN ? 'Set' : 'Not set'}`);

/**
 * Upload an image to the specified cloud storage
 * @param base64Data The base64-encoded image data
 * @param fileName The name to save the file as
 * @param storageService The cloud storage service to use
 * @returns Promise with the URL of the uploaded image
 */
export async function uploadToCloudStorage(
  base64Data: string,
  fileName: string,
  storageService: string
): Promise<string> {
  console.log(`Uploading image ${fileName} to ${storageService}`);
  
  try {
    switch (storageService) {
      case 'google_drive':
        return await uploadToGoogleDrive(base64Data, fileName);
      case 'dropbox':
        return await uploadToDropbox(base64Data, fileName);
      case 'amazon_s3':
        return await uploadToAmazonS3(base64Data, fileName);
      default:
        throw new Error(`Unsupported storage service: ${storageService}`);
    }
  } catch (error) {
    console.error(`Error uploading to ${storageService}:`, error);
    throw error;
  }
}

// Simulated Google Drive upload
async function uploadToGoogleDrive(base64Data: string, fileName: string): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate a fake Google Drive file ID
  const fileId = generateFakeId();
  
  // In real implementation, we would use a folder ID to upload to specific folder
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

// Real Dropbox upload implementation
async function uploadToDropbox(base64Data: string, fileName: string): Promise<string> {
  console.log(`Starting Dropbox upload for ${fileName}`);
  
  try {
    // Make sure the filename is properly formatted
    const safeFileName = fileName.replace(/[^\w\s.-]/g, '_');
    const fileNameWithExt = safeFileName.endsWith('.jpg') ? safeFileName : `${safeFileName}.jpg`;
    
    // Path in Dropbox where the file will be stored
    const dropboxPath = `/Snefuru/${fileNameWithExt}`;
    
    // Validate that we have valid base64 data
    if (typeof base64Data !== 'string') {
      console.error("Invalid base64 data: not a string");
      throw new Error("The image data is not in a valid format");
    }
    
    try {
      // Convert base64 to binary data for upload
      const fileContent = Buffer.from(base64Data, 'base64');
      console.log(`Prepared ${fileNameWithExt} (${fileContent.length} bytes) for Dropbox upload`);
      
      // Upload file to Dropbox
      const uploadResult = await dropboxClient.filesUpload({
        path: dropboxPath,
        contents: fileContent,
        mode: { '.tag': 'overwrite' }
      });
      
      console.log(`Successfully uploaded ${fileNameWithExt} to Dropbox`, uploadResult);
      
      // Create a shared link for the file
      const uploadPath = typeof uploadResult.result.path_display === 'string' 
        ? uploadResult.result.path_display 
        : dropboxPath;
        
      const sharedLinkResult = await dropboxClient.sharingCreateSharedLinkWithSettings({
        path: uploadPath,
        settings: {
          requested_visibility: { '.tag': 'public' }
        }
      });
      
      console.log(`Created shared link for ${fileNameWithExt}:`, sharedLinkResult);
      
      // Return the shared link URL
      return sharedLinkResult.result.url;
    } catch (apiError: any) {
      // If the shared link already exists, try to get it
      if (apiError?.status === 409 && apiError?.error?.error?.['.tag'] === 'shared_link_already_exists') {
        console.log(`Shared link already exists for ${fileNameWithExt}, retrieving it...`);
        
        const listLinksResult = await dropboxClient.sharingListSharedLinks({
          path: dropboxPath,
          direct_only: true
        });
        
        if (listLinksResult.result.links && listLinksResult.result.links.length > 0) {
          console.log(`Retrieved existing shared link for ${fileNameWithExt}`);
          return listLinksResult.result.links[0].url;
        }
      }
      
      // Re-throw the error if we couldn't handle it
      throw apiError;
    }
  } catch (error: any) {
    console.error(`Error in Dropbox upload:`, error);
    
    // Provide a more helpful error message
    if (error?.status === 401) {
      throw new Error('Failed to upload to Dropbox: Authentication failed. Please check your Dropbox access token.');
    } else if (error?.error?.error_summary) {
      throw new Error(`Failed to upload to Dropbox: ${error.error.error_summary}`);
    } else {
      throw new Error(`Failed to upload to Dropbox: ${error.message || 'Unknown error'}`);
    }
  }
}

// Simulated Amazon S3 upload
async function uploadToAmazonS3(base64Data: string, fileName: string): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Generate a fake S3 bucket name
  const bucketName = 'snefuru-images';
  
  // Clean the filename to be URL-safe
  const safeFileName = fileName.replace(/[^a-z0-9.-]/gi, '_');
  
  // Return a simulated S3 URL
  return `https://${bucketName}.s3.amazonaws.com/${safeFileName}`;
}

// Helper function to generate a fake ID for simulated storage URLs
function generateFakeId(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Generate a 16-character random ID
  for (let i = 0; i < 16; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}
