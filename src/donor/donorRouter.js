const express = require('express');
const router = express.Router();
const donorController = require('./donorController');

router.get('/donors', donorController.getDonors);
router.get('/donors/:id', donorController.getDonorById);
router.post('/donors/create', donorController.createDonor);
router.put('/donors/:id', donorController.updateDonor);
router.delete('/donors/:id', donorController.deleteDonor);
router.put('/donors/:id/enable', donorController.enableDonor);
router.put('/donors/:id/disable', donorController.disableDonor);

module.exports = router;
