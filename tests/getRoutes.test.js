const express = require('express');
const request = require('supertest');

jest.mock('../models/writeOperations', () => ({
  deleteDocument: jest.fn(),
  getAllDocument: jest.fn(),
  getOneDocument: jest.fn(),
}));

const model = require('../models/writeOperations');
const originalRoutes = require('../routes/writeOperations');
const maintenanceReservationRoutes = require('../routes/maintenanceReservationsWrite');
const authenticationRoutes = require('../routes/index');

const app = express();
app.use(express.json());

let authenticated = true;
app.use((req, res, next) => {
  req.isAuthenticated = () => authenticated;
  next();
});

app.use('/', originalRoutes);
app.use('/', maintenanceReservationRoutes);

const authenticationApp = express();
authenticationApp.use((req, res, next) => {
  req.isAuthenticated = () => authenticated;
  req.logout = (callback) => {
    authenticated = false;
    callback();
  };
  next();
});
authenticationApp.use(authenticationRoutes);
authenticationApp.use(originalRoutes);

const validId = '507f1f77bcf86cd799439011';

const collections = [
  ['inventory', '/inventory'],
  ['customers', '/customers'],
  ['maintenance', '/maintenance/order'],
  ['reservations', '/reservations'],
];

const deletableCollections = [
  ['reservations', '/reservations'],
  ['maintenance', '/maintenance/order'],
];

beforeEach(() => {
  jest.resetAllMocks();
  authenticated = true;
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe.each(collections)('%s GET routes', (collectionName, path) => {
  test('GET all returns documents and status 200', async () => {
    const documents = [{ _id: validId }];
    model.getAllDocument.mockResolvedValue(documents);

    const response = await request(app).get(path);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(documents);
    expect(model.getAllDocument).toHaveBeenCalledWith(collectionName);
  });

  test('GET by ID returns the matching document and status 200', async () => {
    const document = { _id: validId };
    model.getOneDocument.mockResolvedValue(document);

    const response = await request(app).get(`${path}/${validId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(document);
    expect(model.getOneDocument).toHaveBeenCalledWith(
      collectionName,
      validId
    );
  });

  test('GET by ID rejects an invalid ID with status 400', async () => {
    const response = await request(app).get(`${path}/abc`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid document ID' });
    expect(model.getOneDocument).not.toHaveBeenCalled();
  });

  test('GET by ID returns 404 when the document does not exist', async () => {
    model.getOneDocument.mockResolvedValue(null);

    const response = await request(app).get(`${path}/${validId}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Document not found' });
    expect(model.getOneDocument).toHaveBeenCalledWith(
      collectionName,
      validId
    );
  });

  test('GET all handles database errors with status 500', async () => {
    model.getAllDocument.mockRejectedValue(new Error('Database unavailable'));

    const response = await request(app).get(path);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });

  test('GET by ID handles database errors with status 500', async () => {
    model.getOneDocument.mockRejectedValue(new Error('Database unavailable'));

    const response = await request(app).get(`${path}/${validId}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});

describe.each(deletableCollections)('%s DELETE route', (collectionName, path) => {
  test('DELETE returns status 204 on success', async () => {
    model.deleteDocument.mockResolvedValue({ deletedCount: 1 });

    const response = await request(app).delete(`${path}/${validId}`);

    expect(response.status).toBe(204);
    expect(model.deleteDocument).toHaveBeenCalledWith(collectionName, validId);
  });

  test('DELETE rejects an invalid ID with status 400', async () => {
    const response = await request(app).delete(`${path}/abc`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid document ID' });
    expect(model.deleteDocument).not.toHaveBeenCalled();
  });

  test('DELETE returns 404 when the document does not exist', async () => {
    model.deleteDocument.mockResolvedValue({ deletedCount: 0 });

    const response = await request(app).delete(`${path}/${validId}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Document not found' });
    expect(model.deleteDocument).toHaveBeenCalledWith(collectionName, validId);
  });

  test('DELETE handles database errors with status 500', async () => {
    model.deleteDocument.mockRejectedValue(new Error('Database unavailable'));

    const response = await request(app).delete(`${path}/${validId}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });

  test('DELETE requires authentication and returns status 401 otherwise', async () => {
    authenticated = false;

    const response = await request(app).delete(`${path}/${validId}`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'Authentication required. Please log in through GitHub.',
    });
    expect(model.deleteDocument).not.toHaveBeenCalled();
  });
});

describe('logout route', () => {
  test('GET /logout redirects to API docs and protected POST returns 401 afterward', async () => {
    authenticated = true;

    const logoutResponse = await request(authenticationApp).get('/logout');
    const writeResponse = await request(authenticationApp)
      .post('/inventory')
      .send({ name: 'Unauthenticated item' });

    expect(logoutResponse.status).toBe(302);
    expect(logoutResponse.headers.location).toBe('/api-docs');
    expect(writeResponse.status).toBe(401);
    expect(writeResponse.body).toEqual({
      error: 'Authentication required. Please log in through GitHub.',
    });
  });
});
