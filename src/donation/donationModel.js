const mongoose = require('mongoose');

const donationDetailSchema = new mongoose.Schema({
    Quantity: {
        type: Number,
        required: false
    },
    ItemID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item', 
        required: false
    },
}, { timestamps: true }); 

const donationSchema = new mongoose.Schema({
    Description: {
        type: String,
        required: true
    },
    Date: {
        type: Date,
        required: true
    },
    Type:{
        type: Number,
        required: true
    },
    Amount: {
        type: Number,
        required: false
    },
    Transaction: {
        type: String,
        required: false,
    },
    DonorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donor', 
        required: true
    },
    DonationDetails: [donationDetailSchema],
    disabled: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });


const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;