// import express
const express = require('express');
// activate express
const router = express.Router();
// import controllers
const winesController = require('../controllers/winesController');
// controllers destructuring
const { index, show, indexLimitedStock, indexBestWines } = winesController

// Crud Operations
// index
router.get('/', index);
// show
router.get('/:id', show);
// index limited stock
router.get('/limited_stock', indexLimitedStock);

// TODO
// index: best wines
router.get('/best_wines', indexBestWines);

module.exports = router;