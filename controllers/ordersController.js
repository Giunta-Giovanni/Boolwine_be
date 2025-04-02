// import connection
const connection = require('../data/db');
const nodemailer = require('nodemailer');
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51R7aTCJ44I7v7eAERBVpd8lJ9dpnO3x16HmeKrgdG1cUF3u0MMuEgFjqLJ9JtyjjXYps1VjW8O2AM10te4Tsh8kh00XiSa6Evw');


// INDEX FUNCTION
function index(req, res) {

    // create query: to see orders and their associated quantities
    const ordersSql = `
        SELECT 
            orders.*,
            order_details.quantity,
            wines.name AS wine_name
        FROM orders
        JOIN order_details ON orders.id = order_details.order_id
        JOIN wines ON order_details.wine_id = wines.id;
    `;

    // execute query
    connection.query(ordersSql, (err, ordersResults) => {
        if (err) {
            // console err
            console.error('database query failed:', err);
            // response err
            return res.status(500).json({ error: 'database query failed' });
        };

        if (ordersResults.length === 0) {
            // response: empty order list
            return res.status(200).json({ message: 'empty order list' });
        };

        // reduce the results to group orders by their id and accumulate items for each order
        const groupedOrders = ordersResults.reduce((acc, order) => {

            // search for an existing order by its id
            const existingOrder = acc.find(o => o.id === order.id);
            if (existingOrder) {
                // if the order exists, add the wine and its quantity to the existing cart in that order
                existingOrder.cart.push({ wine_name: order.wine_name, quantity: order.quantity });
            } else {
                // if the order doesn't exist, create a new order entry with the order data and an initial cart containing the wine
                acc.push({
                    id: order.id,
                    order_date: order.order_date,
                    is_complete: order.is_complete,
                    total_price: order.total_price,
                    full_name: order.full_name,
                    email: order.email,
                    phone_number: order.phone_number,
                    address: order.address,
                    zip_code: order.zip_code,
                    country: order.country,
                    cart: [{ wine_name: order.wine_name, quantity: order.quantity }]
                });
            }
            // return the updated array of orders
            return acc;
        }, []);

        // response: grouped orders and their quantities
        res.json(groupedOrders);
    });
}

// SHOW FUNCTION
function show(req, res) {

    // save id from req.params
    const { id } = req.params;

    // create query: to see an order_details by its id
    const orderSql = `
        SELECT 
            orders.*,
            order_details.quantity,
            wines.name AS wine_name
        FROM orders
        JOIN order_details ON orders.id = order_details.order_id
        JOIN wines ON order_details.wine_id = wines.id
        WHERE orders.id = ?
    `;

    // execute query
    connection.query(orderSql, [id], (err, orderResults) => {
        if (err) {
            // console err
            console.error('database query failed:', err);
            // response err
            return res.status(500).json({ error: 'database query failed' });
        }

        if (orderResults.length === 0) {
            // response: no order found
            return res.status(200).json({ error: 'no order found' });
        }

        // reduce the results to group orders by their id and accumulate items for each order
        const groupedOrder = orderResults.reduce((acc, order) => {

            // search for an existing order by its id
            const existingOrder = acc.find(o => o.id === order.id);
            if (existingOrder) {
                // if the order exists, add the wine and its quantity to the existing cart in that order
                existingOrder.cart.push({ wine_name: order.wine_name, quantity: order.quantity });
            } else {
                // if the order doesn't exist, create a new order entry with the order data and an initial cart containing the wine
                acc.push({
                    id: order.id,
                    order_date: order.order_date,
                    is_complete: order.is_complete,
                    total_price: order.total_price,
                    full_name: order.full_name,
                    email: order.email,
                    phone_number: order.phone_number,
                    address: order.address,
                    zip_code: order.zip_code,
                    country: order.country,
                    cart: [{ wine_name: order.wine_name, quantity: order.quantity }]
                });
            }
            // return the updated array of orders
            return acc;
        }, []);

        // response: grouped orders and its quantities by id
        res.json(groupedOrder);
    });
}

// POST FUNCTION
async function post(req, res) {
    try {

        // save data from req.body
        const { fullName, email, phoneNumber, address, zipCode, country, cart } = req.body;

        // check if cart is empty
        if (!cart || cart.length === 0) {
            // response: cart is empty
            return res.status(404).json({ error: 'cart is empty' });
        }

        // create query: insert order
        const sendOrderSql = `
        INSERT INTO orders (
            full_name, 
            email, 
            phone_number, 
            address, 
            zip_code, 
            country
        )
        VALUES (?, ?, ?, ?, ?, ?);
    `;

        // execute query
        const result = await new Promise((resolve, reject) => {
            connection.query(sendOrderSql, [fullName, email, phoneNumber, address, zipCode, country], (err, result) => {
                if (err) {
                    // console err
                    console.error('database query failed:', err);
                    // response err
                    return reject('database query failed');
                }
                resolve(result);
            });
        });

        // save order ID
        const orderId = result.insertId;

        // prepare values for order_details table
        const values = cart.map((item) => [orderId, item.wine_id, item.quantity]);

        // create query: check stock
        const checkQuantitySql = `
        SELECT 
            id, 
            quantity_in_stock 
        FROM wines
        WHERE id IN (${cart.map(() => '?').join(',')})
    `;

        // find wine id
        const wineIds = cart.map(item => item.wine_id);

        // execute query
        const stockQuantitiesResult = await new Promise((resolve, reject) => {
            connection.query(checkQuantitySql, wineIds, (err, stockQuantitiesResult) => {
                if (err) {
                    // console err
                    console.error('failed to check stock:', err);
                    // response err
                    return reject('failed to check stock');
                }
                resolve(stockQuantitiesResult);
            });
        });

        // set state for insufficient stock
        let hasInsufficientStock = false;

        // for each wine check the quantity in stock
        stockQuantitiesResult.forEach(item => {
            const { id, quantity_in_stock } = item;

            // for each wine check the requested quantity
            cart.forEach(cartItem => {
                const { wine_id, quantity } = cartItem;

                // check stock against order quantity
                if (id === wine_id && quantity > quantity_in_stock) {
                    // response: requested quantity not available
                    res.status(403).json({ error: 'requested quantity not available' });
                    // change state for insufficient stock
                    return hasInsufficientStock = true;
                }
            });
        });

        // if insufficient stock, stop process
        if (hasInsufficientStock) return;

        // create query: insert order details
        const addDetailsOrderSql = `
        INSERT INTO order_details (order_id, wine_id, quantity) VALUES ?;
    `;

        // execute query
        await new Promise((resolve, reject) => {
            connection.query(addDetailsOrderSql, [values], (err, result) => {
                if (err) {
                    // console err
                    console.error('failed to insert order details:', err);
                    // response err
                    return reject('failed to insert order details');
                }
                resolve(result);
            });
        });

        // create query: retrieve order total price
        const totalPriceSql = `
        SELECT 
            SUM(order_details.quantity * IFNULL(wines.discount_price, wines.price)) AS order_total_price
        FROM orders
        JOIN order_details ON order_details.order_id = orders.id
        JOIN wines ON wines.id = order_details.wine_id
        WHERE orders.id = ?;
        `;

        // execute query
        const totalPriceResult = await new Promise((resolve, reject) => {
            connection.query(totalPriceSql, [orderId], (err, totalPriceResult) => {
                if (err) {
                    // console err
                    console.error('failed to retrieve total price:', err);
                    // response err
                    return reject('failed to retrieve total price');
                }
                resolve(totalPriceResult);
            });
        });

        // retrieve order total price
        let { order_total_price } = totalPriceResult[0]

        // shipping discount if over 99€
        order_total_price = parseFloat(order_total_price);
        if (order_total_price <= 99) {
            order_total_price += 14.99;
        }

        // create query: insert order total price
        const insertOrderTotalPrice = `
        UPDATE orders
        SET orders.total_price = ?
        WHERE orders.id = ?
        `;

        // execute query
        await new Promise((resolve, reject) => {
            connection.query(insertOrderTotalPrice, [order_total_price, orderId], (err, result) => {
                if (err) {
                    // console err
                    console.error('failed to insert total price:', err);
                    // response err
                    return reject('failed to insert total price');
                }
                resolve(result);
            });
        });

        // create query: update stock
        const updateStockSql = `
        UPDATE wines 
        JOIN order_details ON wines.id = order_details.wine_id
        SET wines.quantity_in_stock = wines.quantity_in_stock - order_details.quantity
        WHERE order_details.order_id = ?;
    `;

        // execute query
        await new Promise((resolve, reject) => {
            connection.query(updateStockSql, [orderId], (err, result) => {
                if (err) {
                    // console err
                    console.error('failed to update stock:', err);
                    // response err
                    return reject('failed to update stock');
                }
                resolve(result);
            });
        });

        // STRIPE PAYMENT INTEGRATION
        let customer = null;
        try {
            customer = await stripe.customers.create({
                email: email,
                name: fullName,
                phone: phoneNumber,
                address: {
                    line1: address,
                    country: country,
                    postal_code: zipCode
                },
            });
            console.log('Customer created:', customer);

            // Create Stripe session
            const session = await stripe.checkout.sessions.create({
                customer: customer.id,
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: 'Il tuo ordine su Cantine Booleane',
                        },
                        unit_amount: parseFloat(order_total_price * 100),
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `http://localhost:5173/check-out-success?customer_id=${customer.id}`,
                cancel_url: `http://localhost:3000/check-out-success/customer_id=${customer.id}`,
                phone_number_collection: {
                    enabled: true,
                },
                metadata: {
                    orderId: orderId
                }
            });

            // RISPOSTAAAAA
            res.json({ sessionId: session.id, url: session.url });
        } catch (error) {
            console.error('Error creating Stripe session:', error);
            res.status(500).send('Internal Server Error in Stripe integration GIOVANNI');
        }
    } catch (error) {
        console.error('Error processing the request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// UPDATE FUNCTION
function modify(req, res) {

    // save id from req.params
    const { id } = req.params;


    // create query: retrieve order status
    const orderStatus = `
    SELECT is_complete
    FROM orders
    WHERE id = ?
    `;

    // execute query
    connection.query(orderStatus, [id], (err, statusResult) => {
        if (err) {
            console.error('failed to retrieve order status', err);
            return res.status(500).json({ error: 'failed to retrieve order status' });
        }

        const orderStatus = statusResult[0].is_complete
        if (orderStatus === "completed") {
            // success response
            console.log('order already updated');
            return res.status(201).json({ order: `already updated`, stock: 'already updated', email: 'already sent' });

        }

        // create query: update order status
        const updateOrderStatus = `
                UPDATE orders
                SET orders.is_complete = "completed"
                WHERE id = ?;
            `;

        // execute update order status query
        connection.query(updateOrderStatus, [id], (err, result) => {
            if (err) {
                console.error('failed to update order status', err);
                return res.status(500).json({ error: 'failed to update order status' });
            }

            // create query: retrieve order detail
            const retrieveOrderDetail = `
        SELECT *
        FROM orders
        WHERE id = ?
        `;

            // execute query
            connection.query(retrieveOrderDetail, [id], (err, detailResult) => {
                if (err) {
                    console.error('failed to retrieve order detail', err);
                    return res.status(500).json({ error: 'failed to retrieve order detail' });
                }

                const orderDetail = detailResult[0]

                const { full_name, email, phone_number, address, zip_code, country, total_price } = orderDetail;

                // NODEMAILER
                const transporter = nodemailer.createTransport({
                    host: 'smtp.libero.it',
                    port: 465,
                    secure: true,
                    auth: {
                        user: 'cantinebooleane@libero.it',
                        pass: process.env.EMAIL_PW,
                    },
                    tls: {
                        rejectUnauthorized: false,
                    }
                });


                // user confirmation email
                const userMail = {
                    from: 'cantinebooleane@libero.it',
                    to: email,
                    subject: `Conferma Ordine #${id}`,
                    text:
                        `Grazie per il tuo ordine, ${full_name}!
            Il tuo ordine #${id} è stato ricevuto.
            Totale: €${total_price}.
            Riceverai l'ordine in: ${address}, ${zip_code}, ${country}.
            Grazie per aver comprato da noi.
            Team di Cantine Booleane.`
                };

                transporter.sendMail(userMail, (err, info) => {
                    if (err) {
                        // console err
                        console.error('failed to send confirmation email:', err);
                    } else {
                        // console succ
                        console.log('confirmation email sent:', info.response);
                    }
                });

                const officeMail = {
                    from: 'cantinebooleane@libero.it',
                    to: 'cantinebooleane@libero.it',
                    subject: `Conferma ordine # ${id}`,
                    text: `L'ordine di ${full_name}, telefono n. ${phone_number}, è stato confermato! Indirizzo di spedizione: ${address}, ${zip_code}, ${country}. Totale: €${total_price}.`
                }

                // office confirmation email
                transporter.sendMail(officeMail, (err, info) => {
                    if (err) {
                        // console err
                        console.error('failed to send confirmation email:', err);
                    } else {
                        // console succ
                        console.log('confirmation email sent:', info.response);
                    }
                });

                // success response
                console.log('order created & stock updated');
                res.status(201).json({ order: `order number ${id} created`, stock: 'stock updated', email: 'confirmation sent' });
            });

        })
    });
};

// EXPORT
module.exports = { index, show, post, modify };