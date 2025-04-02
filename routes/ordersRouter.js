// import express
const express = require('express');
// activate express
const router = express.Router();
// import controllers
const ordersController = require('../controllers/ordersController');
// controllers destructuring
const { index, show, post, orderSuccess, orderCancelled } = ordersController

// Crud Operations
// index
router.get('/', index);
// show
router.get('/:id', show);
// post
router.post('/', post);
// orderSuccess modify
router.patch('/order-success/:id', orderSuccess);
// orderCancelled modify
router.patch('/order-cancelled/:id', orderCancelled);


module.exports = router;