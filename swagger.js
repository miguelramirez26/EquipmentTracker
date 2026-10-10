const swaggerAutogen = require('swagger-autogen')();
const fs = require('node:fs');

const authenticationDescription =
  'Open /auth/github in a browser tab to sign in with GitHub, then return to /api-docs. Do not use Swagger Execute for login or logout.';

const doc = {
  info: {
    title: 'Equipment Tracker API',
    description:
      'API for managing inventory, customers, maintenance orders, and reservations. ' +
      authenticationDescription,
  },
  host: null,
  schemes: null,
  securityDefinitions: {
    githubAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Cookie',
      description: authenticationDescription,
    },
  },
  definitions: {
    Inventory: {
      name: 'Excavator',
      description: 'Tracked excavator for construction work.',
      category: 'Heavy Machinery',
      serialNumber: 'EXC-001',
      dailyRate: 1500,
      status: 'available',
      condition: 'Good',
    },
    Customer: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-123-4567',
    },
    Maintenance: {
      inventoryId: '507f1f77bcf86cd799439011',
      description: 'Leo Swagger maintenance test',
      scheduledDate: '2026-10-15',
      status: 'scheduled',
      cost: 30,
    },
    Reservation: {
      inventoryId: '507f1f77bcf86cd799439011',
      customerId: '507f1f77bcf86cd799439012',
      startDate: '2026-10-15',
      endDate: '2026-10-16',
      status: 'pending',
    },
  },
};

const outputFile = './swagger-output.json';

const endpointsFiles = [
  './routes/index.js',
  './routes/writeOperations.js',
  './routes/maintenanceReservationsWrite.js',
];

swaggerAutogen(outputFile, endpointsFiles, doc)
  .then(() => {
    const swaggerDocument = JSON.parse(
      fs.readFileSync(outputFile, 'utf8')
    );

    for (const path of Object.values(swaggerDocument.paths)) {
      for (const method of ['post', 'put', 'delete']) {
        if (path[method]) {
          path[method].security = [{ githubAuth: [] }];
        }
      }
    }

    fs.writeFileSync(
      outputFile,
      `${JSON.stringify(swaggerDocument, null, 2)}\n`
    );
  })
  .catch((error) => {
    console.error('Failed to generate secured Swagger documentation:', error);
    process.exitCode = 1;
  });