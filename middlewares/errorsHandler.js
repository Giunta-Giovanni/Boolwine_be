// This middleware handles 500 errors for any routes that encounter an error
function errorsHandler(err, req, res, next) {
    res.status(500)
    res.json({
        error: err.message,
    })
}
// export the errorsHandler middleware
module.exports = errorsHandler;