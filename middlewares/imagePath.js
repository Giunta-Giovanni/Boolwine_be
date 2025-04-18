// this middleware sets the image path for the request
function setImagePath(req, res, next) {
    // set the image path to the request object using the protocol and host from the request
    req.imagePath = `${req.protocol}://${req.get('host')}/img/`;
    next();
}

// export the setImagePath middleware
module.exports = setImagePath;