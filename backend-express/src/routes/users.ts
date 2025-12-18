import { Request, Response, Router } from 'express';
import { supabaseAdmin } from '../supabaseClient';

const router = Router();

// Create a user record that links to a Supabase user via supabase_id
router.post('/', async (req: Request, res: Response) => {
  const { email, supabaseId } = req.body;
  if (!email || !supabaseId) return res.status(400).json({ error: 'email and supabaseId required' });
  try {
    const { data, error } = await supabaseAdmin.from('users').insert({ email, supabase_id: supabaseId }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ user: data });
  } catch (err) {
    res.status(500).json({ error: 'internal' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const { data, error } = await supabaseAdmin.from('users').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json({ user: data });
});

router.put('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const updates = req.body;
  const { data, error } = await supabaseAdmin.from('users').update(updates).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data });
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const { error } = await supabaseAdmin.from('users').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

export default router;
