const mongoose = require('mongoose');

const rentSchema = new mongoose.Schema({
    LocationActivity: {
        type: String,
        required: true
    },
    ActivityDate: {
        type: Date,
        required: true,
    },
    DeliverDate: {
        type: Date,
        required: true,
    },
    ReturnDate: {
        type: Date,
        required: true,
    },
    Description: {
        type: String,
    },
    State: {
        type: Number,
        required: true,
        enum: [0, 1, 2, 3, 4] 
    },
    Subtotal: {
        type: Number,
        required: true,
    },
    Discount: {
        type: Number,
        required: true,
    },
    IVA: {
        type: Number,
        required: true,
    },
    Total: {
        type: Number,
        required: true,
    },
    Total: {
        type: Number,
        required: true,
    },
    CustomerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer', 
        required: true,
        validate: {
            validator: async function(customerId) {
                const customer = await mongoose.model('Customer').findById(customerId);
                return customer !== null;
            },
            message: props => `El cliente con ID ${props.value} no existe`
        }
    },
    RentDetail: [{
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: true,
            validate: {
                validator: async function(itemId) {
                    const item = await mongoose.model('Item').findById(itemId);
                    return item !== null;
                },
                message: props => `El ítem con ID ${props.value} no existe`
            }
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }]
}, { timestamps: true });

const Rent = mongoose.model('Rent', rentSchema);

module.exports = Rent;
