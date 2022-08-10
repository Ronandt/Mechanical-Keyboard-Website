const express = require('express');
const fs = require('fs');
const upload = require('../configuration/imageUpload');
const customerManageAccountRouter = express.Router();
const User = require('../models/User');
const { Order } = require('../models/order');
const { OrderItem } = require('../models/order');
const Product = require('../models/product');
const { Payment } = require('../models/order');
const { Cart } = require('../models/cart');
const moment = require('moment');
const cron = require('node-cron');

const { CustomerVoucher } = require('../models/CustomerVoucher');
const { VoucherItem } = require('../models/CustomerVoucher');
const Voucher = require('../models/Voucher');

const handlebars = require('handlebars');

customerManageAccountRouter.use((req, res, next) => {
    if (req.isUnauthenticated()) {
        req.flash('info', 'Please login first to manage your own account!');
        return res.redirect('/');
    }

    next();
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
        ],
        where: { UserId: req.user.id },
    });

    return res.render('./customers/orders/page-profile-orders', { orders });
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

module.exports = customerManageAccountRouter;
