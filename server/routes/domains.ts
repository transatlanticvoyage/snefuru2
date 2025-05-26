import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Schema for bulk domain addition
const bulkDomainsSchema = z.object({
  domains: z.array(z.string().min(1, "Domain cannot be empty"))
});

// Schema for bulk domain deletion
const bulkDeleteSchema = z.object({
  domainIds: z.array(z.number())
});

// GET /api/domains - Get all domains for the authenticated user
router.get('/', async (req: any, res) => {
  try {
    // For now, we'll use a hardcoded user ID of 1
    // In a real app, this would come from authentication middleware
    const userId = 1;
    
    const domains = await storage.getUserDomains(userId);
    
    res.json({ 
      domains,
      total: domains.length,
      success: true 
    });
  } catch (error) {
    console.error('Error fetching domains:', error);
    res.status(500).json({ 
      message: 'Failed to fetch domains',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/domains/bulk-add - Add multiple domains with proper duplicate prevention
router.post('/bulk-add', async (req: any, res) => {
  try {
    const validatedData = bulkDomainsSchema.parse(req.body);
    const userId = 1; // For now, using hardcoded user ID
    
    // Filter and normalize input domains
    const inputDomains = validatedData.domains
      .filter(domain => domain && domain.trim().length > 0)
      .map(domain => domain.trim().toLowerCase());
    
    if (inputDomains.length === 0) {
      return res.status(400).json({ 
        message: 'No valid domains provided',
        success: false 
      });
    }
    
    // Get ALL existing domains for this user from database
    const existingDomains = await storage.getUserDomains(userId);
    const existingDomainNames = new Set<string>();
    
    existingDomains.forEach(domain => {
      if (domain.domain_base) {
        existingDomainNames.add(domain.domain_base.toLowerCase().trim());
      }
    });
    
    // Process input domains to find duplicates
    const processedDomains = {
      newDomains: [] as string[],
      inputDuplicates: [] as string[],
      dbDuplicates: [] as string[]
    };
    
    const seenInThisRequest = new Set<string>();
    
    for (const domainName of inputDomains) {
      const normalizedDomain = domainName.toLowerCase().trim();
      
      if (seenInThisRequest.has(normalizedDomain)) {
        // Duplicate within this request
        processedDomains.inputDuplicates.push(domainName);
      } else if (existingDomainNames.has(normalizedDomain)) {
        // Already exists in database
        processedDomains.dbDuplicates.push(domainName);
      } else {
        // New domain to add
        processedDomains.newDomains.push(domainName);
        seenInThisRequest.add(normalizedDomain);
      }
    }
    
    // Insert only new domains
    let insertedDomains: any[] = [];
    if (processedDomains.newDomains.length > 0) {
      const domainsToInsert = processedDomains.newDomains.map(domain => ({
        domain_base: domain,
        rel_user_id: userId
      }));
      
      insertedDomains = await storage.bulkCreateDomains(domainsToInsert);
    }
    
    // Create response message
    const totalDuplicates = processedDomains.inputDuplicates.length + processedDomains.dbDuplicates.length;
    let message = '';
    
    if (insertedDomains.length > 0 && totalDuplicates > 0) {
      message = `Successfully added ${insertedDomains.length} new domains. Skipped ${totalDuplicates} duplicates`;
    } else if (insertedDomains.length > 0) {
      message = `Successfully added ${insertedDomains.length} domains`;
    } else if (totalDuplicates > 0) {
      message = `No new domains added. All ${totalDuplicates} domains were duplicates`;
    } else {
      message = 'No domains processed';
    }
    
    res.json({ 
      message,
      added: insertedDomains.length,
      duplicatesInInput: processedDomains.inputDuplicates.length,
      duplicatesInDatabase: processedDomains.dbDuplicates.length,
      totalDuplicates: totalDuplicates,
      domains: insertedDomains,
      skippedDomains: [...processedDomains.inputDuplicates, ...processedDomains.dbDuplicates],
      success: true 
    });
  } catch (error) {
    console.error('Error adding domains:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid input data',
        errors: error.errors,
        success: false 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to add domains',
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    });
  }
});

// DELETE /api/domains/bulk-delete - Delete multiple domains
router.delete('/bulk-delete', async (req: any, res) => {
  try {
    const validatedData = bulkDeleteSchema.parse(req.body);
    
    if (validatedData.domainIds.length === 0) {
      return res.status(400).json({ 
        message: 'No domain IDs provided',
        success: false 
      });
    }
    
    await storage.bulkDeleteDomains(validatedData.domainIds);
    
    res.json({ 
      message: `Successfully deleted ${validatedData.domainIds.length} domains`,
      deleted: validatedData.domainIds.length,
      success: true 
    });
  } catch (error) {
    console.error('Error deleting domains:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid input data',
        errors: error.errors,
        success: false 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to delete domains',
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    });
  }
});

// DELETE /api/domains/:id - Delete a single domain
router.delete('/:id', async (req: any, res) => {
  try {
    const domainId = parseInt(req.params.id);
    
    if (isNaN(domainId)) {
      return res.status(400).json({ 
        message: 'Invalid domain ID',
        success: false 
      });
    }
    
    await storage.deleteDomain(domainId);
    
    res.json({ 
      message: 'Domain deleted successfully',
      success: true 
    });
  } catch (error) {
    console.error('Error deleting domain:', error);
    res.status(500).json({ 
      message: 'Failed to delete domain',
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    });
  }
});

export default router;