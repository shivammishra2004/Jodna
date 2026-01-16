module.exports = {
    ensureAuth: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/');
        }
    },
    ensureGuest: function (req, res, next) {
        if (req.isAuthenticated()) {
            return res.redirect('/dashboard'); // Changed from /dashboard to generic
        } else {
            return next();
        }
    },
    ensureRole: function (roles) {
        return (req, res, next) => {
            if (req.isAuthenticated() && roles.includes(req.user.role)) {
                return next();
            } else {
                res.status(403).json({ error: 'Access denied: Insufficient privileges' });
            }
        }
    }
};
