const express = require('express');
const request = require('supertest');
jest.mock('../models/writeOperations', () => ({
  getAllDocument: jest.fn(),
  getOneDocument: jest.fn(),
}));
const model = require('../models/writeOperations');
const routes = require('../routes/writeOperations');
const maintenanceReservationRoutes = require('../routes/maintenanceReservationsWrite');
const authenticationRoutes = require('../routes/index');

const app = express();
app.use('/', routes);
app.use('/', maintenanceReservationRoutes);

let authenticated = true;
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
authenticationApp.use(routes);

afterEach(() => jest.clearAllMocks());

describe('GET inventory routes', () => {
  test('GET /inventory returns all inventory items with status 200', async () => {
    const inventory = [{ _id: 'item-1', name: 'Excavator' }];
    model.getAllDocument.mockResolvedValue(inventory);

    const response = await request(app).get('/inventory');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(inventory);
    expect(model.getAllDocument).toHaveBeenCalledWith('inventory');
  });

  test('GET /inventory/:id returns 404 for a valid but nonexistent ID', async () => {
    const id = '507f1f77bcf86cd799439011';
    model.getOneDocument.mockResolvedValue(null);

    const response = await request(app).get(`/inventory/${id}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Document not found' });
    expect(model.getOneDocument).toHaveBeenCalledWith('inventory', id);
  });
});

describe('GET customer routes', () => {
  test('GET /customers returns all customers with status 200', async () => {
    const customers = [{ _id: 'customer-1', firstName: 'Ada' }];
    model.getAllDocument.mockResolvedValue(customers);

    const response = await request(app).get('/customers');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(customers);
    expect(model.getAllDocument).toHaveBeenCalledWith('customers');
  });

  test('GET /customers/:id returns 404 for a valid but nonexistent ID', async () => {
    const id = '507f1f77bcf86cd799439012';
    model.getOneDocument.mockResolvedValue(null);

    const response = await request(app).get(`/customers/${id}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Document not found' });
    expect(model.getOneDocument).toHaveBeenCalledWith('customers', id);
  });
});

describe('GET maintenance routes', () => {
  test('GET /maintenance/order returns all maintenance orders with status 200', async () => {
    const maintenance = [{ _id: 'maintenance-1', description: 'Inspection' }];
    model.getAllDocument.mockResolvedValue(maintenance);

    const response = await request(app).get('/maintenance/order');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(maintenance);
    expect(model.getAllDocument).toHaveBeenCalledWith('maintenance');
  });

  test('GET /maintenance/order/:id returns 404 for a valid but nonexistent ID', async () => {
    const id = '507f1f77bcf86cd799439013';
    model.getOneDocument.mockResolvedValue(null);

    const response = await request(app).get(`/maintenance/order/${id}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Document not found' });
    expect(model.getOneDocument).toHaveBeenCalledWith('maintenance', id);
  });
});

describe('GET reservation routes', () => {
  test('GET /reservations returns all reservations with status 200', async () => {
    const reservations = [{ _id: 'reservation-1', status: 'pending' }];
    model.getAllDocument.mockResolvedValue(reservations);

    const response = await request(app).get('/reservations');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(reservations);
    expect(model.getAllDocument).toHaveBeenCalledWith('reservations');
  });

  test('GET /reservations/:id returns 404 for a valid but nonexistent ID', async () => {
    const id = '507f1f77bcf86cd799439014';
    model.getOneDocument.mockResolvedValue(null);

    const response = await request(app).get(`/reservations/${id}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Document not found' });
    expect(model.getOneDocument).toHaveBeenCalledWith('reservations', id);
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
