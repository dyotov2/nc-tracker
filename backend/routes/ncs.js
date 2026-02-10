const express = require('express');
const router = express.Router();
const db = require('../database');
const { sendAssignmentEmail, sendStatusChangeEmail } = require('../emailService');

// Get all NCs with optional filters
router.get('/', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      severity: req.query.severity,
      category: req.query.category,
      department: req.query.department,
      search: req.query.search
    };

    const ncs = await db.getAllNCs(filters);
    res.json(ncs);
  } catch (error) {
    console.error('Error fetching NCs:', error);
    res.status(500).json({ error: 'Failed to fetch non-conformances' });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get NCs needing effectiveness check
router.get('/effectiveness-checks', async (req, res) => {
  try {
    const ncs = await db.getNeedingEffectivenessCheck();
    res.json(ncs);
  } catch (error) {
    console.error('Error fetching effectiveness checks:', error);
    res.status(500).json({ error: 'Failed to fetch effectiveness checks' });
  }
});

// Get single NC by ID
router.get('/:id', async (req, res) => {
  try {
    const nc = await db.getNCById(req.params.id);
    if (!nc) {
      return res.status(404).json({ error: 'Non-conformance not found' });
    }
    res.json(nc);
  } catch (error) {
    console.error('Error fetching NC:', error);
    res.status(500).json({ error: 'Failed to fetch non-conformance' });
  }
});

// Create new NC
router.post('/', async (req, res) => {
  try {
    const { title, description, date_reported, status, severity } = req.body;

    // Validation
    if (!title || !description || !date_reported || !status || !severity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const nc = await db.createNC(req.body);

    // Send assignment email if someone is assigned
    if (nc.responsible_person && nc.responsible_person_email) {
      sendAssignmentEmail(nc, nc.responsible_person, nc.responsible_person_email);
    }

    res.status(201).json(nc);
  } catch (error) {
    console.error('Error creating NC:', error);
    res.status(500).json({ error: 'Failed to create non-conformance' });
  }
});

// Update NC
router.put('/:id', async (req, res) => {
  try {
    const oldNC = await db.getNCById(req.params.id);
    if (!oldNC) {
      return res.status(404).json({ error: 'Non-conformance not found' });
    }

    const updatedNC = await db.updateNC(req.params.id, req.body);

    // Send email if assignment changed
    const assignmentChanged = req.body.responsible_person_email &&
                             req.body.responsible_person_email !== oldNC.responsible_person_email;
    if (assignmentChanged && req.body.responsible_person) {
      sendAssignmentEmail(updatedNC, req.body.responsible_person, req.body.responsible_person_email);
    }

    // Send email if status changed and someone is assigned
    const statusChanged = req.body.status && req.body.status !== oldNC.status;
    if (statusChanged && updatedNC.responsible_person_email) {
      sendStatusChangeEmail(
        updatedNC,
        updatedNC.responsible_person,
        updatedNC.responsible_person_email,
        oldNC.status
      );
    }

    res.json(updatedNC);
  } catch (error) {
    console.error('Error updating NC:', error);
    res.status(500).json({ error: 'Failed to update non-conformance' });
  }
});

// Delete NC
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.deleteNC(req.params.id);
    if (!result.deleted) {
      return res.status(404).json({ error: 'Non-conformance not found' });
    }
    res.json({ message: 'Non-conformance deleted successfully' });
  } catch (error) {
    console.error('Error deleting NC:', error);
    res.status(500).json({ error: 'Failed to delete non-conformance' });
  }
});

module.exports = router;
