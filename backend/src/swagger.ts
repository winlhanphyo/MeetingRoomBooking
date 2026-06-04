import type { OAS3Options } from 'swagger-jsdoc';

export const swaggerOptions: OAS3Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Meeting Room Booking API',
      version: '1.0.0',
      description: 'REST API for managing meeting room bookings, users, and summaries.',
    },
    servers: [{ url: 'http://localhost:8000', description: 'Local development' }],
    components: {
      securitySchemes: {
        UserIdHeader: {
          type: 'apiKey',
          in: 'header',
          name: 'X-User-Id',
          description: 'ID of the authenticated user (obtained from GET /api/users/select)',
        },
      },
      schemas: {
        UserRole: { type: 'string', enum: ['admin', 'owner', 'user'] },
        UserBrief: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            role: { $ref: '#/components/schemas/UserRole' },
          },
        },
        User: {
          allOf: [
            { $ref: '#/components/schemas/UserBrief' },
            {
              type: 'object',
              properties: { createdAt: { type: 'string', format: 'date-time' } },
            },
          ],
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            User: { $ref: '#/components/schemas/UserBrief' },
          },
        },
        BookingSummaryEntry: {
          type: 'object',
          properties: {
            userId: { type: 'integer' },
            name: { type: 'string' },
            role: { $ref: '#/components/schemas/UserRole' },
            totalBookings: { type: 'integer' },
            bookings: { type: 'array', items: { $ref: '#/components/schemas/Booking' } },
          },
        },
        Error: {
          type: 'object',
          properties: { error: { type: 'string' } },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          responses: { '200': { description: 'Server is running' } },
        },
      },

      '/api/users/select': {
        get: {
          tags: ['Users'],
          summary: 'List users for login selector (public)',
          responses: {
            '200': {
              description: 'Array of users',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/UserBrief' } },
                },
              },
            },
          },
        },
      },

      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'List all users with timestamps (admin only)',
          security: [{ UserIdHeader: [] }],
          responses: {
            '200': {
              description: 'Array of users',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                },
              },
            },
            '401': { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        post: {
          tags: ['Users'],
          summary: 'Create a user (admin only)',
          security: [{ UserIdHeader: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string' },
                    role: { $ref: '#/components/schemas/UserRole' },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Created user',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
            },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '401': { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '409': { description: 'Duplicate name', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },

      '/api/users/{id}': {
        delete: {
          tags: ['Users'],
          summary: 'Delete a user and their bookings (admin only)',
          security: [{ UserIdHeader: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            '200': { description: 'User deleted' },
            '400': { description: 'Cannot delete own account', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '401': { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '404': { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },

      '/api/users/{id}/role': {
        patch: {
          tags: ['Users'],
          summary: 'Change a user\'s role (admin only)',
          security: [{ UserIdHeader: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['role'],
                  properties: { role: { $ref: '#/components/schemas/UserRole' } },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Updated user',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/UserBrief' } } },
            },
            '400': { description: 'Invalid role', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '401': { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '404': { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },

      '/api/bookings': {
        get: {
          tags: ['Bookings'],
          summary: 'List all bookings (any authenticated user)',
          security: [{ UserIdHeader: [] }],
          responses: {
            '200': {
              description: 'Array of bookings',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/Booking' } },
                },
              },
            },
            '401': { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        post: {
          tags: ['Bookings'],
          summary: 'Create a booking (any authenticated user)',
          security: [{ UserIdHeader: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['startTime', 'endTime'],
                  properties: {
                    startTime: { type: 'string', format: 'date-time', example: '2026-06-10T09:00:00Z' },
                    endTime: { type: 'string', format: 'date-time', example: '2026-06-10T10:00:00Z' },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Created booking',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Booking' } } },
            },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '401': { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '409': { description: 'Time slot conflict', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },

      '/api/bookings/summary': {
        get: {
          tags: ['Bookings'],
          summary: 'Booking summary per user (owner or admin)',
          security: [{ UserIdHeader: [] }],
          responses: {
            '200': {
              description: 'Summary array',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/BookingSummaryEntry' } },
                },
              },
            },
            '401': { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },

      '/api/bookings/{id}': {
        delete: {
          tags: ['Bookings'],
          summary: 'Delete a booking (own for user; any for owner/admin)',
          security: [{ UserIdHeader: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            '200': { description: 'Booking deleted' },
            '401': { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '404': { description: 'Booking not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
    },
  },
  apis: [],
};
