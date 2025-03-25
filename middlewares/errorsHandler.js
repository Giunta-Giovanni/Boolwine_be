// funzione che se viene generato un errore si occupa di rispondere con un messaggio e uno status appropriato.
function errorsHandler(err, req, res, next){
    res.status(500)
    res.json({ 
        error: err.message,
    })
}
// esportiamo la funzione
module.exports = errorsHandler;