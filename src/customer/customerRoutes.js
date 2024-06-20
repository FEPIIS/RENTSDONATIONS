const express = require('express');
const routercustomers = express();
const customerController = require('./customerController');

routercustomers.get('/customers', customerController.getCustomers);
routercustomers.get('/customers/:id', customerController.getCustomerId);
routercustomers.post('/customers/create', customerController.createCustomer);
routercustomers.put('/customers/:id', customerController.updateCustomer);
routercustomers.delete('/customers/:id', customerController.deleteCustomer);

module.exports = routercustomers;
