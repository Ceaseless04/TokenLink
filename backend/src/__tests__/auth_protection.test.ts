import request from 'supertest';
import app from '../app';

describe('Protected endpoints require auth', () => {
  it('POST /api/organizations should return 401 without auth', async () => {
    const res = await request(app).post('/api/organizations').send({ name: 'x' });
    expect(res.status).toBe(401);
  });

  it('POST /api/events should return 401 without auth', async () => {
    const res = await request(app).post('/api/events').send({ club_id: '1', title: 't', start_time: '2026-01-01', end_time: '2026-01-01' });
    expect(res.status).toBe(401);
  });

  it('POST /api/events/:id/rsvp should return 401 without auth', async () => {
    const res = await request(app).post('/api/events/abc/rsvp').send({ attendee_id: 'x' });
    expect(res.status).toBe(401);
  });
});