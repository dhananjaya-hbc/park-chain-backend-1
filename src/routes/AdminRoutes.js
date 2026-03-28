const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');

// GET /api/admin/verifications
router.get('/verifications', adminController.getVerifications);

module.exports = router;
