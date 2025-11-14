const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SWD392 Project Management API',
      version: '1.0.0',
      description: 'API documentation for SWD392 Project Management System',
      contact: {
        name: 'Development Team',
        email: 'info@swd392.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server'
      },
      {
        url: 'https://api.swd392.com',
        description: 'Production Server'
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
            _id: { type: 'string' },
            studentId: { type: 'string' },
            email: { type: 'string', format: 'email' },
            fullName: { type: 'string' },
            role: { 
              type: 'string', 
              enum: ['student', 'leader', 'lecturer', 'moderator']
            },
            course: { type: 'string' },
            currentClass: { type: 'string' },
            currentGroup: { type: 'string' },
            phone: { type: 'string' },
            major: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Project: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            projectName: { type: 'string' },
            description: { type: 'string' },
            objectives: { type: 'string' },
            techStack: { 
              type: 'array',
              items: { type: 'string' }
            },
            githubRepository: { type: 'string' },
            group: { type: 'string' },
            classCode: { type: 'string' },
            lecturer: { type: 'string' },
            createdBy: { type: 'string' },
            approvalStatus: { 
              type: 'string',
              enum: ['pending', 'approved', 'rejected']
            },
            status: { 
              type: 'string',
              enum: ['draft', 'submitted', 'in-progress', 'completed']
            },
            grade: { type: 'number', min: 0, max: 10 },
            feedback: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Group: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            groupName: { type: 'string' },
            classCode: { type: 'string' },
            course: { type: 'string' },
            leader: { type: 'string' },
            members: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  user: { type: 'string' },
                  joinedAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            status: { 
              type: 'string',
              enum: ['open', 'closed', 'disbanded']
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/auth.js',
    './routes/auth-swagger.js',
    './routes/users.js',
    './routes/users-swagger.js',
    './routes/groups.js',
    './routes/groups-swagger.js',
    './routes/projects.js',
    './routes/projects-swagger.js',
    './routes/courses.js',
    './routes/ai.js'
  ]
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(specs, {
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: 1,
      docExpansion: 'list'
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'SWD392 API Documentation'
  }));
};

module.exports = setupSwagger;
