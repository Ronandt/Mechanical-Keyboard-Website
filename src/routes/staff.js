const express = require('express');

const { restart } = require('nodemon');
const User = require('../models/user');
const Message = require('../models/Message');
const { Order } = require('../models/order');
const product = require('../models/product');
const dfd = require("danfojs-node");
const staffRouter = express.Router();
const manageAccountRoute = require('./manage_accounts');

const manageTicketRouter = require('./manage_tickets');

const manageVoucher = require('./manage_voucher');
const manageMail = require('./manage_mail');

const FAQrouter = require('./staff_FAQs');
const productRouter = require('./product');
const OrderManagement = require('./staff_ordermanagement');

const dataRouter = require('./data');

const manageTicketRoute = require('./manage_tickets');

const generateRouter = require('./generate');

const staffpeRouter = require('./staff_pe');

const loyaltyprogram = require('./manage_loyaltyprogram');

const Chart = require('./pipeline');

const usertraffic = require("./manage_traffic");

staffRouter.use((req, res, next) => {
  if (req.isUnauthenticated() || !req.user.isStaff) {
    return res.redirect('/');
}
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
staffRouter.use('/manage-traffic', usertraffic);
staffRouter.use('/data', dataRouter);

staffRouter.route('/').get(async (req, res) => {
    const stats = await Chart.totalStats();
    res.render('./staff/staff-charts', stats);
});

staffRouter.get('/InventoryReport',  async (req, res) => {
    const Inventory = await product.findAll()
  
  
    let data = [];
    let cols = ["Stocks","ProductName"];
  
  
    Inventory.forEach(element => {
      let rawData = [element.stock, element.name];
      data.push(rawData)

    });
  
    df = new dfd.DataFrame(data,{columns:["Stocks","ProductName"]})
    // group_df = df.groupby(["Dates"]).sum()
    // console.log(group_df)
    // const df2 = dfd.toJSON(df,{format:"json"})
    res.status(200).json({ 'data':df })
  });

module.exports = staffRouter;
