// import express
const express = require('express');
// activate express
const router = express.Router();
// import controllers
const winesController = require('../controllers/winesController');
// controllers destructuring
const { index, indexLimitedStock, indexWinesSelection, show } = winesController

// Crud Operations
// index
router.get('/', index);
// index limited stock
router.get('/limited_stock', indexLimitedStock);
// index wines selection
router.get('/wines_selection', indexWinesSelection);
// show
router.get('/:id', show);

module.exports = router;