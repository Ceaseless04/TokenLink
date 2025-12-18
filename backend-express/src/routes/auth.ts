import { Router, Request, Response } from 'express';
import { supabaseAuth } from '../middleware/supabaseAuth';

const router = Router();

// Simple protected route that returns current user info (fetched from Supabase)
router.get('/me', supabaseAuth, async (req: Request, res: Response) => {
  const user = (req as any).supabaseUser;
  res.json({ user });
});

export default router;
