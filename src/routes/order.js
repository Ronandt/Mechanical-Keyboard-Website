const express = require('express');
const CustomerOrder = express.Router();
const { Order } = require('../models/order');
const { OrderItem } = require('../models/order');
const Product = require('../models/product');
const { Payment } = require('../models/order');
const { Cart } = require('../models/cart');
const ApplyVoucher = require('../models/ApplyVoucher');
const Voucher = require('../models/Voucher');
const moment = require('moment');

// fillOrderData
CustomerOrder.get('/', async (req, res) => {
    try {
        const cart = await Cart.findOne({
            where: { UserId: req.user.id },
            include: 'cartProducts',
        });
        if (!cart || !cart.cartProducts.length) {
            req.flash('error', 'Your shopping cart is empty!');
            return res.redirect('/cart');
        }
        const cartId = cart.id;
        const applyvoucher = await ApplyVoucher.findOne({
            where: { UserId: req.user.id },
        });
        if (!applyvoucher) {
            const totalPrice =
                cart.cartProducts.length > 0
                    ? cart.cartProducts
                          .map((d) => d.price * d.CartItem.quantity)
                          .reduce((a, b) => a + b)
                    : 0;
            let discount_price = totalPrice;
            res.render('./customers/page-checkout', {
                cartId,
                cart: cart.toJSON(),
                totalPrice,
                discount_price,
            });
        } else {
            const voucher = await Voucher.findOne({
                where: { id: applyvoucher.VoucherId },
            });
            const discount = voucher.voucher_value;
            const code = voucher.voucher_code;
            if (applyvoucher.VoucherId == voucher.id) {
                let totalPrice =
                    cart.cartProducts.length > 0
                        ? cart.cartProducts
                              .map((d) => d.price * d.CartItem.quantity)
                              .reduce((a, b) => a + b)
                        : 0;
                let discount_price = totalPrice - discount;
                if (discount_price < 0) {
                    discount_price = 0;
                }
                res.render('./customers/page-checkout', {
                    cartId,
                    cart: cart.toJSON(),
                    totalPrice,
                    discount,
                    code,
                    discount_price,
                });
            } else {
                const totalPrice =
                    cart.cartProducts.length > 0
                        ? cart.cartProducts
                              .map((d) => d.price * d.CartItem.quantity)
                              .reduce((a, b) => a + b)
                        : 0;
                res.render('./customers/page-checkout', {
                    cartId,
                    cart: cart.toJSON(),
                    totalPrice,
                });
            }
        }
    } catch (e) {
        console.log(e);
    }
});

// Post Order
CustomerOrder.post('/data', async (req, res) => {
    try {
        // check all products have inventory
        const cart = await Cart.findByPk(req.body.cartId, {
            include: 'cartProducts',
        });

        for (const product of cart.cartProducts) {
            if (product.stock < product.CartItem.quantity) {
                req.flash(
                    'error',
                    `Product Id:${product.id} only left with ${product.stock}, Please reselect quantity!`
                );
                return res.redirect('/cart');
            }
        }
        // update inventory data
        const productsMap = new Map();
        cart.cartProducts.forEach((product) => {
            productsMap.set(product.id, product.CartItem.quantity);
        });
        for (const [id, quantity] of productsMap) {
            const product = await Product.findByPk(id);
            await product.update({
                stock: (product.stock -= quantity),
            });
        }
        // create order (cart -> order)
        const order = await Order.create({
            UserId: req.user.id,
            // address: req.body.address,
            // phone: req.body.phone,
            // amount: req.body.amount,
            // shipping_status: req.body.shipping_status,
            // payment_status: req.body.payment_status
            amount: req.body.amount,
            shipping_status: req.body.shipping_status,
            payment_status: req.body.payment_status,
        });
        // create orderItem (cartItem -> orderItem)
        const items = Array.from({ length: cart.cartProducts.length }).map(
            (_, i) =>
                OrderItem.create({
                    OrderId: order.id,
                    ProductId: cart.cartProducts[i].id,
                    price: cart.cartProducts[i].price,
                    quantity: cart.cartProducts[i].CartItem.quantity,
                })
        );
        Promise.all(items);
        // send mail
        // const email = req.user.email
        // const subject = `[TEST] Keyhub Order with Order ID:${order.id} created, Please take time to pay`
        // const status = 'Unshipped / Unpaid'
        // const msg = 'Please click the payment link and pay with a test credit card! Thanks for your cooperation!'
        // sendMail(email, subject, orderMail(order, status, msg))
        // clear cart & cartItem
        await cart.destroy();
        // clear cartId in session
        req.session.cartId = '';
        return res.redirect(`/order/payment/${order.id}`);
    } catch (e) {
        console.log(e);
    }
});

// cancelOrder
CustomerOrder.get('/cancel/:id', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        await order.update({
            order_status: 'Cancelled',
        });
        req.flash('error', `OrderId${order.id} cancelled!`);
        return res.status(200).redirect('back');
    } catch (e) {
        console.log(e);
    }
});

CustomerOrder.get('/payment/:id', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        const OrderId = order.id;
        console.log(OrderId);
        return res.render('./customers/page-payment', { OrderId });
    } catch (e) {
        console.log(e);
    }
});

// Post Payment
CustomerOrder.post('/paymentdata/:id', async (req, res) => {
    try {
        // find order
        const order = await Order.findByPk(req.params.id);
        console.log(order);
        // create payment data
        await Payment.create({
            OrderId: order.id,
            payment_method: 'VISA',
            isSuccess: 1,
            payTime: moment().format('YYYY-MM-DD HH:mm'),
        });

        // update payment_status
        await order.update({
            payment_status: 1,
        });
        // send mail
        // const email = req.user.email
        // const subject = `[TEST]Key Hub OrderID:${order.id} Payment Done!`
        // const status = 'Unshipped / Unpaid'
        // const msg = 'Shipment will be arranged in the near future, please pay attention to the email again!'
        // sendMail(email, subject, payMail(order, status, msg))
        // flash message
        return res.redirect(`/order/success`);
    } catch (e) {
        console.log(e);
    }
});

CustomerOrder.get('/success', async (req, res) => {
    // const orders = await Order.findAll({
    //     include: [
    //         {
    //             model: OrderItem,
    //             include: {
    //                 model: Product
    //             }
    //         },
    //         {
    //             model: User
    //         },
    //     ],
    // });

    return res.render('./customers/page-success');
});

module.exports = CustomerOrder;
