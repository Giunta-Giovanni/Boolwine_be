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

// 
function post(req, res) {
    res.send('questo è la rotta post dellordine')

}

function modify(req, res) {
    res.send('questo è la rotta modify dellordine')

}

// EXPORT
module.exports = { index, show, post, modify };