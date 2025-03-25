// import express
const express = require('express');
// activate express
const router = express.Router();
// import controllers
const winesController = require('../controllers/winesController');
// controllers destructuring
const { index, show } = winesController

// Crud Operations
// index
router.get('/', index);
// show
router.get('/:id', show);


module.exports = router;