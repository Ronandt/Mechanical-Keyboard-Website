const express = require('express');
const CustomerOrder = express.Router();
const { Order } = require('../models/order');
const { OrderItem } = require('../models/order');
const Product = require('../models/product');
const { Payment } = require('../models/order');
const { Cart } = require('../models/cart');
const DeliveryDetail = require('../models/DeliveryDetail');
const ApplyVoucher = require('../models/ApplyVoucher');
const Voucher = require('../models/Voucher');
const moment = require('moment');
const { Shippinginfo } = require('../models/order');
const { CustomerVoucher, VoucherItem } = require('../models/CustomerVoucher');
const LoyaltyCard = require('../models/LoyaltyCard');
const User = require('../models/User');
const { Mail } = require('../configuration/nodemailer');

// fillOrderData
CustomerOrder.get('/', async (req, res) => {
    try {
        const cart = await Cart.findOne({
            where: { UserId: req.user.id },
            include: 'cartProducts',
        });
        const user = await User.findByPk(req.user.id);
        if (!cart || !cart.cartProducts.length) {
            req.flash('error', 'Your shopping cart is empty!');
            return res.redirect('/cart');
        }
        const cartId = cart.id;
        const applyvoucher = await ApplyVoucher.findOne({
            where: { UserId: req.user.id },
        });
        let shipping = 5;
        let no_discount = 0;
        if (!applyvoucher) {
            let totalPrice =
                cart.cartProducts.length > 0
                    ? cart.cartProducts
                          .map((d) => d.price * d.CartItem.quantity)
                          .reduce((a, b) => a + b)
                    : 0;
            let discount_price = totalPrice + shipping;
            if (discount_price > 250) {
                shipping = 0;
                discount_price = totalPrice + shipping;
            }
            if (discount_price < 0) {
                discount_price = 0;
            }
            res.render('./customers/page-checkout', {
                cartId,
                cart: cart.toJSON(),
                totalPrice,
                discount_price,
                shipping,
                no_discount,
                user,
            });
        } else {
            const voucher = await Voucher.findOne({
                where: { id: applyvoucher.VoucherId },
            });
            if (voucher.voucher_cat == 'Discount') {
                const discount = voucher.voucher_value;
                const code = voucher.voucher_code;
                if (applyvoucher.VoucherId == voucher.id) {
                    let totalPrice =
                        cart.cartProducts.length > 0
                            ? cart.cartProducts
                                  .map((d) => d.price * d.CartItem.quantity)
                                  .reduce((a, b) => a + b)
                            : 0;
                    let discount_price = totalPrice - discount + shipping;
                    if (totalPrice > 250) {
                        shipping = 0;
                        discount_price = discount_price - shipping;
                    }

                    if (discount_price < 0) {
                        discount_price = 0;
                    }
                    res.render('./customers/page-checkout', {
                        cart: cart.toJSON(),
                        totalPrice,
                        discount,
                        code,
                        discount_price,
                        shipping,
                    });
                }
            } else if (voucher.voucher_cat == 'Cashback') {
                const cashback = voucher.voucher_value;
                const code = voucher.voucher_code;
                let totalPrice =
                    cart.cartProducts.length > 0
                        ? cart.cartProducts
                              .map((d) => d.price * d.CartItem.quantity)
                              .reduce((a, b) => a + b)
                        : 0;
                let discount_price = totalPrice + shipping;
                if (totalPrice > 250) {
                    shipping = 0;
                    discount_price = totalPrice + shipping;
                }

                if (discount_price < 0) {
                    discount_price = 0;
                }
                res.render('./customers/page-checkout', {
                    cart: cart.toJSON(),
                    totalPrice,
                    cashback,
                    code,
                    discount_price,
                    shipping,
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
                    shipping,
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
        const cart = await Cart.findOne({
            where: { UserId: req.user.id },
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
            subtotal: req.body.subtotal,
            amount: req.body.amount,
            discount: req.body.discount,
            shipping_fee: req.body.shipping,
            shipping_status: "pending",
            payment_status: req.body.payment_status,
        });
        // create order delivery details
        const deliveryDetail = await DeliveryDetail.create({
            OrderId: order.id,
            shipping_status: 'pending',
            ShipOutDate: null,
            ReceivedDate: null,
            CompleteDate: null,
        });

        //Create Shippinginfo of the order
        Shippinginfo.create({
            Fname: req.body.firstname,
            Lname: req.body.lastname,
            address: req.body.address,
            zipcode: req.body.zipcode,
            OrderId: order.id,
        });

        const User_Card = await LoyaltyCard.findOne({
            where: { authorID: req.user.id },
        });
        if (User_Card) {
            let Order_Points = parseInt(req.body.amount);
            let New_Points =
                User_Card.Active_Points +
                parseInt(req.body.cashback) +
                Order_Points;
            let Total_New_Points =
                New_Points + User_Card.Used_Points + Order_Points;
            await User_Card.update({
                Active_Points: New_Points,
                Total_Points: Total_New_Points,
            });
        }
        const applyvoucher = await ApplyVoucher.findOne({
            where: { UserId: req.user.id },
        });

        if (applyvoucher) {
            const voucheritem = await VoucherItem.findOne({
                where: { VoucherId: applyvoucher.VoucherId },
            });
            await voucheritem.update({ usage: voucheritem.usage + 1 });
            await applyvoucher.destroy();
        }

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
        await cart.destroy();
        // clear cartId in session
        req.session.cartId = '';
        return res.redirect(`/order/payment/${order.id}`);
    } catch (e) {
        console.log(e);
    }
});

// cancelOrder
// CustomerOrder.get('/cancel/:id', async (req, res) => {
//     try {
//         const order = await Order.findByPk(req.params.id)
//         await order.update({
//           order_status: 'Cancelled'
//         })
//         req.flash('error', `OrderId${order.id} cancelled!`)
//         return res.status(200).redirect('back')
//     } catch (e) {
//       console.log(e)
//     }
// });

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
        // const order = await Order.findByPk({req.params.id);
        const order = await Order.findOne({
            where: {
                id: req.params.id,
            },
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
                {
                    model: Payment,
                },
            ],
        });

        // console.log(order);
        // create payment data

        await Payment.create({
            OrderId: order.id,
            Payment_method: 'VISA',
            isSuccess: 1,
            last4digit: req.body.cardnum,
            payTime: moment().format('YYYY-MM-DD HH:mm'),
        });

        // update payment_status
        await order.update({
            payment_status: 1,
        });
        // send mail
        // const link = `http://localhost:3000/reset-password/${user.id}/${user.resetTokenID}`;
        const userID = order.UserId;
        const user = await User.findByPk(userID);
        const payment = await Payment.findOne({
            where: { OrderId: order.id },
        });
        Mail.Send({
            email_recipient: user.email,
            subject: 'Your Receipt',
            // template_path: '../../views/customers/email1.html',
            template_path: '../../views/customers/emailreceipt.html',
            context: { order, payment },
        });
        return res.redirect(`/order/success`);
    } catch (e) {
        console.log(e);
    }
});

CustomerOrder.get('/success', async (req, res) => {
    return res.render('./customers/page-success');
});

module.exports = CustomerOrder;
