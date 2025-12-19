import { Router, Request, Response } from 'express';
import { cacheService } from '../services/CacheService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Cache health check endpoint (admin only)
router.get('/health', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Only allow admin users to check cache health
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const health = await cacheService.healthCheck();
    
    res.json({
      success: true,
      data: {
        cache: health,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Cache health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check cache health'
    });
  }
});

// Clear cache endpoint (admin only)
router.delete('/clear', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Only allow admin users to clear cache
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    await cacheService.clear();
    
    res.json({
      success: true,
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
});

// Cache statistics endpoint (admin only)
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Only allow admin users to view cache stats
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const health = await cacheService.healthCheck();
    
    // Get some sample cache keys for debugging
    const sampleKeys = [
      'popular_events',
      'analytics:daily',
      'event:sample'
    ];
    
    const keyStatus: Record<string, boolean> = {};
    for (const key of sampleKeys) {
      keyStatus[key] = await cacheService.exists(key);
    }

    res.json({
      success: true,
      data: {
        health: health,
        sampleKeys: keyStatus,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache statistics'
    });
  }
});

export default router;