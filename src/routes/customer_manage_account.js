const express = require('express');
const fs = require('fs');
const upload = require('../configuration/imageUpload');
const customerManageAccountRouter = express.Router();
const User = require('../models/User');
const { Order, Shippinginfo } = require('../models/order');
const { OrderItem } = require('../models/order');
const { Cancelrequest } = require('../models/order');
const Pevaluation = require('../models/product_evaluation');
const Product = require('../models/product');
const { Payment } = require('../models/order');
const { Cart } = require('../models/cart');
const moment = require('moment');
const cron = require('node-cron');
const { CustomerVoucher } = require('../models/CustomerVoucher');
const { VoucherItem } = require('../models/CustomerVoucher');
const Voucher = require('../models/Voucher');
const LoyaltyCard = require('../models/LoyaltyCard');

const handlebars = require('handlebars');
const DeliveryDetail = require('../models/DeliveryDetail');

customerManageAccountRouter.use((req, res, next) => {
    if (req.isUnauthenticated()) {
        req.flash('info', 'Please login first to manage your own account!');
        return res.redirect('/');
    }
    next();
});


customerManageAccountRouter.route("/").get((req, res) => {
   
    
    res.render("./customers/page-profile-main")




});

customerManageAccountRouter.route('/').get((req, res) => {
    res.render('./customers/page-profile-main');
});

customerManageAccountRouter
    .route('/edit')
    .get(async (req, res) => {
        const imageAsBase64 =
            'data:image/png;base64, ' +
            fs.readFileSync(`public/${req.user.imageFilePath}`, 'base64');
        res.render('./customers/page-profile-edit', { imageAsBase64 });
    })
    .post(async (req, res) => {
        upload(req, res, async (err) => {
            const user = await User.findByPk(req.body.id);
            if (!(err || !req.file)) {
                user.imageFilePath = `uploads/${req.file.filename}`;
            }

            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;
            user.address = req.body.address || user.address;
            if (req.body.password) {
                if (req.body.password != req.body.repeatpassword) {
                    req.flash(
                        'error',
                        'Repeat password must be the same as the password!'
                    );
                } else {
                    user.password = req.body.password;
                }
            }
            await user.save();
        });

        return res.redirect('/account');
    });

customerManageAccountRouter.get('/orderhistory', async (req, res) => {
    const orders = await Order.findAll({
        where: { UserId: req.user.id },
        include: [
            {
                model: OrderItem,
                include: {
                    model: Product,
                },
            },
            {
                model: Payment,
            },
            {
                model: DeliveryDetail,
            },
            {
                model: Shippinginfo,
            },
            {
                model: User,
            },
        ],
        where: { UserId: req.user.id },
        order: [['createdAt', 'DESC']],
    });
    console.log(orders);

    return res.render('./customers/orders/page-profile-orders', { orders });
});
//
customerManageAccountRouter.get('/review', async (req, res) => {
    const reviews = await Pevaluation.findAll({
        include: [
            {
                model: Product,
            },
            {
                model: User,
            },
        ],
        where: {
            UserId: req.user.id,
        },
    });
    return res.render('./customers/page-profile-review', { reviews });
});

// Have to consider the delivery status of the order see if cancel !!!

customerManageAccountRouter.get('/cancelorderform/:id', async (req, res) => {
    const order = await Order.findOne({
        include: [
            {
                model: OrderItem,
                include: {
                    model: Product
                }
            },{
                model: Cancelrequest
            },
            {
                model: Shippinginfo
            },
            {
                model: User
            },
            {
                model:Payment
            }

        ],
        where: { Id: req.params.id },
    });
    const cancelrequest = await Cancelrequest.findAll({
        where: {
            OrderId: order.id,
        },
    });
    
    // if the order is shipped out cannot be cancel
    if(order.shipping_status != "pending"){
        req.flash(
            'info',
            'Your order is shipped out, so you are not allowed to cancel it'
        )
    }
    // if the system automatically cancel the order:

    if (cancelrequest.length > 0) {
        req.flash(
            'info',
            'Your cancel request is in the progress, please check your email for new updates'
        );
        res.redirect('/account/orderhistory');
    } else if( order.order_status == "Cancelled"){
        req.flash(
            'info',
            'The system already cancelled your order since the payment is not completed'
        )
    }
    else {
        return res.render('./customers/orders/page-cancel-request', { order });
    }
});

customerManageAccountRouter.post('/cancelorderform/:id', async (req, res) => {
    try {
        Cancelrequest.create({
            OrderId: req.params.id,
            message: req.body.message,
            status: 'null',
        });
        req.flash(
            'success',
            'Your cancel request sent susscessfully, Please Watch you email for update'
        );
        res.redirect('/account/orderhistory');
    } catch (e) {
        console.log(e);
    }
});

customerManageAccountRouter.route('/edit-image').post(async (req, res) => {
    upload(req, res, async (err) => {
        if (err || !req.file) {
            req.flash('error', 'Please upload a proper file!');
            console.log(err);
            return res.redirect('/account/edit');
        } else {
            const user = await User.findByPk(req.user.id);
            user.imageFilePath = `uploads/${req.file.filename}`;
            console.log(req.file.filename);
            console.log(user.imageFilePath);
            await user.save();
            return res.redirect('/account');
        }
    });
});

customerManageAccountRouter.route('/myvouchers').get(async (req, res) => {
    const voucher = await (await Voucher.findAll()).map((x) => x.dataValues);
    const voucherlist = await CustomerVoucher.findAll({
        include: ['voucheritem', { model: User }],
    });
    console.log(voucherlist);
    const voucheritem = await (
        await VoucherItem.findAll()
    ).map((x) => x.dataValues);

    res.render('./customers/customer_voucher/myvouchers', {
        voucherlist,
        voucher,
        voucheritem,
    });
});

customerManageAccountRouter.route('/loyaltyprogram').get(async (req, res) => {
    if (req.user) {
        let user_id = req.user.id;

        const User_Card = await LoyaltyCard.findAll({
            where: { authorID: user_id },
        });
        if (User_Card) {
            let total_points = User_Card.Active_Points + User_Card.Used_Points;
            const voucher = await (
                await Voucher.findAll()
            ).map((x) => x.dataValues);
            const voucherlist = await CustomerVoucher.findAll({
                where:{UserID:user_id},
                include: ['voucheritem', { model: User }],
            });
            const voucheritem = await (
                await VoucherItem.findAll()
            ).map((x) => x.dataValues);
            return res.render('./customers/loyaltyprogram/loyaltyprogram', {
                User_Card,
                total_points,
                voucher,
                voucherlist,
                voucheritem,
            });
        } else {
            return res.render('./customers/loyaltyprogram/loyaltyprogram');
        }
    } else {
        return res.render('./customers/loyaltyprogram/loyaltyprogram');
    }
});

module.exports = customerManageAccountRouter;
