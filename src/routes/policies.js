const express = require('express');
const Policies = express.Router();

/** Three Policies with static html page */

Policies.get('/refund-policy', async (req, res) => {
    return res.render('./customers/page-refundpolicy');
});

Policies.get('/privacy-policy', async (req, res) => {
    return res.render('./customers/page-privacypolicy');
});

Policies.get('/terms-of-service', async (req, res) => {
    return res.render('./customers/page-term&condition.handlebars');
});

module.exports = Policies;
