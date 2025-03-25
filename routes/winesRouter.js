// import express
const express = require('express');
// activate express
const router = express.Router();
// import controllers
const winesController = require('../controllers/winesController');
// controllers destructuring
const { index, show, modify } = winesController

// Crud Operations
// index
router.get('/', index);
// show
router.get('/:id', show);
// modify
router.patch('/:id', modify);

module.exports = router;