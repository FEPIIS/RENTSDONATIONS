const express = require('express');
const router = express.Router();
const donationController = require('../donation/donationController'); 

router.get('/donations', donationController.getDonations);
router.get('/donations/:id', donationController.getDonationById);
router.post('/donations/create', donationController.createDonation);
router.put('/donations/cancel/:id', donationController.disableDonation);
router.put('/donations/enable/:id', donationController.enableDonation);

module.exports = router;
