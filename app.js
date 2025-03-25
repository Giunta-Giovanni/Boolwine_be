// import express
const express = require('express');
//inizialize express
const app = express();
//port
const port = process.env.PORT;
// import Routers
const winesRouter = require('./routes/winesRouter')


//create first route
app.get('/api/', (req, res) => { res.send('questa è la rotta home') })

//activate routes
app.use('/api/wines', winesRouter);
app.use('/api/orders', ordersRouter);

//activate server
app.listen(port, () => {
    console.log(`Server in ascolto sulla porta: ${port}`)
})

