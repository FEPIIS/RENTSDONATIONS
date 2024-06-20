const express = require('express');
const routerRent = express();
const rentController = require('./rentController');

routerRent.get('/rents', rentController.getRents ); 
routerRent.get('/rents/:id', rentController.getRentId); 
routerRent.post('/rents/create', rentController.createRent); 
routerRent.put('/rents/:id', rentController.updateRent); 
routerRent.delete('/rents/:id', rentController.deleteRent); 

module.exports = routerRent;
