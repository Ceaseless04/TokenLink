const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'TokenLink API',
    version: '0.1.0',
    description: 'API documentation for the TokenLink Express backend'
  },
  servers: [
    {
      url: process.env.SWAGGER_SERVER_URL || 'http://localhost:4000/api-docs/',
      description: 'Local server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          supabase_id: { type: 'string' }
        }
      },
      Organization: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' }
        }
      },
      Event: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          start_time: { type: 'string', format: 'date-time' },
          end_time: { type: 'string', format: 'date-time' }
        }
      },
      Attendee: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' }
        }
      },
      OrganizationMember: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          organization_id: { type: 'string' },
          user_id: { type: 'string' },
          role: { type: 'string' }
        }
      }
    }
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current Supabase user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'User object',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/api/users': {
      post: {
        tags: ['Users'],
        summary: 'Create user record',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { email: { type: 'string' }, supabaseId: { type: 'string' } } }
            }
          }
        },
        responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } } }
      }
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by id',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'User', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } }, '404': { description: 'Not found' } }
      }
    },
    '/api/organizations': {
      post: {
        tags: ['Organizations'],
        summary: 'Create organization',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, slug: { type: 'string' } } } } } },
        responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Organization' } } } } }
      }
    },
    '/api/organizations/{id}': {
      get: {
        tags: ['Organizations'],
        summary: 'Get organization by id',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Organization', content: { 'application/json': { schema: { $ref: '#/components/schemas/Organization' } } } }, '404': { description: 'Not found' } }
      }
    },
    '/api/events': {
      post: {
        tags: ['Events'],
        summary: 'Create event',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Event' } } } },
        responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Event' } } } } }
      }
    },
    '/api/events/{id}': {
      get: {
        tags: ['Events'],
        summary: 'Get event by id',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Event', content: { 'application/json': { schema: { $ref: '#/components/schemas/Event' } } } }, '404': { description: 'Not found' } }
      }
    },
    '/api/events/{id}/rsvp': {
      post: {
        tags: ['Events'],
        summary: 'RSVP to event',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { attendee_id: { type: 'string' }, status: { type: 'string' } } } } } },
        responses: { '200': { description: 'RSVP recorded' } }
      }
    },
    '/api/attendees': {
      post: {
        tags: ['Attendees'],
        summary: 'Create attendee',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Attendee' } } } },
        responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Attendee' } } } } }
      }
    },
    '/api/organization_members': {
      post: {
        tags: ['Organization Members'],
        summary: 'Add member to organization',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/OrganizationMember' } } } },
        responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/OrganizationMember' } } } } }
      }
    }
  }
};

export default swaggerSpec;
