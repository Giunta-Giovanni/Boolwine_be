// import express
const express = require('express');
const router = express.Router();
// import stripe
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51R7aTCJ44I7v7eAERBVpd8lJ9dpnO3x16HmeKrgdG1cUF3u0MMuEgFjqLJ9JtyjjXYps1VjW8O2AM10te4Tsh8kh00XiSa6Evw');


// Creare una carica di esempio

router.get('/', async (req, res) => {

    // IL TEST FUNZIONA
    try {
        // Il metodo stripe.customers.create() viene usato per creare un nuovo cliente nell’account Stripe.
        const customer = await stripe.customers.create(


            // da modificare con i dati del cliente da db
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

        // console.log('Charge created:', charge);
        console.log('Customer created:', customer);

        // Recupera la carica appena creata
        // console.log('Charge retrieved:', retrievedCharge);
        res.status(200).json({ customer: customer });

    } catch (error) {
        console.error('Error:', error);
    }
});

router.get('/v1/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Customer id:', id);

        // Recupera la sessione di checkout
        const customer = await stripe.customers.retrieve(id);

        // Verifica se la sessione esiste
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json(customer);
    } catch (error) {
        console.error('Error retrieving Customer:', error);
        res.status(500).send('Internal Server Error in stripe router ANDREA');
    }
})

router.get('/v1/checkout/sessions/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        console.log('Session ID:', sessionId);

        // Recupera la sessione di checkout
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Verifica se la sessione esiste
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json(session);
    } catch (error) {
        console.error('Error retrieving Stripe session:', error);
        res.status(500).send('Internal Server Error in stripe router');
    }
})

// sessione da creare nel momento in cui il cliente decide di comprare 
router.post('/v1/checkout/sessions', async (req, res) => {
    let customer = null
    // IL TEST FUNZIONA
    try {
        // Il metodo stripe.customers.create() viene usato per creare un nuovo cliente nell’account Stripe.
        customer = await stripe.customers.create(

            // da modificare con i dati del cliente da db
            {
                email: "mario.rossi3@gmail.com",
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
        // console.log('Charge created:', charge);
        console.log('Customer created:', customer);

        // Recupera la carica appena creata
        // console.log('Charge retrieved:', retrievedCharge);
        // res.status(200).json({ customer: customer });

    } catch (error) {
        console.error('Error:', error);
    }

    try {
        const { cart } = req.body;

        if (!cart || cart.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }
        console.log(customer.id)
        // Creazione della sessione di pagamento
        const session = await stripe.checkout.sessions.create({
            customer: customer.id, // ID del cliente creato
            payment_method_types: ['card'],
            line_items: cart.map(item => ({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: item.wine_name, // Nome del prodotto
                    },
                    unit_amount: item.unit_amount, // Prezzo in centesimi
                },
                quantity: item.quantity, // Quantità
            })),
            mode: 'payment',

            // far partire la chiamata per l'aggiornamento della quantita e modificare lo stato dell'ordine prendiamoci lo status
            success_url: `http://localhost:3000/success`,
            cancel_url: 'http://localhost:3000/cancel',
        });

        res.json({ sessionId: session.id, url: session.url }); // URL di checkout
    } catch (error) {
        console.error('Error creating Stripe session:', error);
        res.status(500).send('Internal Server Error in stripe router');
    }
});


router.post('/v1/checkout/sessions/:sessionId/expire', async (req, res) => {
    try {
        const { sessionId } = req.params;
        console.log('Session ID:', sessionId);

        // Recupera la sessione per verificare se esiste
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Modifica la sessione di checkout
        await stripe.checkout.sessions.expire(sessionId);

        res.json({ message: 'Session expired successfully', session });
    } catch (error) {
        console.error('Error expiring Stripe session:', error);
        res.status(500).send('Internal Server Error in stripe router');
    }
});


module.exports = router;