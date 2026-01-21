import request from 'supertest';
import app from '../app';

// Mock supabaseAdmin.auth.getUser
jest.mock('../supabaseClient', () => {
  return {
    supabaseAdmin: {
      auth: {
        getUser: jest.fn(async (token: string) => {
          if (token === 'valid-token') return { data: { user: { id: 'user-1', email: 'a@b.com' } }, error: null };
          return { data: null, error: { message: 'Invalid token' } };
        }),
      },
    },
  };
});

describe('Supabase Auth middleware', () => {
  it('returns 401 without Authorization header', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
  });

  it('returns user with valid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: 'user-1', email: 'a@b.com' });
  });
});
