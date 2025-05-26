import { Router, type Request, type Response } from 'express';
import { storage } from '../storage';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { insertRedditOrganicPositionSchema } from '@shared/schema';
import { z } from 'zod';
import multer from 'multer';
import * as XLSX from 'xlsx';

// Extend AuthRequest to include file property
interface AuthRequestWithFile extends AuthRequest {
  file?: Express.Multer.File;
}

const router = Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Get Reddit organic positions for the authenticated user
router.get('/organic-positions', async (req: Request, res: Response) => {
  try {
    // For now, use a default user ID of 1 to test functionality
    const userId = 1;
    const positions = await storage.getRedditOrganicPositionsByUserId(userId);
    res.json(positions);
  } catch (error) {
    console.error('Error fetching Reddit organic positions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch organic positions' 
    });
  }
});

// Upload and process Excel file with Reddit organic positions
router.post('/upload-positions', upload.single('file'), async (req: AuthRequestWithFile, res: Response) => {
  try {
    // For now, use a default user ID of 1 to test functionality
    const userId = 1;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Parse the Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'File must contain header row and at least one data row' 
      });
    }

    // Get headers and data rows
    const headers = jsonData[0] as string[];
    const dataRows = jsonData.slice(1) as any[][];

    // Map common header variations to our schema fields
    const headerMapping: { [key: string]: string } = {
      'keyword': 'keyword',
      'keywords': 'keyword',
      'search term': 'keyword',
      'url': 'url',
      'landing page': 'url',
      'page url': 'url',
      'domain': 'domain',
      'hostname': 'domain',
      'position': 'position',
      'rank': 'position',
      'ranking': 'position',
      'previous position': 'previous_position',
      'prev position': 'previous_position',
      'last position': 'previous_position',
      'position change': 'position_change',
      'change': 'position_change',
      'search volume': 'search_volume',
      'volume': 'search_volume',
      'monthly searches': 'search_volume',
      'cpc': 'cpc',
      'cost per click': 'cpc',
      'avg cpc': 'cpc',
      'competition': 'competition',
      'comp': 'competition',
      'difficulty': 'difficulty',
      'traffic': 'traffic',
      'organic traffic': 'traffic',
      'traffic cost': 'traffic_cost',
      'timestamp': 'timestamp',
      'date': 'timestamp',
      'location': 'location',
      'country': 'location',
      'geo': 'location',
      'device': 'device',
      'search engine': 'search_engine',
      'engine': 'search_engine',
      'language': 'language',
      'lang': 'language',
      'date captured': 'date_captured',
      'capture date': 'date_captured',
      'serp features': 'serp_features',
      'features': 'serp_features',
      'visibility': 'visibility',
      'estimated clicks': 'estimated_clicks',
      'clicks': 'estimated_clicks',
      'click through rate': 'click_through_rate',
      'ctr': 'click_through_rate',
      'title': 'title',
      'page title': 'title',
      'description': 'description',
      'meta description': 'meta_description',
      'meta desc': 'meta_description',
      'h1 tag': 'h1_tag',
      'h1': 'h1_tag',
      'word count': 'word_count',
      'words': 'word_count',
      'page authority': 'page_authority',
      'pa': 'page_authority',
      'domain authority': 'domain_authority',
      'da': 'domain_authority',
      'backlinks': 'backlinks',
      'links': 'backlinks',
      'referring domains': 'referring_domains',
      'ref domains': 'referring_domains',
      'social shares': 'social_shares',
      'shares': 'social_shares'
    };

    // Create mapping from Excel columns to our schema
    const columnMap: { [key: number]: string } = {};
    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().trim();
      const mappedField = headerMapping[normalizedHeader];
      if (mappedField) {
        columnMap[index] = mappedField;
      }
    });

    // Ensure we have required fields
    const hasKeyword = Object.values(columnMap).includes('keyword');
    const hasUrl = Object.values(columnMap).includes('url');
    
    if (!hasKeyword || !hasUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'File must contain at least "keyword" and "url" columns' 
      });
    }

    // Process data rows and create position records
    const positions = [];
    const skippedRows = [];
    
    for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex++) {
      const row = dataRows[rowIndex];
      
      // Skip empty rows
      if (!row || row.every(cell => !cell)) continue;

      try {
        const positionData: any = {
          user_id: userId,
          search_engine: 'google',
          language: 'en'
        };

        // Map data from row to our schema
        Object.entries(columnMap).forEach(([colIndex, fieldName]) => {
          const value = row[parseInt(colIndex)];
          if (value !== undefined && value !== null && value !== '') {
            // Handle numeric fields
            if (['position', 'previous_position', 'position_change', 'search_volume', 'traffic', 'estimated_clicks', 'word_count', 'backlinks', 'referring_domains', 'social_shares'].includes(fieldName)) {
              const numValue = parseFloat(String(value));
              if (!isNaN(numValue)) {
                positionData[fieldName] = Math.round(numValue);
              }
            } else if (['cpc', 'traffic_cost', 'difficulty', 'visibility', 'click_through_rate', 'page_authority', 'domain_authority'].includes(fieldName)) {
              // Handle decimal/string fields that shouldn't be rounded
              positionData[fieldName] = String(value).trim();
            } else {
              // Handle string fields - ensure they're not too long
              const stringValue = String(value).trim();
              if (fieldName === 'keyword' && stringValue.length > 500) {
                positionData[fieldName] = stringValue.substring(0, 500);
              } else if (fieldName === 'url' && stringValue.length > 2048) {
                positionData[fieldName] = stringValue.substring(0, 2048);
              } else if (fieldName === 'domain' && stringValue.length > 255) {
                positionData[fieldName] = stringValue.substring(0, 255);
              } else {
                positionData[fieldName] = stringValue;
              }
            }
          }
        });

        // Ensure required fields are present
        if (positionData.keyword && positionData.url) {
          // Extract domain from URL if not provided
          if (!positionData.domain && positionData.url) {
            try {
              const urlObj = new URL(positionData.url);
              positionData.domain = urlObj.hostname;
            } catch (e) {
              // If URL parsing fails, use the first part of the URL
              const urlParts = positionData.url.split('/');
              if (urlParts.length > 2) {
                positionData.domain = urlParts[2];
              }
            }
          }

          // Validate the data before adding
          if (positionData.keyword.length > 0 && positionData.url.length > 0) {
            positions.push(positionData);
          } else {
            skippedRows.push(rowIndex + 2); // +2 because of header row and 0-based index
          }
        } else {
          skippedRows.push(rowIndex + 2); // +2 because of header row and 0-based index
        }
      } catch (error) {
        console.error(`Error processing row ${rowIndex + 2}:`, error);
        skippedRows.push(rowIndex + 2);
      }
    }

    if (positions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No valid data rows found in the file' 
      });
    }

    // Bulk insert positions
    const createdPositions = await storage.bulkCreateRedditOrganicPositions(positions);

    let message = `Successfully imported ${createdPositions.length} records`;
    if (skippedRows.length > 0) {
      message += `. Skipped ${skippedRows.length} rows due to missing required data (rows: ${skippedRows.join(', ')})`;
    }

    res.json({ 
      success: true, 
      message: message,
      count: createdPositions.length,
      skipped: skippedRows.length 
    });

  } catch (error) {
    console.error('Error processing uploaded file:', error);
    console.error('Error stack:', (error as Error).stack);
    
    let errorMessage = 'Failed to process uploaded file';
    if (error instanceof Error) {
      if (error.message.includes('call stack')) {
        errorMessage = 'File too large or complex. Please try uploading smaller batches of data.';
      } else {
        errorMessage = 'Failed to process uploaded file: ' + error.message;
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage
    });
  }
});

// Delete multiple Reddit organic positions
router.delete('/organic-positions/bulk-delete', async (req: Request, res: Response) => {
  try {
    const userId = 1;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or empty IDs array' 
      });
    }

    // Verify all positions belong to the authenticated user
    for (const id of ids) {
      const position = await storage.getRedditOrganicPosition(id);
      if (!position || position.user_id !== userId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Unauthorized to delete these records' 
        });
      }
    }

    await storage.deleteRedditOrganicPositions(ids);

    res.json({ 
      success: true, 
      message: 'Records deleted successfully',
      deletedCount: ids.length 
    });

  } catch (error) {
    console.error('Error deleting Reddit organic positions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete records' 
    });
  }
});

// Get a single Reddit organic position
router.get('/organic-positions/:id', async (req: Request, res: Response) => {
  try {
    const userId = 1;
    const positionId = parseInt(req.params.id);

    if (isNaN(positionId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid position ID' 
      });
    }

    const position = await storage.getRedditOrganicPosition(positionId);

    if (!position) {
      return res.status(404).json({ 
        success: false, 
        message: 'Position not found' 
      });
    }

    if (position.user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to access this position' 
      });
    }

    res.json(position);

  } catch (error) {
    console.error('Error fetching Reddit organic position:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch position' 
    });
  }
});

// Scrape URLs using ScraperAPI
router.post('/scrape-urls', async (req: Request, res: Response) => {
  try {
    const userId = 1;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or empty IDs array' 
      });
    }

    // Get ScraperAPI key from environment variables
    const scraperApiKey = process.env.SCRAPERAPI_KEY;
    if (!scraperApiKey) {
      return res.status(400).json({
        success: false,
        message: 'ScraperAPI key not configured. Please add your ScraperAPI key to environment variables.'
      });
    }

    let scrapedCount = 0;
    let failedCount = 0;

    // Process each URL
    for (const id of ids) {
      try {
        // Get the position record
        const position = await storage.getRedditOrganicPosition(id);
        if (!position || position.user_id !== userId) {
          console.log(`Skipping unauthorized record ${id}`);
          failedCount++;
          continue;
        }

        if (!position.url) {
          console.log(`Skipping record ${id} - no URL`);
          failedCount++;
          continue;
        }

        // Import node-fetch dynamically
        const fetch = (await import('node-fetch')).default;

        // Encode the URL for ScraperAPI
        const encodedUrl = encodeURIComponent(position.url);
        const scraperUrl = `https://api.scraperapi.com/?api_key=${scraperApiKey}&url=${encodedUrl}`;

        console.log(`Scraping URL: ${position.url}`);

        // Make request to ScraperAPI
        const response = await fetch(scraperUrl, {
          method: 'GET',
          timeout: 30000, // 30 second timeout
        });

        if (response.ok) {
          const pageContent = await response.text();
          
          // Update the record with scraped content
          await storage.updateRedditOrganicPosition(id, {
            raw_page_fetched_1: pageContent
          });

          console.log(`Successfully scraped ${position.url}`);
          scrapedCount++;
        } else {
          console.error(`Failed to scrape ${position.url}: ${response.status} ${response.statusText}`);
          failedCount++;
        }

      } catch (error) {
        console.error(`Error scraping URL for record ${id}:`, error);
        failedCount++;
      }
    }

    res.json({ 
      success: true, 
      message: `Scraping completed: ${scrapedCount} successful, ${failedCount} failed`,
      scraped_count: scrapedCount,
      failed_count: failedCount
    });

  } catch (error) {
    console.error('Error scraping URLs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to scrape URLs' 
    });
  }
});

export default router;