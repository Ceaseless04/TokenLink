import request from 'supertest';
import app from '../app';
// Mock auth and attachLocalUser middleware used by protected routes
jest.mock('../middleware/supabaseAuth', () => ({
  supabaseAuth: jest.fn((req: any, _res: any, next: any) => {
    req.supabaseUser = { id: 'auth-user-1', email: 'a@b.com' };
    next();
  })
}));
jest.mock('../middleware/attachLocalUser', () => ({
  attachLocalUser: jest.fn((req: any, _res: any, next: any) => {
    req.localUser = { id: 'user-1' };
    next();
  })
}));
const mockRsvp = { id: 'rsvp-1', event_id: 'event-1', attendee_id: 'att-1', status: 'going', guests: 1 };

jest.mock('../supabaseClient', () => {
  const fromMock = (table: string) => {
    const chainForSelect = (result: any) => {
      const single = jest.fn(async () => ({ data: result, error: null }));
      const eq: any = jest.fn(() => ({ eq, single }));
      return { single, eq };
    };

    if (table === 'attendees') {
      return {
        select: jest.fn(() => chainForSelect({ id: 'att-1', user_id: 'user-1' }))
      };
    }

    return {
      upsert: jest.fn((payload: any) => ({ select: jest.fn(() => chainForSelect({ id: 'rsvp-1', ...payload })) })),
      insert: jest.fn(async (payload: any) => ({ data: { id: 'event-1', ...payload[0] }, error: null })),
      select: jest.fn(() => chainForSelect({ id: 'event-1' }))
    };
  };
  return { supabaseAdmin: { from: fromMock } };
});

describe('Event RSVP routes', () => {
  it('creates an RSVP', async () => {
    const res = await request(app).post('/api/events/event-1/rsvp').send({ attendee_id: 'att-1', guests: 1 });
    expect(res.status).toBe(201);
    expect(res.body.rsvp).toMatchObject({ event_id: 'event-1', attendee_id: 'att-1', guests: 1 });
  });

  it('rejects missing attendee_id', async () => {
    const res = await request(app).post('/api/events/event-1/rsvp').send({ guests: 1 });
    expect(res.status).toBe(400);
  });
});
