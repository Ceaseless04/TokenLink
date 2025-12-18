import request from 'supertest';
import app from '../app';

const mockOrg = { id: 'org-1', user_id: 'user-1', name: 'Test Org', description: 'desc', slug: 'test-org' };

jest.mock('../supabaseClient', () => {
  const fromMock = (table: string) => ({
    insert: jest.fn(async (payload: any) => ({ data: { ...mockOrg, ...payload[0] }, error: null })),
    select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(async () => ({ data: mockOrg, error: null })) })) })),
    update: jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(async () => ({ data: mockOrg, error: null }) ) })) })),
    delete: jest.fn(() => ({ eq: jest.fn(async () => ({ error: null })) }))
  });
  return { supabaseAdmin: { from: fromMock } };
});

describe('Organizations CRUD routes', () => {
  it('creates an organization', async () => {
    const res = await request(app).post('/api/organizations').send({ user_id: 'user-1', name: 'Test Org', description: 'desc', slug: 'test-org' });
    expect(res.status).toBe(201);
    expect(res.body.organization).toMatchObject({ name: 'Test Org' });
  });

  it('gets organization by id', async () => {
    const res = await request(app).get('/api/organizations/org-1');
    expect(res.status).toBe(200);
    expect(res.body.organization).toMatchObject({ id: 'org-1' });
  });
});
