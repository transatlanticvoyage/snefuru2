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

// POST /api/domains/bulk-add - Add multiple domains
router.post('/bulk-add', async (req: any, res) => {
  try {
    const validatedData = bulkDomainsSchema.parse(req.body);
    
    // For now, we'll use a hardcoded user ID of 1
    // In a real app, this would come from authentication middleware
    const userId = 1;
    
    // Filter out empty domains and normalize
    const filteredDomains = validatedData.domains
      .filter(domain => domain.trim().length > 0)
      .map(domain => domain.trim().toLowerCase());
    
    if (filteredDomains.length === 0) {
      return res.status(400).json({ 
        message: 'No valid domains provided',
        success: false 
      });
    }
    
    // Get existing domains for this user to check for duplicates
    const existingDomains = await storage.getUserDomains(userId);
    const existingDomainSet = new Set(
      existingDomains.map(domain => domain.domain_base?.toLowerCase()).filter(Boolean)
    );
    
    // Remove duplicates from input list and check against existing domains
    const seenInInput = new Set<string>();
    const newDomains: string[] = [];
    const duplicatesInInput: string[] = [];
    const duplicatesInDb: string[] = [];
    
    for (const domain of filteredDomains) {
      if (seenInInput.has(domain)) {
        duplicatesInInput.push(domain);
      } else if (existingDomainSet.has(domain)) {
        duplicatesInDb.push(domain);
      } else {
        seenInInput.add(domain);
        newDomains.push(domain);
      }
    }
    
    let insertedDomains: any[] = [];
    if (newDomains.length > 0) {
      // Prepare domains for bulk insert
      const domainsToInsert = newDomains.map(domain => ({
        domain_base: domain,
        rel_user_id: userId
      }));
      
      insertedDomains = await storage.bulkCreateDomains(domainsToInsert);
    }
    
    // Create detailed response message
    let message = '';
    const totalDuplicates = duplicatesInInput.length + duplicatesInDb.length;
    
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
      duplicatesInInput: duplicatesInInput.length,
      duplicatesInDatabase: duplicatesInDb.length,
      totalDuplicates: totalDuplicates,
      domains: insertedDomains,
      skippedDomains: [...duplicatesInInput, ...duplicatesInDb],
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