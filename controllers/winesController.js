// import connection
const connection = require('../data/db')

// function index 
function index(req, res) {
    // prepare query
    const winesSql = `
    SELECT 
    wines.*,
    types.name AS type
    FROM wines
    JOIN types ON types.id = wines.type_id
    `
    // use query
    connection.query(winesSql, (err, winesResults) => {
        if (err) return res.status(500).json({ error: 'Database query failed' });
        // response
        // res.json(winesResults)
        const wines = winesResults.map(wine => {
            // update path image
            wine.image = wine.image ? `${req.imagePath}${wine.image}` : ""
            return {
                ...wine,
                image: wine.image
            }
        })
        res.json(wines);
    })
}

// function show
function show(req, res) {
    // save id req
    const { id } = req.params
    // prepare query
    const wineSql = `
        SELECT 
        wines.*,
        types.name AS type
        FROM wines
        JOIN types ON types.id = wines.type_id
        where wines.id = ?
    `
    // use query
    connection.query(wineSql, [id], (err, wineResults) => {
        if (err) return res.status(500).json({ error: 'Database query failed' })
        if (wineResults.length === 0) return res.status(404).json({ error: 'vino non trovato' });
        const wine = wineResults[0];

        // update path image
        wine.image = wine.image ? `${req.imagePath}${wine.image}` : "";
        // response
        res.json(wine);

    })

}
// function modify
function modify(req, res) {
    // save id req
    const { id } = req.params
    // save body info
    const { quantity } = req.body

    //query creation
    const boughtQuantitySql = `
    UPDATE wines
    SET quantity_in_stock = quantity_in_stock - ?
    where wines.id = ?
`
    // use query
    connection.query(boughtQuantitySql, [quantity, id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database query failed' });

        // confirm status with un JSON
        res.status(200);
        res.json({ message: `${quantity} bottle has been bought`, })
    })




}

module.exports = { index, show, modify };