// import express
const express = require('express');
//inizialize express
const app = express();
//port
const port = process.env.PORT;
// import Routers
const winesRouter = require('./routes/winesRouter');
const ordersRouter = require('./routes/ordersRouter');

// MIDDLEWARES
// import middleware imagePath
const setImagePath = require('./middlewares/imagePath')
// import middleware errore 500
const errorsHandler = require('./middlewares/errorsHandler');
// import middleware error404
const endPointNotFound = require('./middlewares/notFound')


// connection with static file
app.use(express.static('public'))

// create imagePath
app.use(setImagePath);

// Body parser registration
app.use(express.json());



//create first route
app.get('/api/', (req, res) => { res.send('questa è la rotta home') })

//activate routes
app.use('/api/wines', winesRouter);
app.use('/api/orders', ordersRouter);

// registro errore 404
app.use(endPointNotFound);

// registro errore 500
app.use(errorsHandler);


//activate server
app.listen(port, () => {
    console.log(`Server in ascolto sulla porta: ${port}`)
})

