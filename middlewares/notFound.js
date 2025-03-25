// funzione che genera un messaggio di errore e uno stato HTTP adeguato per richieste client non valide
function notFound(req, res, next) {
    res.status(404);
    res.json({
        error: "Not Found",
        message: "Pagina non trovata"
    })
}
module.exports = notFound;