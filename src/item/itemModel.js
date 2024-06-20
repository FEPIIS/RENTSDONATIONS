const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Reference: {
        type: String,
        required: true
    },
    Quantity: {
        type: Number,
        required: true,
    },
    Location: {
        type: String,
        required: true,
    },
    ItemPrice: {
        type: Number,
        required: true,
    },
    Description: {
        type: String,
        required: true,
    },
    RentalPrice: {
        type: Number,
        required: true,
    },
    State: {
        type: Number,
        required: true,
    },
    RentState: {
        type: Number,
        required: true,
    },
    Category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        validate: {
            validator: async function(categoryId) {
                const category = await mongoose.model('Category').findById(categoryId);
                return category && category.State === 1;
            },
            message: props => `La categoría seleccionada (${props.value}) no está activa o no existe`
        }
    }
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
