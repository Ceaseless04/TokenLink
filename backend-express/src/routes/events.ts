import { Request, Response, Router } from 'express';
import { supabaseAdmin } from '../supabaseClient';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { club_id, title, description, start_time, end_time, location, capacity } = req.body;
  if (!club_id || !title || !start_time || !end_time) return res.status(400).json({ error: 'club_id, title, start_time and end_time required' });
  try {
    const { data, error } = await supabaseAdmin.from('events').insert({ club_id, title, description, start_time, end_time, location, capacity }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ event: data });
  } catch (err) {
    res.status(500).json({ error: 'internal' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const { data, error } = await supabaseAdmin.from('events').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json({ event: data });
});

router.put('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const updates = req.body;
  const { data, error } = await supabaseAdmin.from('events').update(updates).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ event: data });
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const { error } = await supabaseAdmin.from('events').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

export default router;
