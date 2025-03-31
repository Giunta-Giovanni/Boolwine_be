// import express
const express = require('express');
// activate express
const router = express.Router();
// import controllers
const winesController = require('../controllers/winesController');
// controllers destructuring
const { index, indexLimitedStock, indexBestWines, show } = winesController

// Crud Operations
// index
router.get('/', index);
// index limited stock
router.get('/limited_stock', indexLimitedStock);
// index: best wines
router.get('/best_wines', indexBestWines)
// show
router.get('/:id', show);

// TODO DA SPOSTARE IN ALTO SE SI VUOLE USARE
// index: best wines
// router.get('/best_wines', indexBestWines);

module.exports = router;