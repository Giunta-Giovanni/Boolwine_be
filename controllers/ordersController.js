// import connection
const connection = require('../data/db');

// INDEX FUNCTION
function index(req, res) {

    // create query: for both wines and their type
    const ordersSql = `
        SELECT 
            orders.*,
            GROUP_CONCAT(order_details.quantity) AS total_quantity,
            GROUP_CONCAT(wines.name) AS wines_names
        FROM orders
        JOIN order_details ON orders.id = order_details.order_id
        JOIN wines ON order_details.wine_id = wines.id
        GROUP BY orders.id, orders.order_date, orders.full_name;
    `;

    // execute query
    connection.query(ordersSql, (err, ordersResults) => {
        if (err) {
            // console err
            console.error('database query failed:', err);
            // response err
            return res.status(500).json({ error: 'database query failed' });
        }

        if (ordersResults.length === 0) {
            // response: empty order list
            return res.status(200).json({ message: 'empty order list' });
        }

        // response: all orders
        res.json(ordersResults);
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
            GROUP_CONCAT(order_details.quantity) AS total_quantity,
            GROUP_CONCAT(wines.name) AS wines_names
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
            return res.status(404).json({ error: 'no order found' });
        }

        // response: order_details
        res.json(orderResults[0]);
    });
}

// POST FUNCTION
function post(req, res) {

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
    connection.query(sendOrderSql, [fullName, email, phoneNumber, address, zipCode, country], (err, result) => {
        if (err) {
            // console err
            console.error('database query failed:', err);
            // response err
            return res.status(500).json({ error: 'database query failed' });
        }

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
        connection.query(checkQuantitySql, wineIds, (err, stockQuantitiesResult) => {
            if (err) {
                // console err
                console.error('failed to check stock:', err);
                // response err
                return res.status(500).json({ error: 'failed to check stock' });
            }

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
            connection.query(addDetailsOrderSql, [values], (err, result) => {
                if (err) {
                    // console err
                    console.error('failed to insert order details:', err);
                    // response err
                    return res.status(500).json({ error: 'failed to insert order details' });
                }

                // TOTAL PRICE PROCEDURE
                // create query: retrieve order total price
                const totalPriceSql = `
                    SELECT 
                        SUM(order_details.quantity * wines.price) AS order_total_price
                    FROM orders
                    JOIN order_details ON order_details.order_id = orders.id
                    JOIN wines ON wines.id = order_details.wine_id
                    WHERE orders.id = ?
                `;

                // execute query
                connection.query(totalPriceSql, [orderId], (err, totalPriceResult) => {
                    if (err) {
                        // console err
                        console.error('failed to retrieve total price:', err);
                        // response err
                        return res.status(500).json({ error: 'failed to retrieve total price' });
                    }

                    // retrieve order total price
                    const { order_total_price } = totalPriceResult[0]

                    // create query: insert order total price
                    const insertOrderTotalPrice = `
                        UPDATE orders
                        SET orders.total_price = ?
                        WHERE orders.id = ?
                    `;

                    // execute query
                    connection.query(insertOrderTotalPrice, [order_total_price, orderId], (err, result) => {
                        if (err) {
                            // console err
                            console.error('failed to insert total price:', err);
                            // response err
                            return res.status(500).json({ error: 'failed to insert total price' });
                        }

                        // create query: update stock
                        const updateStockSql = `
                            UPDATE wines 
                            JOIN order_details ON wines.id = order_details.wine_id
                            SET wines.quantity_in_stock = wines.quantity_in_stock - order_details.quantity
                            WHERE order_details.order_id = ?;
                        `;

                        // execute query
                        connection.query(updateStockSql, [orderId], (err, result) => {
                            if (err) {
                                // console err
                                console.error('failed to update stock:', err);
                                // response err
                                return res.status(500).json({ error: 'failed to update stock' });
                            }

                            // console: order added & stock updated
                            console.log('order created & stock updated');
                            // response: order added & stock updated
                            res.status(201).json({ order: `order number ${orderId} created`, stock: `stock updated` });
                        })
                    })
                });
            });
        });
    });
}

// UPDATE FUNCTION
function modify(req, res) {
    res.send('this is the modify route for the order');
}

// EXPORT
module.exports = { index, show, post, modify };
