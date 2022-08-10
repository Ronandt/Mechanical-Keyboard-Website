const express = require('express');
const CustomerOrder = express.Router();
const { Order } = require('../models/order');
const { OrderItem } = require('../models/order');
const Product = require('../models/product');
const { Payment } = require('../models/order');
const { Cart } = require('../models/cart');
const User = require('../models/User');
const moment = require('moment');
const cron = require('node-cron');

CustomerOrder.get('/', async (req, res) => {
    const orders = await Order.findAll({
        include: [
            {
                model: OrderItem,
                include: {
                    model: Product,
                },
            },
        ],
        where: { UserId: req.user.id },
    });

    return res.render('./customer/orders/page-profile-main', { orders });
});

module.exports = CustomerOrder;
