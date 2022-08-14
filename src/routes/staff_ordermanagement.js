const express = require('express');
const OrderManagement = express.Router();
const { Order, Shippinginfo } = require('../models/order');
const { OrderItem } = require('../models/order');
const { Cancelrequest } = require('../models/order');
const Product = require('../models/product');
const { Mail } = require("../configuration/nodemailer");
const sequelize = require('sequelize');


const User = require('../models/User');

const { Payment } = require('../models/order');
const { Cart } = require('../models/cart');

const moment = require('moment');
const cron = require('node-cron');
const DeliveryDetail = require('../models/DeliveryDetail');
const { where } = require('sequelize');

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
            {
                model: DeliveryDetail,
            },
            {
                model: Shippinginfo,
            },
            {
                model: Payment
            }
        ],
    });
    return res.render('./staff/ordermanagement/staff-getorders', { orders });
});

OrderManagement.get('/cancel/:id', async function (req, res) {
    try {
        let order = await Order.findOne({
            where: { id: req.params.id },
        });

        if (!order) {
            req.flash(res, 'error', 'order not found');
            res.redirect('/staff/manage-orders');
        }
       
        await Order.update(
            { order_status: 'Cancelled' },
            { where: { id: req.params.id } })
        req.flash('success', 'You have cancel the order successfully');
        res.redirect('/staff/manage-orders');
        } catch (err) {
        console.log(err);
    }
});
// Approved cancel request
// Have to consider the delivery status of the order see if cancel
OrderManagement.get('/cancelorder/:id', async function (req, res) {
    try {
        let request = await Cancelrequest.findOne({
            where: { OrderId: req.params.id },
        });

        if (!request) {
            console.log(1);
            req.flash(res, 'error', 'request not found');
            res.redirect('/staff/manage-orders/cancelrequests');
        }
        if (request.status != 'null') {
            req.flash('error', ' You have already rejected or approved it');
            res.redirect('/staff/manage-orders/cancelrequests');
        } else {
            let result = await Cancelrequest.update(
                { status: 'Approved' },
                { where: { id: request.id } }
            );
            let o = await Order.update(
                { order_status: 'Cancelled' },
                { where: { id: req.params.id } }
            );
            const order = await Order.findByPk(req.params.id);
            const userID = order.UserId;
            const user = await User.findByPk(userID);
            let orderid = order.id;

            Mail.Send({
                email_recipient: user.email,
                subject: 'Order Cancellation Approved',
                // template_path: '../../views/customers/email1.html',
                template_path: '../../views/customers/acceptrequest.html',
                context: { orderid },
            });
            req.flash('success', 'Order Cancellation ' + ' is Approved!');
            res.redirect('/staff/manage-orders/cancelrequests');
        }
    } catch (err) {
        console.log(err);
    }
});

// Reject Cancel Request
OrderManagement.get('/rejectcancelorder/:id', async function (req, res) {
    try {
        const request = await Cancelrequest.findOne({
            where: { OrderId: req.params.id },
        });

        if (!request) {
            flash(res, 'error', 'request not found');
            res.redirect('/staff/manage_order/cancelrequests');
            return;
        }
        console.log(request.status);
        if (request.status != 'null') {
            req.flash('error', ' You have already rejected or approved it');
            res.redirect('/staff/manage-orders/cancelrequests');
        } else {
            let result = await Cancelrequest.update(
                { status: 'Rejected' },
                { where: { id: request.id } }
            );

            const order = await Order.findByPk(req.params.id);
            const userID = order.UserId;
            const user = await User.findByPk(userID);
            let orderid = order.id;
            Mail.Send({
                email_recipient: user.email,
                subject: 'Order Cancellation Rejected',
                // template_path: '../../views/customers/email1.html',
                template_path: '../../views/customers/rejectrequest.html',
                context: { orderid },
            });

            req.flash('success', 'Order Cancellation ' + ' is Rejected!');
            res.redirect('/staff/manage-orders/cancelrequests');
        }
    } catch (err) {
        console.log(err);
    }
});

// Retrieve Cancellation Request
OrderManagement.get('/cancelrequests', async function (req, res) {
    try {
        const requests = await Cancelrequest.findAll({
            include: [
                {
                    model: Order,
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
                        {
                            model: Shippinginfo,
                        },
                    ],
                },
            ],
        });
        return res.render('./staff/ordermanagement/staff-cancel-request', {
            requests,
        });
    } catch (err) {
        console.log(err);
    }
});


OrderManagement.get('/top10', async function (req, res) {
    // TOP Selling Product of each category, Pre-built keyboard
    const top10sp = await OrderItem.findAll({
        
        attributes: [[sequelize.fn("SUM", sequelize.col("quantity")), "sold"]],
        include:{
            model: Product,
            where: {
                category :  "Pre-Built Keyboard"
            }
        },
        limit : 10,
        group: "ProductId",
        order: [[sequelize.fn("SUM", sequelize.col("quantity")), 'desc']]
    });
    // console.log('10')
    // console.log(top10s)

    // TOP Selling Product of each category, Barebone Kit

    const top10sb = await OrderItem.findAll({
        
        attributes: [[sequelize.fn("SUM", sequelize.col("quantity")), "sold"]],
        include:{
            model: Product,
            where: {
                category :  "Barebone Kit"
            }
        },
        limit : 10,
        group: "ProductId",
        order: [[sequelize.fn("SUM", sequelize.col("quantity")), 'desc']]
    });

    // TOP Selling Product of each category, Key Cap

    const top10sk = await OrderItem.findAll({
        
        attributes: [[sequelize.fn("SUM", sequelize.col("quantity")), "sold"]],
        include:{
            model: Product,
            where: {
                category :  "Key Cap"
            }
        },
        limit : 10,
        group: "ProductId",
        order: [[sequelize.fn("SUM", sequelize.col("quantity")), 'desc']]
    });

    // TOP Selling Product of each category, Switches
    const top10ss = await OrderItem.findAll({
        
        attributes: [[sequelize.fn("SUM", sequelize.col("quantity")), "sold"]],
        include:{
            model: Product,
            where: {
                category :  "Switches"
            }
        },
        limit : 10,
        group: "ProductId",
        order: [[sequelize.fn("SUM", sequelize.col("quantity")), 'desc']]
    });

    // TOP Selling Product of each category, Accessories
    const top10sa = await OrderItem.findAll({
        
        attributes: [[sequelize.fn("SUM", sequelize.col("quantity")), "sold"]],
        include:{
            model: Product,
            where: {
                category :  "Accessories"
            }
        },
        limit : 10,
        group: "ProductId",
        order: [[sequelize.fn("SUM", sequelize.col("quantity")), 'desc']]
    });


    return res.render('./staff/topsellingproduct',{top10sp,top10sb, top10sk,top10ss, top10sa })
})


OrderManagement.post('/delivery-detail/:id', async (req, res) => {
    const deliveryDetailId = req.params.id;
    const deliveryStage = req.body.deliveryStage;
    const nextDate = new Date();
    const order = await DeliveryDetail.findByPk(req.params.id)
    const deliveryDetail = await DeliveryDetail.findByPk(deliveryDetailId);
    switch (deliveryStage) {
        case 'complete':
            deliveryDetail.CompleteDate = nextDate;
            await Order.update(
                {shipping_status: "received"},
                {where:{ id: order.id}}
            )

        case 'received':
            deliveryDetail.ReceivedDate = nextDate;
            await Order.update(
                {
                shipping_status: "on the way"
                },
                {where:{
                    id: order.id
                }}
            )
            break;

        case 'ship':
            deliveryDetail.ShipOutDate = nextDate;
            await Order.update(
                {
                shipping_status: "shipped out"
                },
                {where:{
                    id: order.id
                }}
            )
            break;

        default:
            req.flash('danger', 'There was an error with the date specified');
            return res.redirect('/staff/manage-orders');
    }

    deliveryDetail.save();
    req.flash('success', 'Order delivery status successfully updated');
    res.redirect('/staff/manage-orders');
});

module.exports = OrderManagement;
