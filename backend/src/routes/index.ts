import { Router } from 'express';
import attendees from './attendees';
import auth from './auth';
import events from './events';
import organizationMembers from './organization_members';
import organizations from './organizations';
import users from './users';

const router = Router();

router.use('/auth', auth);
router.use('/users', users);
router.use('/organizations', organizations);
router.use('/organization_members', organizationMembers);
router.use('/attendees', attendees);
router.use('/events', events);

router.get('/health', (_, res) => res.json({ status: 'ok' }));

export default router;
