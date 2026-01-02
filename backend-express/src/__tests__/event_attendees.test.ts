import request from 'supertest';
import app from '../app';

const mockRsvp = { id: 'rsvp-1', event_id: 'event-1', attendee_id: 'att-1', status: 'going', guests: 1 };

jest.mock('../supabaseClient', () => {
  const fromMock = (table: string) => ({
    upsert: jest.fn((payload: any) => ({
      select: jest.fn(() => ({ single: jest.fn(async () => ({ data: { id: 'rsvp-1', ...payload }, error: null } )) }))
    })),
    insert: jest.fn(async (payload: any) => ({ data: { id: 'event-1', ...payload[0] }, error: null })),
    select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(async () => ({ data: { id: 'event-1' }, error: null })) })) }))
  });
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
