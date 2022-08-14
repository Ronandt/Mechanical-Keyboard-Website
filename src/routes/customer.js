const express = require('express');
const customerRouter = express.Router();

const customerFAQRouter = require('./customer_FAQ');
const customerTicketRouter = require('./customer_tickets');

const customerpeRouter = require('./customer_pe');
const customerproductRouter = require('./customer_product');
const customerManageAccountRouter = require('./customer_manage_account');

const ShoppingCart = require('./shoppingcart');
const CustomerOrder = require('./order');
const Policies = require('./policies');

const loyaltyprogram = require('./loyaltyprogram');

const CustomerVoucher = require('./customer_voucher');
const communityRouter = require('./community');


/*customerRouter.use((req, res, next) => {
  if (!req.isAuthenticated()) {
      return res.redirect("/login")
  }

  next()
})*/

/** FAQs Customer Site**/

customerRouter.use((req, res, next) => {
    res.locals.path = req.baseUrl;
    console.log(req.baseUrl);
    next();
});

customerRouter.use('/faqs', customerFAQRouter);
customerRouter.use('/ticket', customerTicketRouter);
customerRouter.use('/createPE', customerpeRouter);

customerRouter.use('/Cproducts', customerproductRouter);
customerRouter.use('/account', customerManageAccountRouter);

customerRouter.use('/loyaltyprogram', loyaltyprogram);


customerRouter.use('/policies', Policies);

customerRouter.use('/cart', ShoppingCart);
customerRouter.use('/order', CustomerOrder);

customerRouter.use('/community', communityRouter);
customerRouter.use('/CustomerVoucher', CustomerVoucher);

customerRouter.route('/logout').get((req, res) => {
    req.logOut();
    res.redirect('/login');
});

customerRouter.route('/').get((req, res) => {
    res.render('./customers/page-index-3');
});

module.exports = customerRouter;
