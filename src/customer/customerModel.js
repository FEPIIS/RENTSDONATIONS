// const mongoose = require('mongoose');

// const customerSchema = new mongoose.Schema({
//     FirstName: {
//         type: String,
//         required: true
//     },
//     LastName: {
//         type: String,
//         required: true,
//     },
//     DocumentType: {
//         type: String,
//         required: true,
//     },
//     DocumentNumber: {
//         type: Number,
//         required: true,
//     },
//     PhoneNumber: {
//         type: Number,
//         required: true,
//     },
//     Email: {
//         type: String,
//         required: true,
//     },
//     Location: {
//         type: String,
//         required: true,
//     },
//     CustomerType: {
//         type: String,
//         required: true,
//     }
// }, { timestamps: true });

// const Customer = mongoose.model('Customer', customerSchema);

// module.exports = Customer;


const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    FirstName: {
        type: String,
        required: true
    },
    LastName: {
        type: String,
        required: true,
    },
    DocumentType: {
        type: String,
        required: true,
    },
    DocumentNumber: {
        type: Number,
        required: true,
    },
    PhoneNumber: {
        type: Number,
        required: true,
    },
    Email: {
        type: String,
        required: true,
    },
    Location: {
        type: String,
        required: true,
    },
    CustomerType: {
        type: String,
        required: true,
    },
    State: {
        type: Number,
        required: true,
    }
}, { timestamps: true });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;

