const model = require('../models/writeOperations');
const {
  isValidId,
  validateBody,
} = require('../validators/maintenanceReservations');

async function validateReferences(collectionName, data) {
  const errors = [];

  const inventory = await model.getOneDocument(
    'inventory',
    data.inventoryId
  );

  if (!inventory) {
    errors.push('inventoryId does not match an existing inventory item');
  }

  if (collectionName === 'reservations') {
    const customer = await model.getOneDocument(
      'customers',
      data.customerId
    );

    if (!customer) {
      errors.push('customerId does not match an existing customer');
    }
  }

  return errors;
}

function createWriteController(collectionName, resourcePath) {
  async function getAll(req, res) {
    try {
      const result = await model.getAllDocument(collectionName);

      return res.status(200).json(result);
    } catch (error) {
      console.error(`Failed to get from ${collectionName}:`, error.message);

      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  async function getById(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(400).json({
          error: 'Invalid document ID',
        });
      }

      const result = await model.getOneDocument(collectionName, id);

      if (!result) {
        return res.status(404).json({
          error: 'Document not found',
        });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(`Failed to get from ${collectionName}:`, error.message);

      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  async function create(req, res) {
    try {
      const { errors, data } = validateBody(collectionName, req.body);

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const referenceErrors = await validateReferences(collectionName, data);

      if (referenceErrors.length > 0) {
        return res.status(400).json({ errors: referenceErrors });
      }

      const result = await model.createDocument(collectionName, data);

      return res
        .location(`${resourcePath}/${result.insertedId}`)
        .status(201)
        .json({ id: result.insertedId });
    } catch (error) {
      console.error(`Failed to create ${collectionName}:`, error.message);

      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  async function update(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(400).json({
          error: 'Invalid document ID',
        });
      }

      const { errors, data } = validateBody(collectionName, req.body);

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const existing = await model.getOneDocument(collectionName, id);

      if (!existing) {
        return res.status(404).json({
          error: 'Document not found',
        });
      }

      const referenceErrors = await validateReferences(collectionName, data);

      if (referenceErrors.length > 0) {
        return res.status(400).json({ errors: referenceErrors });
      }

      const result = await model.updateDocument(collectionName, id, data);

      if (result.matchedCount === 0) {
        return res.status(404).json({
          error: 'Document not found',
        });
      }

      return res.status(204).send();
    } catch (error) {
      console.error(`Failed to update ${collectionName}:`, error.message);

      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  async function remove(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(400).json({
          error: 'Invalid document ID',
        });
      }

      const result = await model.deleteDocument(collectionName, id);

      if (result.deletedCount === 0) {
        return res.status(404).json({
          error: 'Document not found',
        });
      }

      return res.status(204).send();
    } catch (error) {
      console.error(`Failed to delete ${collectionName}:`, error.message);

      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  return { create, update, remove, getAll, getById };
}

const maintenance = createWriteController(
  'maintenance',
  '/maintenance/order'
);

const reservations = createWriteController(
  'reservations',
  '/reservations'
);

module.exports = {
  createMaintenance: maintenance.create,
  updateMaintenance: maintenance.update,
  deleteMaintenance: maintenance.remove,
  getMaintenanceAll: maintenance.getAll,
  getMaintenanceById: maintenance.getById,
  createReservation: reservations.create,
  updateReservation: reservations.update,
  deleteReservation: reservations.remove,
  getReservationAll: reservations.getAll,
  getReservationById: reservations.getById,
};