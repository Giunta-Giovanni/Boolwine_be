// import connection
const connection = require('../data/db');
// import fuse
const Fuse = require('fuse.js');

// INDEX FUNCTION
function index(req, res) {

    // create query: for both wines and their type
    const winesSql = `
        SELECT 
        wines.*,
        types.name AS type
        FROM wines
        JOIN types ON types.id = wines.type_id
    `;

    // use query
    connection.query(winesSql, (err, winesResults) => {
        if (err) {
            // console err
            console.error('database query failed:', err);
            // response err
            return res.status(500).json({ error: 'database query failed' });
        }

        if (!winesResults || winesResults.length === 0) {
            // response err
            return res.status(200).json({ error: 'no wines found' });
        }

        // update path image
        const wines = winesResults.map(wine => {
            wine.image = wine.image ? `${req.imagePath}${wine.image}` : "";
            return {
                ...wine,
                image: wine.image
            };
        });

        // create a variable to store filtered wines
        let filteredWines = wines;

        // if query parameter 'type' is present
        if (req.query.type) {
            // set all types in lower case
            const typeQuery = req.query.type.toLowerCase();
            // create a new array with requested type
            filteredWines = wines.filter(wine => wine.type.toLowerCase().includes(typeQuery));
        }

        // if query parameter 'search' is present
        if (req.query.search) {
            // set all search in lower case
            const searchQuery = req.query.search;

            // fuzzy search configuration
            const fuse = new Fuse(filteredWines, {
                // fields to search within
                keys: ['name', 'type'],
                // search sensitivity (lower = more precise)
                threshold: 0.4
            });

            // perform fuzzy search with Fuse.js
            const fuzzyResults = fuse.search(searchQuery);

            // extract only the 'item' objects from the results
            filteredWines = fuzzyResults.map(result => result.item);
        }

        // if filteredWines is empty
        if (!filteredWines || filteredWines.length === 0) {
            // response err
            return res.status(200).json({ error: 'no matching wines' });
        }

        // response: all wines
        res.json(filteredWines);
    });
}

// INDEX LIMITED STOCK
function indexLimitedStock(req, res) {

    // create query: to fetch the top 3 wines with the lowest stock
    const limitedStockSql = `
        SELECT 
            wines.*,
            types.name AS type
        FROM wines
        JOIN types ON types.id = wines.type_id
        WHERE quantity_in_stock > 0 
        ORDER BY quantity_in_stock ASC 
        LIMIT 3
    `;

    // use query
    connection.query(limitedStockSql, (err, limitedStockResult) => {
        if (err) {
            // console err
            console.error('database query failed:', err);
            // response err
            return res.status(500).json({ error: 'database query failed' });
        }

        if (!limitedStockResult || limitedStockResult.length === 0) {
            return res.status(200).json({ error: 'no limited stock wines' });
        }

        // response: limited stock wines
        res.json(limitedStockResult);
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

        if (!wineResults || wineResults.length === 0) {
            // response err
            return res.status(200).json({ error: 'no wine found' });
        }

        const wine = wineResults[0];

        // update path image
        wine.image = wine.image ? `${req.imagePath}${wine.image}` : "";

        // response: selected wine
        res.json(wine);
    });
}

//TODO DA SPOSTARE!!!!!!
// DA VEDERE DOPO
function indexBestWines(req, res) {
    const selectionWines = `
    SELECT 
        wines.*,
        types.name AS type
    FROM wines
    JOIN types ON types.id = wines.type_id
    WHERE wines.id IN (17,33,42)
    `

    connection.query(selectionWines, (err, selctionWinesResult) => {
        if (err) {
            // console err
            console.error('database query failed:', err);
            // response err
            return res.status(500).json({ error: 'database query failed' });
        };

        // response: best wines
        res.json(selctionWinesResult);
    })
}

// EXPORT
module.exports = { index, indexLimitedStock, indexBestWines, show };