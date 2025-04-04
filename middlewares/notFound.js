// This middleware handles 404 errors for any routes that are not found
function notFound(req, res, next) {
    res.status(404);
    res.json({
        error: "not found",
        message: "page not found"
    })
}
// export the notFound middleware
module.exports = notFound;