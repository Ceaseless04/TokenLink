import { Request, Response, Router } from 'express';
import { attachLocalUser } from '../middleware/attachLocalUser';
import { requireOrgRole } from '../middleware/requireOrgRole';
import { supabaseAuth } from '../middleware/supabaseAuth';
import { supabaseAdmin } from '../supabaseClient';

const router = Router();

router.post('/', supabaseAuth, attachLocalUser, requireOrgRole({ body: 'club_id' }, ['organizer','admin']), async (req: Request, res: Response) => {
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

// Basic RSVP endpoint (simple upsert). Capacity enforcement and atomic checks will be implemented in a later step.
router.post('/:id/rsvp', supabaseAuth, attachLocalUser, async (req: Request, res: Response) => {
  const event_id = req.params.id;
  const { attendee_id, status = 'going', guests = 0 } = req.body;
  if (!attendee_id) return res.status(400).json({ error: 'attendee_id required' });
  try {
    // Ensure attendee belongs to the authenticated user
    const { data: attendee, error: aErr } = await supabaseAdmin.from('attendees').select('id, user_id').eq('id', attendee_id).single();
    if (aErr || !attendee) return res.status(404).json({ error: 'attendee not found' });
    const localUser = (req as any).localUser;
    if (attendee.user_id !== localUser.id) return res.status(403).json({ error: 'Attendee does not belong to authenticated user' });

    const { data, error } = await supabaseAdmin.from('event_attendees').upsert({ event_id, attendee_id, status, guests }, { onConflict: 'event_id,attendee_id' }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ rsvp: data });
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
