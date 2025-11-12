const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kycController');
const auth = require('../middleware/auth');

// Public routes
router.post('/submit', kycController.submitKyc);

// Protected routes (require admin authentication)
router.get('/', auth, kycController.getAllKyc);
router.get('/statistics', auth, kycController.getKycStatistics);
router.get('/:id', auth, kycController.getKycById);
router.patch('/:id/status', auth, kycController.updateKycStatus);
router.post('/:id/regenerate-summary', auth, kycController.regenerateAiSummary);
router.post('/batch-regenerate-summaries', auth, kycController.batchRegenerateAiSummaries);
router.delete('/:id', auth, kycController.deleteKyc);

module.exports = router;
