import request from 'supertest';
import app from '../app';

const mockMembership = { id: 'mem-1', organization_id: 'org-1', user_id: 'user-1', role: 'member' };

jest.mock('../supabaseClient', () => {
  const fromMock = (table: string) => ({
    insert: jest.fn((payload: any) => ({ select: jest.fn(() => ({ single: jest.fn(async () => ({ data: { ...mockMembership, ...payload[0] }, error: null })) })) })),
    select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(async () => ({ data: mockMembership, error: null })) })) })),
    update: jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(async () => ({ data: mockMembership, error: null }) ) })) })) })),
    delete: jest.fn(() => ({ eq: jest.fn(async () => ({ error: null })) }))
  });
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
    expect(res.body.membership).toMatchObject({ role: 'member' });
  });

  it('deletes membership', async () => {
    const res = await request(app).delete('/api/organization_members/mem-1');
    expect(res.status).toBe(204);
  });
});
