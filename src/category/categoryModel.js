const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    State: {
        type: Number,
        required: true
    },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema, 'category');

module.exports = Category;


// {
//     "Name": "Enseres",
//     "Description": "Mesas, Sillas, Mesones, Sillas mariposas, etc.",
//     "State": 1
// }