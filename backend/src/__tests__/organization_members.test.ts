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

const mockMembership = { id: 'mem-1', organization_id: 'org-1', user_id: 'user-1', role: 'organizer' };

jest.mock('../supabaseClient', () => {
  const fromMock = (table: string) => {
    const chainForSelect = (result: any) => {
      const single = jest.fn(async () => ({ data: result, error: null }));
      const eq: any = jest.fn(() => ({ eq, single }));
      return { single, eq };
    };

    return {
      insert: jest.fn((payload: any) => ({ select: jest.fn(() => chainForSelect({ ...mockMembership, ...payload[0] })) })),
      select: jest.fn(() => chainForSelect(mockMembership)),
      update: jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(() => chainForSelect(mockMembership)) })) })),
      delete: jest.fn(() => ({ eq: jest.fn(async () => ({ error: null })) }))
    };
  };
  return { supabaseAdmin: { from: fromMock } };
});

describe('Organization Members CRUD routes', () => {
  it('creates a membership', async () => {
    const res = await request(app).post('/api/organization_members').send({ organization_id: 'org-1', user_id: 'user-1', role: 'member' });
    expect(res.status).toBe(201);
    expect(res.body.membership).toMatchObject({ organization_id: 'org-1', user_id: 'user-1' });
  });

  it('rejects missing fields', async () => {
    const res = await request(app).post('/api/organization_members').send({ user_id: 'user-1' });
    expect(res.status).toBe(400);
  });

  it('gets membership by id', async () => {
    const res = await request(app).get('/api/organization_members/mem-1');
    expect(res.status).toBe(200);
    expect(res.body.membership).toMatchObject({ id: 'mem-1' });
  });

  it('updates membership', async () => {
    const res = await request(app).put('/api/organization_members/mem-1').send({ role: 'admin' });
    expect(res.status).toBe(200);
    expect(res.body.membership).toMatchObject({ role: 'organizer' });
  });

  it('deletes membership', async () => {
    const res = await request(app).delete('/api/organization_members/mem-1');
    expect(res.status).toBe(204);
  });
});
