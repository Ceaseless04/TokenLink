import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../supabaseClient';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export interface SupabaseUser {
  id: string;
  email?: string;
  [k: string]: any;
}

export async function supabaseAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });

  const tokenMatch = authHeader.match(/Bearer (.+)/);
  if (!tokenMatch) return res.status(401).json({ error: 'Invalid Authorization format' });

  const token = tokenMatch[1];

  try {
    // Use Supabase admin client to get user info from the token
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid or expired token' });
    (req as any).supabaseUser = data.user;
    next();
  } catch (err) {
    next(err);
  }
}
