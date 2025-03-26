// import connection
const connection = require('../data/db')

// INDEX FUNCTION
function index(req, res) {

    // create query: for both wines and their type
    const ordersSql = `
        SELECT 
            orders.id,
            orders.order_date,
            orders.full_name,
        GROUP_CONCAT(order_details.quantity) AS total_quantity,
        GROUP_CONCAT(wines.name) AS wines_names
        FROM orders
        JOIN order_details ON orders.id = order_details.order_id
        JOIN wines ON order_details.wine_id = wines.id
        GROUP BY orders.id, orders.order_date, orders.full_name;
        `;

    // use query
    connection.query(ordersSql, (err, ordersResults) => {
        if (err) {
            // console err
            console.error('database query failed:', err);
            // response err
            return res.status(500).json({ error: 'database query failed' });
        }

        if (ordersResults.length === 0) {
            // response err
            return res.status(404).json({ error: 'no orders found' });
        }

        // response: all orders
        res.json(ordersResults);
    });
}

// SHOW FUNCTION
function show(req, res) {

    // save id from req.params
    const { id } = req.params;

    // create query: for both wines and their type
    const orderSql = `
        SELECT 
            orders.id,
            orders.order_date,
            orders.full_name,
            GROUP_CONCAT(order_details.quantity) AS total_quantity,
            GROUP_CONCAT(wines.name) AS wines_names
        FROM orders
        JOIN order_details ON orders.id = order_details.order_id
        JOIN wines ON order_details.wine_id = wines.id
        WHERE orders.id = ?
        `;

    // use query
    connection.query(orderSql, [id], (err, orderResults) => {
        if (err) {
            // console err
            console.error('database query failed:', err);
            // response err
            return res.status(500).json({ error: 'database query failed' });
        }

        if (orderResults.length === 0) {
            // response err
            return res.status(404).json({ error: 'no order found' });
        }

        // response: all orders
        res.json(orderResults[0]);
    });
}

// POST FUNCTION
function post(req, res) {

    // save data from req.body
    const { totalPrice, fullName, email, phoneNumber, address, zipCode, country, cart } = req.body;

    // check if cart is empty
    if (!cart || cart.length === 0) {
        console.error('cart is empty');
        return res.status(400).json({ error: 'cart is empty' });
    }

    // create query: insert order
    const sendOrderSql = `
        INSERT INTO orders (
            total_price, 
            full_name, 
            email, 
            phone_number, 
            address, 
            zip_code, 
            country
        )
        VALUES (?, ?, ?, ?, ?, ?, ?);
    `;

    // execute query: insert order
    connection.query(sendOrderSql, [totalPrice, fullName, email, phoneNumber, address, zipCode, country], (err, result) => {
        if (err) {
            console.error('database query failed:', err);
            return res.status(500).json({ error: 'database query failed' });
        }

        // save order ID
        const orderId = result.insertId;

        // prepare data for order_details table
        const values = cart.map((item) => [orderId, item.wine_id, item.quantity]);

        // create query: insert order details
        const addDetailsOrderSql = `
            INSERT INTO order_details (order_id, wine_id, quantity) VALUES ?;
        `;

        // execute query: insert order details
        connection.query(addDetailsOrderSql, [values], (err, result) => {
            if (err) {
                console.error('failed to insert order details:', err);
                return res.status(500).json({ error: 'failed to insert order details' });
            }

            // create query: update stock
            const updateStockSql = `
                UPDATE wines 
                JOIN order_details ON wines.id = order_details.wine_id
                SET wines.quantity_in_stock = wines.quantity_in_stock - order_details.quantity
                WHERE order_details.order_id = ?;
            `;

            // execute query: update stock
            connection.query(updateStockSql, [orderId], (err, result) => {
                if (err) {
                    console.error('failed to update stock:', err);
                    return res.status(500).json({ error: 'failed to update stock' });
                }

                // response: success message
                console.log('order created & stock updated');
                res.status(201).json({ order: `order number ${orderId} created`, stock: `stock updated` });
            });
        });
    });
}




function modify(req, res) {
    res.send('questo è la rotta modify dellordine')

}

// EXPORT
module.exports = { index, show, post, modify };





//     // save quantity from req.body
//     const { quantity } = req.body;





//     // use query
//     connection.query(checkWineSql, [id], (err, checkWineResult) => {
//         if (err) {
//             // console err
//             console.error('database query failed:', err);
//             // response err
//             return res.status(500).json({ error: 'database query failed' });
//         }

//         if (checkWineResult.length === 0) {
//             // response err if the wine does not exist
//             return res.status(404).json({ error: 'wine not found' });
//         }

//         // save result
//         const wine = checkWineResult[0];
//         const currentQuantity = wine.quantity_in_stock;

//         // check if the requested quantity is available
//         if (quantity > currentQuantity) {
//             // response err if not enough stock is available
//             return res.status(400).json({ error: 'not enough stock available' });
//         }