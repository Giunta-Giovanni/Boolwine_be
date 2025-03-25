// import connection
const connection = require('../data/db')

// INDEX FUNCTION
function index(req, res) {

    // create query: for both wines and their type
    const winesSql = `
        SELECT 
        wines.*,
        types.name AS type
        FROM wines
        JOIN types ON types.id = wines.type_id
    `
    // use query
    connection.query(winesSql, (err, winesResults) => {
        if (err) {
            // console err
            console.error('database query failed:', err);
            // response err
            return res.status(500).json({ error: 'database query failed' });
        }

        if (winesResults.length === 0) {
            // response err
            return res.status(404).json({ error: 'no wines found' });
        }

        // update path image
        const wines = winesResults.map(wine => {
            wine.image = wine.image ? `${req.imagePath}${wine.image}` : "";
            return {
                ...wine,
                image: wine.image
            };
        });

        // response: all wines
        res.json(wines);
    });
}

// SHOW FUNCTION
function show(req, res) {

    // save id from req.params
    const { id } = req.params;

    // create query: to select a specific wine and its type
    const wineSql = `
        SELECT 
        wines.*,
        types.name AS type
        FROM wines
        JOIN types ON types.id = wines.type_id
        WHERE wines.id = ?
    `;

    // use query
    connection.query(wineSql, [id], (err, wineResults) => {
        if (err) {
            // console err
            console.error('database query failed:', err);
            // response err
            return res.status(500).json({ error: 'database query failed' });
        }

        if (wineResults.length === 0) {
            // response err
            return res.status(404).json({ error: 'no wine found' });
        }

        const wine = wineResults[0];

        // update path image
        wine.image = wine.image ? `${req.imagePath}${wine.image}` : "";

        // response: selected wine
        res.json(wine);
    });
}

// MODIFY FUNCTION
function modify(req, res) {

    // save id from req.params
    const { id } = req.params;
    // save quantity from req.body
    const { quantity } = req.body;

    // create query: check if the wine exists in the database
    const checkWineSql = `
        SELECT name, quantity_in_stock
        FROM wines
        WHERE id = ?
    `;

    // use query
    connection.query(checkWineSql, [id], (err, checkWineResult) => {
        if (err) {
            // console err
            console.error('database query failed:', err);
            // response err
            return res.status(500).json({ error: 'database query failed' });
        }

        if (checkWineResult.length === 0) {
            // response err if the wine does not exist
            return res.status(404).json({ error: 'wine not found' });
        }

        const wine = checkWineResult[0];
        const currentQuantity = wine.quantity_in_stock;

        // check if the requested quantity is available
        if (quantity > currentQuantity) {
            // response err if not enough stock is available
            return res.status(400).json({ error: 'not enough stock available' });
        }

        // create query: update the quantity in stock
        const boughtQuantitySql = `
            UPDATE wines
            SET quantity_in_stock = quantity_in_stock - ?
            WHERE id = ?
        `;

        // use query
        connection.query(boughtQuantitySql, [quantity, id], (err, result) => {
            if (err) {
                // console err
                console.error('database query failed:', err);
                // response err
                return res.status(500).json({ error: 'database query failed' });
            }

            // response: success message with purchase details
            res.status(200).json({ message: `${quantity} bottle(s) of ${wine.name} has been bought` });
        });
    });
}


// EXPORT
module.exports = { index, show, modify };