import { Request, Response, Router } from 'express';
import { supabaseAdmin } from '../supabaseClient';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { user_id, name, description, slug } = req.body;
  if (!user_id || !name) return res.status(400).json({ error: 'user_id and name required' });
  try {
    const { data, error } = await supabaseAdmin.from('organizations').insert({ user_id, name, description, slug }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ organization: data });
  } catch (err) {
    res.status(500).json({ error: 'internal' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const { data, error } = await supabaseAdmin.from('organizations').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json({ organization: data });
});

router.put('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const updates = req.body;
  const { data, error } = await supabaseAdmin.from('organizations').update(updates).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ organization: data });
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const { error } = await supabaseAdmin.from('organizations').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

export default router;
