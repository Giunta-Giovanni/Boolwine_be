// import express
const express = require('express');
const router = express.Router();
// import stripe
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// EXAMPLE: create a new customer
router.get('/', async (req, res) => {
    try {
        // create a new customer
        const customer = await stripe.customers.create(
            // add customer data
            {
                email: "mario.rossi@email.com",
                name: "Mario Rossi",
                phone: "+39 333 1234567",
                address: {
                    city: "Milano",
                    line1: "Via Roma 1",
                    state: "Lombardia",
                    country: "IT",
                    postal_code: "20100"
                },
            },
        );
        console.log('Customer created:', customer);

        // send response with customer data
        res.status(200).json({ customer: customer });

    } catch (error) {
        // Log the error
        console.error('Error creating customer:', error);
    }
});

// get specific customer by customer id
router.get('/v1/customers/:id', async (req, res) => {
    try {
        // get the customer id from the request parameters
        const { id } = req.params;

        // retrieve the customer from stripe -> Il metodo stripe.customers.retrieve() viene usato per recuperare un cliente esistente nell’account Stripe.
        const customer = await stripe.customers.retrieve(id);

        // verify if the customer exists
        if (!customer) {
            //if the customer does not exist, return a 404 error
            return res.status(404).json({ error: 'stripe customer not found' });
        }

        // if the customer exists, return the customer data
        res.json(customer);

    } catch (error) {
        // catch any other errors log them and return a 500 error
        console.error('stripe error retrieving customer:', error);
        res.status(500).send('stripe internal server error');
    }
});

// get specific session by session id
router.get('/v1/checkout/sessions/:sessionId', async (req, res) => {
    try {
        // get the session id from the request parameters
        const { sessionId } = req.params;
        // log the session id
        console.log('stripe session id:', sessionId);

        // retrieve the session from stripe -> Il metodo stripe.checkout.sessions.retrieve() viene usato per recuperare una sessione di checkout esistente nell’account Stripe.
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // verify if the session exists
        if (!session) {
            // if the session does not exist, return a 404 error
            return res.status(404).json({ error: 'stripe session not found' });
        }

        // if the session exists, return the session data
        res.json(session);

    } catch (error) {
        // catch any other errors log them and return a 500 error
        console.error('stripe error retrieving customer:', error);
        res.status(500).send('stripe internal server error');
    }
});

module.exports = router;