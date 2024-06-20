const express = require('express');
const routerCategory = express();
const categoryController = require('./categoryController');

routerCategory.get('/categories', categoryController.getCategories);
routerCategory.get('/categories/:id', categoryController.getCategoryId);
routerCategory.post('/categories/create', categoryController.createCategory);
routerCategory.put('/categories/:id', categoryController.updateCategory);
routerCategory.delete('/categories/:id', categoryController.deleteCategory);

module.exports = routerCategory;    