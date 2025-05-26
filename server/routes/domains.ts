import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Schema for bulk domain addition
const bulkAddDomainsSchema = z.object({
  domains: z.array(z.string().min(1, "Domain cannot be empty"))
});

// Add multiple domains to user account
router.post('/bulk-add', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Validate request body
    const validation = bulkAddDomainsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request data',
        errors: validation.error.errors
      });
    }

    const { domains } = validation.data;

    if (domains.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No domains provided' 
      });
    }

    // Check for existing domains to avoid duplicates
    const existingDomains = await storage.getUserDomains(userId);
    const existingDomainSet = new Set(existingDomains.map(d => d.domain_base?.toLowerCase()));

    // Filter out domains that already exist
    const newDomains = domains.filter(domain => 
      !existingDomainSet.has(domain.toLowerCase())
    );

    if (newDomains.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'All domains already exist in your account' 
      });
    }

    // Add domains in bulk
    const addedDomains = await storage.bulkCreateDomains(
      newDomains.map(domain => ({
        domain_base: domain.toLowerCase(),
        rel_user_id: userId
      }))
    );

    res.json({
      success: true,
      message: `Successfully added ${addedDomains.length} domains`,
      added: addedDomains.length,
      skipped: domains.length - newDomains.length,
      domains: addedDomains
    });

  } catch (error) {
    console.error('Error adding domains:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add domains to your account' 
    });
  }
});

// Get user's domains
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const domains = await storage.getUserDomains(userId);
    
    res.json({
      success: true,
      domains: domains,
      total: domains.length
    });

  } catch (error) {
    console.error('Error fetching domains:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch domains' 
    });
  }
});

// Delete domain
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const domainId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (isNaN(domainId)) {
      return res.status(400).json({ success: false, message: 'Invalid domain ID' });
    }

    // Verify domain belongs to user
    const domain = await storage.getDomain(domainId);
    if (!domain || domain.rel_user_id !== userId) {
      return res.status(404).json({ success: false, message: 'Domain not found' });
    }

    await storage.deleteDomain(domainId);

    res.json({
      success: true,
      message: 'Domain deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting domain:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete domain' 
    });
  }
});

// Bulk delete domains
router.delete('/bulk-delete', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { domainIds } = req.body;
    if (!Array.isArray(domainIds) || domainIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid domain IDs' });
    }

    // Verify all domains belong to user
    const userDomains = await storage.getUserDomains(userId);
    const userDomainIds = new Set(userDomains.map(d => d.id));
    
    const validIds = domainIds.filter(id => userDomainIds.has(parseInt(id)));
    
    if (validIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid domains to delete' });
    }

    await storage.bulkDeleteDomains(validIds);

    res.json({
      success: true,
      message: `Successfully deleted ${validIds.length} domains`,
      deleted: validIds.length
    });

  } catch (error) {
    console.error('Error bulk deleting domains:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete domains' 
    });
  }
});

export default router;