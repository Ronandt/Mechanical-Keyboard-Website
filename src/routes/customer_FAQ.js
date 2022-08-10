const express = require('express');
const FAQrouter = express.Router();
const FAQs = require('../models/FAQs');

FAQrouter.route('/').get(async (req, res) => {
    const faqs = await (await FAQs.findAll()).map((x) => x.dataValues);
    return res.render('./customers/page-faqs', { faqs });
});

module.exports = FAQrouter;
