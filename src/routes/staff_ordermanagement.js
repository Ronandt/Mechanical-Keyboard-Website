const express = require('express');
const OrderManagement = express.Router();
const { Order } = require('../models/order');
const { OrderItem } = require('../models/order');
const Product = require('../models/product');

const User = require('../models/User');

const { Payment } = require('../models/order');
const { Cart } = require('../models/cart');

const moment = require('moment');
const cron = require('node-cron');

cron.schedule('*/15 * * * * ', async () => {
    console.log('running a task every 15 minute');
    let orders = await Order.findAll({
        where: { payment_status: 0 && order_status != 'Cancelled' },
    });
    orders.forEach((order) => {
        var createAt = moment(order.createdAt).format('YYYY-MM-DD HH:mm:ss');
        console.log(createAt);
        var now = moment().format('YYYY-MM-DD HH:mm:ss');
        console.log(now);
        var minute = moment(now).diff(moment(createAt), 'minutes');
        console.log(minute);
        if (minute > 30) {
            Order.update(
                { order_status: 'Cancelled' },
                { where: { id: order.id } }
            );
            console.log('Hello');
        }
    });
});

// Get Orders
OrderManagement.get('/', async (req, res) => {
    const orders = await Order.findAll({
        include: [
            {
                model: OrderItem,
                include: {
                    model: Product,
                },
            },
            {
                model: User,
            },
        ],
    });

    return res.render('./staff/ordermanagement/staff-getorders', { orders });
});

OrderManagement.get('/cancelorder/:id', async function (req, res) {
    try {
        let order = await Order.findByPk(req.params.id);
        if (!order) {
            flash(res, 'error', 'order not found');
            res.redirect('/staff/manage_order');
            return;
        }
        let result = await Order.update(
            { order_status: 'Canceled' },
            { where: { id: order.id } }
        );
        req.flash('success', 'Order' + ' is cancelled!');
        res.redirect('/staff/manage-orders');
    } catch (err) {
        console.log(err);
    }
});

module.exports = OrderManagement;
