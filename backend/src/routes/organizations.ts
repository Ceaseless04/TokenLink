import { Request, Response, Router } from 'express';
import { attachLocalUser } from '../middleware/attachLocalUser';
import { supabaseAuth } from '../middleware/supabaseAuth';
import { supabaseAdmin } from '../supabaseClient';

const router = Router();

router.post('/', supabaseAuth, attachLocalUser, async (req: Request, res: Response) => {
  const localUser = (req as any).localUser;
  const { name, description, slug } = req.body;
  if (!localUser || !name) return res.status(400).json({ error: 'name required' });
  try {
    const { data, error } = await supabaseAdmin.from('organizations').insert({ user_id: localUser.id, name, description, slug }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ organization: data });
  } catch (err) {
    console.error(err);
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
