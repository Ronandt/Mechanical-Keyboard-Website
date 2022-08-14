const express = require('express');
const ShoppingCart = express.Router();
const { Cart } = require('../models/cart');
const { CartItem } = require('../models/cart');
const Product = require('../models/product');
const User = require('../models/User');
const { CustomerVoucher } = require('../models/CustomerVoucher');
const { VoucherItem } = require('../models/CustomerVoucher');
const Voucher = require('../models/Voucher');
const ApplyVoucher = require('../models/ApplyVoucher');

// GET Cart
ShoppingCart.get('/', async (req, res) => {
    try {
        if (req.user) {
            const cart = await Cart.findOne({
                where: { UserId: req.user.id },
                include: 'cartProducts',
            });
            if (!cart) {
                res.render('./customers/page-shopping-cart');
            }
            // Apply Voucher

            const applyvoucher = await ApplyVoucher.findOne({
                where: { UserId: req.user.id },
            });
            const cartitem = await (
                await CartItem.findAll({ where: { CartId: cart.id } })
            ).map((x) => x.dataValues);
            let shipping = 5;
            let no_discount = 0;
            if (cartitem.length > 0) {
                if (applyvoucher) {
                    const voucher = await Voucher.findOne({
                        where: { id: applyvoucher.VoucherId },
                    });
                    if (voucher.voucher_cat == 'Discount') {
                        const discount = voucher.voucher_value;
                        const code = voucher.voucher_code;
                        let totalPrice =
                            cart.cartProducts.length > 0
                                ? cart.cartProducts
                                      .map((d) => d.price * d.CartItem.quantity)
                                      .reduce((a, b) => a + b)
                                : 0;
                        let discount_price = totalPrice - discount + shipping;
                        if (discount_price < 0) {
                            discount_price = 0;
                        }
                        if (discount_price > 250) {
                            discount_price = discount_price - shipping;
                            shipping = 0;
                        }
                        res.render('./customers/page-shopping-cart', {
                            cart: cart.toJSON(),
                            totalPrice,
                            discount,
                            code,
                            discount_price,
                            shipping,
                        });
                    } else if (voucher.voucher_cat == 'Cashback') {
                        const cashback = voucher.voucher_value;
                        const code = voucher.voucher_code;

                        const totalPrice =
                            cart.cartProducts.length > 0
                                ? cart.cartProducts
                                      .map((d) => d.price * d.CartItem.quantity)
                                      .reduce((a, b) => a + b)
                                : 0 + shipping;
                        let discount_price = totalPrice + shipping;
                        if (discount_price > 250) {
                            discount_price = discount_price - shipping;
                            shipping = 0;
                        }
                        res.render('./customers/page-shopping-cart', {
                            cart: cart.toJSON(),
                            totalPrice,
                            cashback,
                            code,
                            shipping,
                        });
                    }
                } else {
                    const totalPrice =
                        cart.cartProducts.length > 0
                            ? cart.cartProducts
                                  .map((d) => d.price * d.CartItem.quantity)
                                  .reduce((a, b) => a + b)
                            : 0;

                    let discount_price = totalPrice + shipping;

                    if (discount_price > 250) {
                        discount_price = discount_price - shipping;
                        shipping = 0;
                    }
                    res.render('./customers/page-shopping-cart', {
                        cart: cart.toJSON(),
                        totalPrice,
                        discount_price,
                        no_discount,
                        shipping,
                    });
                }
            } else {
                const totalPrice =
                    cart.cartProducts.length > 0
                        ? cart.cartProducts
                              .map((d) => d.price * d.CartItem.quantity)
                              .reduce((a, b) => a + b)
                        : 0;
                shipping = 0;
                let discount_price = totalPrice;
                res.render('./customers/page-shopping-cart', {
                    cart: cart.toJSON(),
                    totalPrice,
                    no_discount,
                    discount_price,
                    shipping,
                });
            }
        } else {
            req.flash('error', 'please login as customer first');
            return res.redirect('/login');
        }
    } catch (e) {
        console.log(e);
    }
});

ShoppingCart.post('/postcart', async (req, res) => {
    try {
        // check product has inventory
        const addProduct = await Product.findByPk(req.body.productId);
        if (addProduct.stock === 0) {
            req.flash(
                'error',
                `ProductId:${req.body.productId} is out of stock!`
            );
            return res.redirect('/');
        }
        // find cart or create
        let cart = {};
        if (req.user) {
            const [userCart] = await Cart.findOrCreate({
                where: {
                    UserId: req.user.id || 0,
                },
            });
            cart = userCart;
        } else {
            const [userCart] = await Cart.findOrCreate({
                where: {
                    id: req.session.cartId || 0,
                },
                defaults: {
                    UserId: 0,
                },
            });
            cart = userCart;
        }

        // find items in the cart or not
        const [product, created] = await CartItem.findOrCreate({
            where: {
                CartId: cart.id,
                ProductId: req.body.productId,
            },
            defaults: {
                quantity: 1,
            },
        });
        if (!created) {
            // check product quantity+1 > inventory or not
            if (product.quantity + 1 > addProduct.stock) {
                req.flash(
                    'error',
                    `ProductId:${req.body.productId} stock left with${addProduct.stock}!`
                );
                // return res.redirect('back')
            }
            product.quantity += 1;
        }
        await product.save();

        // save cartId in session
        req.session.cartId = cart.id;
        return res.redirect('/cart');
    } catch (e) {
        console.log(e);
    }
});

// ShoppingCart.get('/', async (req, res) =>{
//   try {
//     const cart = await Cart.findOne({
//       where: { UserId: req.user.id },
//       include: "cartProducts"
//     })

//     const cartcount = cart.cartProducts.length
//     res.render('./customers/page-shopping-cart',{cartcount})

//   }catch (e) {
//     console.log(e)
//   }
// });

// Add Cart Item
ShoppingCart.post('/:productId/add', async (req, res) => {
    try {
        // find cart
        const product = await CartItem.findByPk(req.params.productId);
        // find product inventory
        const addProduct = await Product.findByPk(product.ProductId);
        // check product quantity+1 > inventory or not
        if (product.quantity + 1 > addProduct.stock) {
            req.flash(
                'error',
                `ProductId:${product.ProductId} stocks left with ${addProduct.stock}`
            );
            // return res.redirect('back')
        }
        await product.update({
            quantity: product.quantity + 1,
        });
        return res.status(200).redirect('back');
    } catch (e) {
        console.log(e);
    }
});
// ShoppingCart.post('/:voucherId/add', async (req, res) => {

// })
// subCartItem
ShoppingCart.post('/:productId/sub', async (req, res) => {
    try {
        // find cart
        const product = await CartItem.findByPk(req.params.productId);
        await product.update({
            quantity: product.quantity - 1 ? product.quantity - 1 : 1,
        });
        return res.status(200).redirect('back');
    } catch (e) {
        console.log(e);
    }
});

// Delete Cart Item
ShoppingCart.get('/:productId', async (req, res) => {
    try {
        // find cart
        const product = await CartItem.findByPk(req.params.productId);
        await product.destroy();
        req.flash('success', 'Successuflly deleted');
        return res.redirect('/cart');
    } catch (e) {
        console.log(e);
        // return next(e)
    }
});
// Apply Voucher
ShoppingCart.post('/applyvoucher', async (req, res) => {
    try {
        // Apply Voucher
        let previous_code = req.body.previous_code;
        let code = req.body.voucher_code;
        const voucher = await Voucher.findOne({
            where: { voucher_code: code },
        });
        if (voucher) {
            const voucherlist = await CustomerVoucher.findOne({
                where: { UserID: req.user.id },
            });
            const voucheritem = await VoucherItem.findOne({
                where: { VoucherId: voucher.id, VoucherListId: voucherlist.id },
            });
            if (voucheritem) {
                const cart = await Cart.findOne({
                    where: { UserId: req.user.id },
                    include: 'cartProducts',
                });
                if (!cart) {
                    req.flash('error', 'Cart is empty ! Unable to apply code');
                } else {
                    const totalPrice =
                        cart.cartProducts.length > 0
                            ? cart.cartProducts
                                  .map((d) => d.price * d.CartItem.quantity)
                                  .reduce((a, b) => a + b)
                            : 0;
                    if (voucher.spend <= totalPrice)
                        if (previous_code) {
                            const old_voucher = await Voucher.findOne({
                                where: { voucher_code: previous_code },
                            });
                            const removevoucher = await ApplyVoucher.findOne({
                                where: {
                                    VoucherId: old_voucher.id,
                                    UserId: req.user.id,
                                },
                            });
                            await removevoucher.destroy();
                            ApplyVoucher.create({
                                VoucherId: voucher.id,
                                UserId: req.user.id,
                            });
                        } else {
                            ApplyVoucher.create({
                                VoucherId: voucher.id,
                                UserId: req.user.id,
                            });
                            req.flash('success', 'Voucher Applied!');
                        }
                    else {
                        const difference = voucher.spend - totalPrice;
                        req.flash(
                            'error',
                            'Please spend $' +
                                difference +
                                ' more to apply voucher'
                        );
                    }
                }
            } else {
                req.flash('error', 'Code has expired / Code is invalid');
            }
        } else {
            req.flash('error', 'Please use a valid code');
        }

        return res.redirect('/cart');

        // if (voucheritem) {
        //   if (voucheritem.usage <= 0){
        //     if (!previous_code) {
        //       if (voucher) {
        //         if (voucher.voucher_type == "Master") {
        //           if (voucherlist) {
        //             const item = await VoucherItem.findOne({
        //               where: {
        //                 VoucherListId: voucherlist.id,
        //                 VoucherId: voucher.id
        //               }
        //             })
        //             if (item) {
        //               ApplyVoucher.create({
        //                 VoucherId: voucher.id,
        //                 UserId: req.user.id
        //               })
        //             }
        //             else {
        //               req.flash("error", "You have yet to claim " + voucher.voucher_title)
        //               return res.redirect('/cart')
        //             }
        //           } else {
        //             req.flash("error", "You have yet to claim " + voucher.voucher_title)
        //             return res.redirect('/cart')
        //           }

        //         }
        //         else {
        //           if (voucherlist) {
        //             const item = await VoucherItem.findOne({
        //               where: {
        //                 VoucherListId: voucherlist.id,
        //                 VoucherId: voucher.id
        //               }
        //             })
        //             if (item) {
        //               ApplyVoucher.create({
        //                 VoucherId: voucher.id,
        //                 UserId: req.user.id
        //               })
        //             }
        //             else {
        //               req.flash("error", "You have yet to redeem " + voucher.voucher_title)
        //               return res.redirect('/cart')
        //             }
        //           } else {
        //             req.flash("error", "You have yet to redeem " + voucher.voucher_title)
        //             return res.redirect('/cart')
        //           }
        //         }
        //       } else {
        //         req.flash("error", "Please use a valid code!")
        //         return res.redirect('/cart')
        //       }

        //     } else {
        //       if (voucher) {
        //         const old_voucher = await Voucher.findOne({
        //           where: { voucher_code: previous_code }
        //         });
        //         const removevoucher = await ApplyVoucher.findOne({
        //           where: { VoucherId: old_voucher.id, UserId: req.user.id }
        //         })
        //         await removevoucher.destroy()
        //         if (voucher.voucher_type == "Master") {
        //           if (voucherlist) {
        //             const item = await VoucherItem.findOne({
        //               where: {
        //                 VoucherListId: voucherlist.id,
        //                 VoucherId: voucher.id
        //               }
        //             })
        //             if (item) {
        //               ApplyVoucher.create({
        //                 VoucherId: voucher.id,
        //                 UserId: req.user.id
        //               })
        //             }
        //             else {
        //               req.flash("error", "You have yet to redeem " + voucher.voucher_title)
        //               return res.redirect('/cart')
        //             }
        //           } else {
        //             req.flash("error", "You have yet to redeem " + voucher.voucher_title)
        //             return res.redirect('/cart')
        //           }
        //         }
        //         else {
        //           if (!voucher) {
        //             req.flash("error", "Please use a valid code!")
        //             return res.redirect('/cart')
        //           } else {
        //             if (voucherlist) {
        //               const item = await VoucherItem.findOne({
        //                 where: {
        //                   VoucherListId: voucherlist.id,
        //                   VoucherId: voucher.id
        //                 }
        //               })
        //               if (item) {
        //                 ApplyVoucher.create({
        //                   VoucherId: voucher.id,
        //                   UserId: req.user.id
        //                 })
        //               }
        //               else {
        //                 req.flash("error", "You have yet to redeem " + voucher.voucher_title)
        //                 return res.redirect('/cart')
        //               }
        //             } else {
        //               req.flash("error", "You have yet to redeem " + voucher.voucher_title)
        //               return res.redirect('/cart')
        //             }
        //           }
        //         }
        //       } else {
        //         req.flash("error", "Please use a valid code!")
        //       }

        //     }
        // }
        // else {
        //   req.flash("error","Voucher has already been used !")
        // }
        // } else {
        // req.flash("error","Voucher has not been claimed or redeemed !")
        // }

        // return res.redirect('/cart')
    } catch (e) {
        console.log(e);
    }
});

// Remove Voucher
ShoppingCart.post('/removevoucher/:vouchercode', async (req, res) => {
    // find cart
    let code = req.params.vouchercode;
    const voucher = await Voucher.findOne({
        where: { voucher_code: code },
    });
    const removevoucher = await ApplyVoucher.findOne({
        where: { VoucherId: voucher.id, UserId: req.user.id },
    });
    await removevoucher.destroy();

    return res.redirect('/cart');
});
module.exports = ShoppingCart;
