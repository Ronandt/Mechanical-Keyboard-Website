const express = require('express');

const { restart } = require('nodemon');
const User = require('../models/user');
const LoyaltyCard = require('../models/LoyaltyCard');
const Message = require('../models/Message');
const { Order } = require('../models/order');

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

const generateRouter = require('./generate');

const staffpeRouter = require('./staff_pe');

const loyaltyprogram = require('./manage_loyaltyprogram');

const Chart = require('./pipeline');

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

staffRouter.use('/generate', generateRouter);

staffRouter.use('/manage-loyaltyprogram', loyaltyprogram);


staffRouter.use('/data', dataRouter);

staffRouter.route('/').get(async (req, res) => {
    const stats = await Chart.totalStats();
    res.render('./staff/staff-charts', stats);
});

module.exports = staffRouter;
