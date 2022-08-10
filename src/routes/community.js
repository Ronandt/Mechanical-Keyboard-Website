const communityRouter = require('express').Router();

communityRouter.route('/').get((req, res) => {
    res.render('./customers/page-community');
});

communityRouter.route('/chat').get((req, res) => {
    res.render('./customers/page-community-chat');
});

module.exports = communityRouter;
