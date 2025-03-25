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
    const { totalPrice, fullName, email, phoneNumber, address, zipCode, country } = req.body;

    // create query: send order
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
        VALUES ( 
            ?, 
            ?, 
            ?, 
            ?, 
            ?, 
            ?, 
            ? 
        );
    `;

    // use query
    connection.query(
        sendOrderSql,
        [totalPrice, fullName, email, phoneNumber, address, zipCode, country],
        (err, result) => {
            if (err) {
                // console err
                console.error('database query failed:', err);
                // response err
                return res.status(500).json({ error: 'database query failed' });
            };

            const orderId = result.insertId;
            console.log(orderId);








            // response: success message + 201 status
            res.status(201);
            res.json({ message: 'order added' }); //DA RIVEDERE PER JSON MESSAGE
        });
};

function modify(req, res) {
    res.send('questo è la rotta modify dellordine')

}

// EXPORT
module.exports = { index, show, post, modify };



// -- Salva l'ID dell'ordine appena creato
// SET @order_id = LAST_INSERT_ID();

// -- Inserisce più vini nel carrello (ordine dettagliato)
// INSERT INTO order_details (order_id, wine_id, quantity)
// VALUES 
// (@order_id, 12, 10),  -- 10 bottiglie di vino con ID 12
// (@order_id, 7, 5),    -- 5 bottiglie di vino con ID 7
// (@order_id, 3, 2);    -- 2 bottiglie di vino con ID 3

// -- Aggiorna le quantità in stock per tutti i vini ordinati
// UPDATE wines 
// JOIN order_details ON wines.id = order_details.wine_id
// SET wines.quantity_in_stock = wines.quantity_in_stock - order_details.quantity
// WHERE order_details.order_id = @order_id;