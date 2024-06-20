const express = require('express');
const routerItem = express();
const itemController = require('./itemController');

routerItem.get('/items', itemController.getItems);
routerItem.get('/items/:id', itemController.getItemId );
routerItem.post('/items/create', itemController.createItem);
routerItem.put('/items/:id', itemController.updateItem);
routerItem.delete('/items/:id', itemController.deleteItem);

module.exports = routerItem;    