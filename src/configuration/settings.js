const { enable } = require('../setup');

const enableDebugMode = (enable) => {
    if (enable) {
        if (req.isUnauthenticated() || !req.user.isStaff) {
            return res.redirect('/');
        }
    }
};

module.exports = enableDebugMode;
