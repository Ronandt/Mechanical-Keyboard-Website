const express = require('express');

const { restart } = require('nodemon');
const User = require('../models/user');
const Voucher = require('../models/Voucher');
const staffRouter = express.Router();
const manageAccountRoute = require('./manage_accounts');

const manageTicketRouter = require('./manage_tickets');

const manageVoucher = require('./manage_voucher');
const manageMail = require('./manage_mail');

const FAQrouter = require('./staff_FAQs');
const productRouter = require('./product');
const enableDebugMode = require('../configuration/settings');
const OrderManagement = require('./staff_ordermanagement');

const dataRouter = require('./data');

const manageTicketRoute = require('./manage_tickets');

const staffpeRouter = require('./staff_pe');

enableDebugMode(false);
staffRouter.use((req, res, next) => {
    res.locals.path = req.baseUrl;
    console.log(req.baseUrl);

    next();
});

staffRouter.use('/accounts', manageAccountRoute);
staffRouter.use('/tickets', manageTicketRoute);
staffRouter.use('/manage-faqs', FAQrouter);
staffRouter.use('/manage-vouchers', manageVoucher);
staffRouter.use('/product', productRouter);
staffRouter.use('/manage-pe', staffpeRouter);
staffRouter.use('/manage-orders', OrderManagement);
// staffRouter.use("/manage-mail", manageMail);

staffRouter.use('/data', dataRouter);

staffRouter.route('/').get((req, res) => {
    res.render('./staff/staff-charts');
});

module.exports = staffRouter;
