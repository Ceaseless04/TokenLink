import request from 'supertest';
import app from '../app';

// Use require to avoid TS type issues with swagger-parser in test env
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SwaggerParser = require('swagger-parser');

describe('OpenAPI / Swagger', () => {
  it('serves /api-docs.json and is a valid OpenAPI document', async () => {
    const res = await request(app).get('/api-docs.json').expect(200);
    const api = res.body;

    // Validate using swagger-parser (throws if invalid)
    await SwaggerParser.validate(api);

    expect(api.components).toBeDefined();
    expect(api.components.securitySchemes).toBeDefined();
    expect(api.components.securitySchemes.bearerAuth).toBeDefined();
    expect(api.paths['/api/health']).toBeDefined();
  });
});
