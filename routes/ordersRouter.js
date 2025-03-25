// import express
const express = require('express');
// activate express
const router = express.Router();
// import controllers
const ordersController = require('../controllers/ordersController');
// controllers destructuring
const { index, show, post, modify } = ordersController

// Crud Operations
// index
router.get('/', index);
// show
router.get('/:id', show);
// post
router.post('/', post);
// modify
router.patch('/:id', modify);

module.exports = router;