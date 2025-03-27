// import express
const express = require('express');
// activate express
const router = express.Router();
// import controllers
const winesController = require('../controllers/winesController');
// controllers destructuring
const { index, indexBestWines, indexLimitedStock, show } = winesController

// Crud Operations
// index
router.get('/', index);
// index: best wines
router.get('/best_wines', indexBestWines);
// index: best seller
router.get('/best_seller', indexLimitedStock);
// show
router.get('/:id', show);


module.exports = router;