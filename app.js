// import express
const express = require('express');
const app = express();
const port = process.env.PORT;

// import Routers
const winesRouter = require('./routes/winesRouter');
const ordersRouter = require('./routes/ordersRouter');
const stripesRouter = require('./routes/stripesRouter');

// import Controllers
const ordersController = require('./controllers/ordersController');
// import for background task
ordersController.startOrderChecking();

// MIDDLEWARES
// import middleware imagePath
const setImagePath = require('./middlewares/imagePath');
// import middleware error 500
const errorsHandler = require('./middlewares/errorsHandler');
// import middleware error 404
const endPointNotFound = require('./middlewares/notFound');

// import CORS
const cors = require('cors');
// use CORS on specific port
app.use(cors({ origin: process.env.FE_APP }));

// use express static to serve static files
app.use(express.static('public'));

// use imagePath
app.use(setImagePath);

// use express.json to parse JSON bodies
app.use(express.json());

// home route
app.get('/api/', (req, res) => { res.json({ message: 'Welcome to the API home' }) });

// add routes
app.use('/api/wines', winesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/stripes', stripesRouter);


// error 404 handling
app.use(endPointNotFound);
// error 500 handling
app.use(errorsHandler);


// activate server
app.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
});