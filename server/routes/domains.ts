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
    
    // Filter out empty domains and duplicates
    const filteredDomains = validatedData.domains.filter(domain => domain.trim().length > 0);
    const seenDomains = new Set<string>();
    const uniqueDomains: string[] = [];
    
    for (const domain of filteredDomains) {
      if (!seenDomains.has(domain)) {
        seenDomains.add(domain);
        uniqueDomains.push(domain);
      }
    }
    
    if (uniqueDomains.length === 0) {
      return res.status(400).json({ 
        message: 'No valid domains provided',
        success: false 
      });
    }
    
    // Prepare domains for bulk insert
    const domainsToInsert = uniqueDomains.map(domain => ({
      domain_base: domain.trim(),
      rel_user_id: userId
    }));
    
    const insertedDomains = await storage.bulkCreateDomains(domainsToInsert);
    
    res.json({ 
      message: `Successfully added ${insertedDomains.length} domains`,
      added: insertedDomains.length,
      domains: insertedDomains,
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