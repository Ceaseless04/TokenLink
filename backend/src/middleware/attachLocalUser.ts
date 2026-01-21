import { NextFunction, Request, Response } from 'express';
import { supabaseAdmin } from '../supabaseClient';

export async function attachLocalUser(req: Request, res: Response, next: NextFunction) {
  const supaUser = (req as any).supabaseUser;
  if (!supaUser) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('supabase_id', supaUser.id)
      .single();

    if (error || !data) return res.status(403).json({ error: 'Local user not found' });

    (req as any).localUser = data;
    next();
  } catch (err) {
    next(err);
  }
}
