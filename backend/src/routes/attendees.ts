import { Request, Response, Router } from 'express';
import { supabaseAdmin } from '../supabaseClient';

const router = Router();

import { attachLocalUser } from '../middleware/attachLocalUser';
import { supabaseAuth } from '../middleware/supabaseAuth';

router.post('/', supabaseAuth, attachLocalUser, async (req: Request, res: Response) => {
  const { first_name, last_name } = req.body;
  const localUser = (req as any).localUser;
  if (!localUser || !first_name || !last_name) return res.status(400).json({ error: 'first_name and last_name required' });
  try {
    const { data, error } = await supabaseAdmin.from('attendees').insert({ user_id: localUser.id, first_name, last_name }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ attendee: data });
  } catch (err) {
    res.status(500).json({ error: 'internal' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const { data, error } = await supabaseAdmin.from('attendees').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json({ attendee: data });
});

router.put('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const updates = req.body;
  const { data, error } = await supabaseAdmin.from('attendees').update(updates).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ attendee: data });
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const { error } = await supabaseAdmin.from('attendees').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

export default router;
