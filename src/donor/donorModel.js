const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
    NIT: {
        type: String,
        required: true,
        unique: true
    },
    CompanyName: {
        type: String,
        required: true
    },
    Contact: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true,
        match: [/^\S+@\S+\.\S+$/, 'Ingrese un correo electrónico válido']
    },
    PhoneNumber: {
        type: String,
        required: true
    },
    Location: {
        type: String,
        required: true
    },
    CompanyType: {
        type: String,
        required: true
    },
    State: {
        type: Boolean,
        default: true
    }
}, { timestamps: true }); 

donorSchema.index({ NIT: 1 });

const Donor = mongoose.model('Donor', donorSchema);

module.exports = Donor;