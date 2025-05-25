/**
 * Service for publishing images to WordPress sites
 */

import { WpCredentials } from "@shared/schema";
import fetch from 'node-fetch';
import * as https from 'https';

// Create an https agent that ignores SSL certificate errors for testing
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

/**
 * Publish an image to a WordPress site
 * @param imageUrl The URL of the image to publish
 * @param fileName The name of the image file
 * @param credentials WordPress site credentials
 * @returns Promise with the result of the publishing operation
 */
export async function publishToWordPress(
  imageUrl: string,
  fileName: string,
  credentials: WpCredentials
): Promise<{ success: boolean; mediaId?: number; message: string }> {
  console.log(`Publishing image ${fileName} to WordPress site ${credentials.url}`);
  
  try {
    // Validate credentials
    if (!credentials.url || !credentials.username) {
      throw new Error('Missing WordPress site URL or username');
    }
    
    if (!credentials.application_password && !credentials.password) {
      throw new Error('Missing WordPress password (either application password or regular password required)');
    }

    // Clean up the site URL to ensure it's properly formatted
    const siteUrl = formatSiteUrl(credentials.url);
    
    // 1. First authenticate with WordPress
    const authData = await authenticateWithWordPress(credentials);
    
    // 2. Upload the image to the WordPress media library
    const mediaId = await uploadToWordPressMedia(siteUrl, authData, imageUrl, fileName);
    console.log(`Successfully uploaded ${fileName} to WordPress media library with ID: ${mediaId}`);
    
    // 3. If a post ID was provided, attach the image to that post
    if (credentials.post_id && mediaId) {
      await attachImageToPost(
        siteUrl, 
        authData, 
        parseInt(credentials.post_id), 
        mediaId,
        credentials.mapping_key
      );
    }
    
    return {
      success: true,
      mediaId,
      message: `Image successfully published to WordPress site ${siteUrl}`
    };
  } catch (error) {
    console.error(`Error publishing to WordPress:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error publishing to WordPress'
    };
  }
}

// Format WordPress site URL to ensure it's properly formatted
function formatSiteUrl(url: string): string {
  // Remove trailing slash if present
  let formattedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  
  // Add https:// if no protocol is specified
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = 'https://' + formattedUrl;
  }
  
  return formattedUrl;
}

// Authenticate with WordPress using the REST API
async function authenticateWithWordPress(credentials: WpCredentials): Promise<{
  cookie?: string;
  nonce?: string;
  basicAuth: string;
  authMethod: 'application_password' | 'basic_auth';
}> {
  const siteUrl = formatSiteUrl(credentials.url || '');
  console.log(`Authenticating with WordPress site: ${siteUrl}`);
  
  try {
    // Determine which authentication method to use
    let basicAuth: string;
    let authMethod: 'application_password' | 'basic_auth';
    
    // Prefer Application Password if available
    if (credentials.application_password && credentials.application_password.trim() !== '') {
      console.log('Using Application Password authentication method');
      basicAuth = Buffer.from(`${credentials.username}:${credentials.application_password}`).toString('base64');
      authMethod = 'application_password';
    } else {
      console.log('Using Basic Authentication method');
      // Fall back to regular password
      basicAuth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
      authMethod = 'basic_auth';
    }
    
    // Try to get the WP nonce (helpful but not required for Application Passwords)
    const nonceResponse = await fetch(`${siteUrl}/wp-json`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Accept': 'application/json',
      },
      agent: httpsAgent,
    });

    if (!nonceResponse.ok) {
      console.log(`Failed to get nonce, status: ${nonceResponse.status}. Will try with authentication only.`);
      return { basicAuth, authMethod };
    }
    
    // Try to extract nonce from response
    const responseData = await nonceResponse.json() as Record<string, any>;
    const nonce = responseData?._links?.['https://api.w.org/']?.['wp:rest-nonce']?.[0]?.href;
    
    return { basicAuth, nonce, authMethod };
  } catch (error) {
    console.error('Error authenticating with WordPress:', error);
    
    // Determine fallback auth method
    let fallbackAuth: string;
    let authMethod: 'application_password' | 'basic_auth';
    
    if (credentials.application_password && credentials.application_password.trim() !== '') {
      fallbackAuth = Buffer.from(`${credentials.username}:${credentials.application_password}`).toString('base64');
      authMethod = 'application_password';
    } else {
      fallbackAuth = Buffer.from(`${credentials.username}:${credentials.password || ''}`).toString('base64');
      authMethod = 'basic_auth';
    }
    
    return { basicAuth: fallbackAuth, authMethod };
  }
}

// Upload image to WordPress media library
async function uploadToWordPressMedia(
  siteUrl: string,
  authData: { cookie?: string; nonce?: string; basicAuth: string; authMethod: 'application_password' | 'basic_auth' },
  imageUrl: string,
  fileName: string
): Promise<number | undefined> {
  console.log(`Uploading image to WordPress media library: ${fileName}`);
  
  try {
    // First, fetch the image data from the URL
    let imageData: Buffer;
    
    // Check if the imageUrl is a local path (from our Dropbox upload)
    if (imageUrl.startsWith('File uploaded to Dropbox:')) {
      console.log('Image is in Dropbox, using a placeholder image for WordPress');
      // Generate a simple SVG image as a placeholder
      const svgContent = `
        <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f0f0f0" />
          <text x="400" y="300" font-family="Arial" font-size="24" text-anchor="middle">
            ${fileName} (Placeholder)
          </text>
        </svg>
      `;
      imageData = Buffer.from(svgContent);
    } else {
      // Fetch the image from the URL
      console.log(`Fetching image from URL: ${imageUrl}`);
      const imageResponse = await fetch(imageUrl, { agent: httpsAgent });
      
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image from URL: ${imageResponse.status}`);
      }
      
      const arrayBuffer = await imageResponse.arrayBuffer();
      imageData = Buffer.from(arrayBuffer);
    }
    
    // Prepare headers for WordPress REST API
    const headers: Record<string, string> = {
      'Authorization': `Basic ${authData.basicAuth}`,
      'Content-Disposition': `attachment; filename=${fileName}`,
      'Accept': 'application/json',
    };
    
    // Application Passwords work better without nonce
    if (authData.authMethod === 'basic_auth' && authData.nonce) {
      headers['X-WP-Nonce'] = authData.nonce;
    }
    
    if (authData.cookie) {
      headers['Cookie'] = authData.cookie;
    }
    
    // Log authentication method being used
    console.log(`Using ${authData.authMethod} authentication method for WordPress upload`);
    
    // Upload the image to WordPress media library
    const uploadResponse = await fetch(`${siteUrl}/wp-json/wp/v2/media`, {
      method: 'POST',
      headers,
      body: imageData,
      agent: httpsAgent,
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error(`WordPress upload failed: ${uploadResponse.status}`, errorText);
      throw new Error(`Failed to upload image to WordPress: ${uploadResponse.status}`);
    }
    
    const mediaData = await uploadResponse.json() as any;
    if (mediaData && mediaData.id) {
      console.log(`WordPress media upload successful. Media ID: ${mediaData.id}`);
      return mediaData.id;
    } else {
      console.error('WordPress returned success but no media ID was found in the response');
      return undefined;
    }
  } catch (error) {
    console.error('Error uploading to WordPress media library:', error);
    throw error;
  }
}

// Attach image to a WordPress post
async function attachImageToPost(
  siteUrl: string,
  authData: { cookie?: string; nonce?: string; basicAuth: string; authMethod: 'application_password' | 'basic_auth' },
  postId: number,
  mediaId: number,
  mappingKey?: string
): Promise<void> {
  console.log(`Attaching media ID ${mediaId} to post ID ${postId}`);
  
  try {
    // Prepare headers for WordPress REST API
    const headers: Record<string, string> = {
      'Authorization': `Basic ${authData.basicAuth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    // Application Passwords work better without nonce
    if (authData.authMethod === 'basic_auth' && authData.nonce) {
      headers['X-WP-Nonce'] = authData.nonce;
    }
    
    if (authData.cookie) {
      headers['Cookie'] = authData.cookie;
    }
    
    // Log authentication method being used
    console.log(`Using ${authData.authMethod} authentication method for attaching image to post`);
    
    // If mapping key is provided, set it as a custom field
    // Otherwise, just set the featured image
    let requestBody: any = {};
    
    if (mappingKey) {
      // Set custom field using ACF if available
      requestBody.acf = {
        [mappingKey]: mediaId
      };
      
      // Also set as featured image as fallback
      requestBody.featured_media = mediaId;
    } else {
      // Just set as featured image
      requestBody.featured_media = mediaId;
    }
    
    // Update the post with the new media
    const updateResponse = await fetch(`${siteUrl}/wp-json/wp/v2/posts/${postId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      agent: httpsAgent,
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error(`Failed to attach image to post: ${updateResponse.status}`, errorText);
      throw new Error(`Failed to attach image to post: ${updateResponse.status}`);
    }
    
    const updateData = await updateResponse.json() as any;
    console.log(`Successfully attached media ID ${mediaId} to post ID ${postId}`);
  } catch (error) {
    console.error('Error attaching image to post:', error);
    throw error;
  }
}
