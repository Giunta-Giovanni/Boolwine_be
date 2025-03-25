function setImagePath(req, res, next) {
    // creiamo il path assoluto della Immagine
    req.imagePath = `${req.protocol}://${req.get('host')}/img/`;
    next();
}

module.exports = setImagePath;