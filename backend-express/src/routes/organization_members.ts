import { Request, Response, Router } from 'express';
import { supabaseAdmin } from '../supabaseClient';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { organization_id, user_id, role = 'member' } = req.body;
  if (!organization_id || !user_id) return res.status(400).json({ error: 'organization_id and user_id required' });
  try {
    const { data, error } = await supabaseAdmin.from('organization_members').insert({ organization_id, user_id, role }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ membership: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const { data, error } = await supabaseAdmin.from('organization_members').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json({ membership: data });
});

router.put('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const updates = req.body;
  const { data, error } = await supabaseAdmin.from('organization_members').update(updates).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ membership: data });
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const { error } = await supabaseAdmin.from('organization_members').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

export default router;
