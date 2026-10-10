const express = require('express');
const controller = require('../controllers/maintenanceReservationsWrite');
const { isAuthenticated } = require('../middleware/authenticate');

const router = express.Router();

router.get(
  '/maintenance/order',
  /*
    #swagger.tags = ['Maintenance']
    #swagger.summary = 'List all maintenance orders'
    #swagger.description = 'Returns every maintenance order in the collection.'
    #swagger.responses[200] = {
      description: 'Maintenance orders returned'
    }
    #swagger.responses[500] = {
      description: 'Internal server error'
    }
  */
  controller.getMaintenanceAll
);

router.get(
  '/maintenance/order/:id',
  /*
    #swagger.tags = ['Maintenance']
    #swagger.summary = 'Get a maintenance order by ID'
    #swagger.description = 'Returns the maintenance order matching the supplied MongoDB ObjectId.'
    #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      type: 'string',
      description: 'The 24-character MongoDB ID of the maintenance order'
    }
    #swagger.responses[200] = {
      description: 'Maintenance order returned'
    }
    #swagger.responses[400] = {
      description: 'Invalid document ID'
    }
    #swagger.responses[404] = {
      description: 'Maintenance order not found'
    }
    #swagger.responses[500] = {
      description: 'Internal server error'
    }
  */
  controller.getMaintenanceById
);

router.post(
  '/maintenance/order',
  /*
    #swagger.tags = ['Maintenance']
    #swagger.summary = 'Create a maintenance order'
    #swagger.description = 'All fields are required. inventoryId must identify an existing inventory item. scheduledDate uses YYYY-MM-DD. status: scheduled, in-progress, completed, or cancelled. cost must be zero or greater.'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { $ref: '#/definitions/Maintenance' }
    }
    #swagger.responses[201] = {
      description: 'Created. The response contains the new document id.',
      schema: { id: '507f1f77bcf86cd799439011' }
    }
    #swagger.responses[400] = {
      description: 'Invalid fields or inventory reference'
    }
    #swagger.responses[401] = {
      description: 'Authentication required. Please log in through GitHub.'
    }
    #swagger.responses[500] = {
      description: 'Internal server error'
    }
  */
  isAuthenticated,
  controller.createMaintenance
);

router.put(
  '/maintenance/order/:id',
  /*
    #swagger.tags = ['Maintenance']
    #swagger.summary = 'Update a maintenance order'
    #swagger.description = 'Send all fields. inventoryId must identify an existing inventory item. scheduledDate uses YYYY-MM-DD. status: scheduled, in-progress, completed, or cancelled. cost must be zero or greater.'
    #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      type: 'string',
      description: 'The 24-character MongoDB ID of the maintenance order'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { $ref: '#/definitions/Maintenance' }
    }
    #swagger.responses[204] = {
      description: 'Updated successfully. No response body.'
    }
    #swagger.responses[400] = {
      description: 'Invalid ID, fields, or inventory reference'
    }
    #swagger.responses[401] = {
      description: 'Authentication required. Please log in through GitHub.'
    }
    #swagger.responses[404] = {
      description: 'Maintenance order not found'
    }
    #swagger.responses[500] = {
      description: 'Internal server error'
    }
  */
  isAuthenticated,
  controller.updateMaintenance
);

router.get(
  '/reservations',
  /*
    #swagger.tags = ['Reservations']
    #swagger.summary = 'List all reservations'
    #swagger.description = 'Returns every reservation in the collection.'
    #swagger.responses[200] = {
      description: 'Reservations returned'
    }
    #swagger.responses[500] = {
      description: 'Internal server error'
    }
  */
  controller.getReservationAll
);

router.get(
  '/reservations/:id',
  /*
    #swagger.tags = ['Reservations']
    #swagger.summary = 'Get a reservation by ID'
    #swagger.description = 'Returns the reservation matching the supplied MongoDB ObjectId.'
    #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      type: 'string',
      description: 'The 24-character MongoDB ID of the reservation'
    }
    #swagger.responses[200] = {
      description: 'Reservation returned'
    }
    #swagger.responses[400] = {
      description: 'Invalid document ID'
    }
    #swagger.responses[404] = {
      description: 'Reservation not found'
    }
    #swagger.responses[500] = {
      description: 'Internal server error'
    }
  */
  controller.getReservationById
);

router.post(
  '/reservations',
  /*
    #swagger.tags = ['Reservations']
    #swagger.summary = 'Create a reservation'
    #swagger.description = 'All fields are required. inventoryId and customerId must identify existing documents. Dates use YYYY-MM-DD. endDate must be on or after startDate. status: pending, confirmed, completed, or cancelled.'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { $ref: '#/definitions/Reservation' }
    }
    #swagger.responses[201] = {
      description: 'Created. The response contains the new document id.',
      schema: { id: '507f1f77bcf86cd799439011' }
    }
    #swagger.responses[400] = {
      description: 'Invalid fields, dates, or document references'
    }
    #swagger.responses[401] = {
      description: 'Authentication required. Please log in through GitHub.'
    }
    #swagger.responses[500] = {
      description: 'Internal server error'
    }
  */
  isAuthenticated,
  controller.createReservation
);

router.put(
  '/reservations/:id',
  /*
    #swagger.tags = ['Reservations']
    #swagger.summary = 'Update a reservation'
    #swagger.description = 'Send all fields. inventoryId and customerId must identify existing documents. Dates use YYYY-MM-DD. endDate must be on or after startDate. status: pending, confirmed, completed, or cancelled.'
    #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      type: 'string',
      description: 'The 24-character MongoDB ID of the reservation'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { $ref: '#/definitions/Reservation' }
    }
    #swagger.responses[204] = {
      description: 'Updated successfully. No response body.'
    }
    #swagger.responses[400] = {
      description: 'Invalid ID, fields, dates, or document references'
    }
    #swagger.responses[401] = {
      description: 'Authentication required. Please log in through GitHub.'
    }
    #swagger.responses[404] = {
      description: 'Reservation not found'
    }
    #swagger.responses[500] = {
      description: 'Internal server error'
    }
  */
  isAuthenticated,
  controller.updateReservation
);

module.exports = router;