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
    `;

    // use query
    connection.query(winesSql, (err, winesResults) => {
        if (err) {
            // console err
            console.error('database query failed:', err);
            // response err
            return res.status(500).json({ error: 'database query failed' });
        };

        if (winesResults.length === 0) {
            // response err
            return res.status(404).json({ error: 'no wines found' });
        };

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

        // if query parameter "type" is present
        if (req.query.type) {
            // set all types in lower case
            const typeQuery = req.query.type.toLowerCase();
            // create a new array with requested type
            filteredWines = wines.filter(wine => wine.type.toLowerCase().includes(typeQuery));
        };

        // if query parameter "search" is present
        if (req.query.search) {
            // set all search in lower case
            const searchQuery = req.query.search.toLowerCase();
            // create a new array with requested name or type
            filteredWines = filteredWines.filter(wine => wine.name.toLowerCase().includes(searchQuery) || wine.type.toLowerCase().includes(searchQuery));
        };

        // if filteredWines is empty
        if (filteredWines.length === 0) {
            // response err
            return res.status(404).json({ error: 'no filtered wines found' });
        };

        // response: all wines
        res.json(filteredWines);
    });
}

function indexBestWines(req, res) {

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


// EXPORT
module.exports = { index, indexBestWines, show, };