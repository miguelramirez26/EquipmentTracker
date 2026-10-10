const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({
        error: 'Authentication required. Please log in through GitHub.',
    });
}

module.exports = { isAuthenticated };