const express = require('express');
const User = require('../models/User');
const { CustomerVoucher } = require('../models/CustomerVoucher');
const { VoucherItem } = require('../models/CustomerVoucher');
const Voucher = require('../models/Voucher');

const customervoucher = express.Router();

customervoucher.get('/', async (req, res) => {
    try {
        if (req.user) {
            const voucherlist = await CustomerVoucher.findOne({
                where: { UserID: req.user.id },
                include: 'voucheritem',
            });

            const voucher = await (
                await Voucher.findAll({ where: { voucher_type: 'Master' } })
            ).map((x) => x.dataValues);
            console.log(voucherlist);
            if (!voucher) {
                res.render('./customers/customer_voucher/customervoucher');
            }
            res.render('./customers/customer_voucher/customervoucher', {
                voucherlist,
                voucher,
            });
        } else {
            const voucher = await (
                await Voucher.findAll({ where: { voucher_type: 'Master' } })
            ).map((x) => x.dataValues);
            if (!voucher) {
                res.render('./customers/customer_voucher/customervoucher');
            }
            res.render('./customers/customer_voucher/customervoucher', {
                voucher,
            });
        }
    } catch (e) {
        console.log(e);
    }
});
// Add customer voucher
customervoucher.post('/postvoucherlist', async (req, res) => {
    try {
        if (req.user) {
            let list = {};
            const [voucherlist] = await CustomerVoucher.findOrCreate({
                where: {
                    UserID: req.user.id || 0,
                },
            });
            list = voucherlist;

            // find items in voucher list

            // update voucher data

            const voucher = await Voucher.findByPk(req.body.voucherID);
            if (!voucher) {
                const voucher = await Voucher.findOne({
                    where: { voucher_code: req.body.code },
                });
                if (!voucher) {
                    req.flash('error', `Please use a valid code!`);
                    return res.redirect('/account/myvouchers');
                }
                const [item, created] = await VoucherItem.findOrCreate({
                    where: {
                        VoucherListId: voucherlist.id,
                        VoucherId: voucher.id,
                    },
                    defaults: {
                        Type: 'Daily',
                        usage: 0,
                    },
                });

                if (
                    req.body.status == 'Inactive' ||
                    voucher.voucher_used >= voucher.total_voucher
                ) {
                    req.flash(
                        'error',
                        `${voucher.voucher_title} Voucher has been fully claimed!`
                    );
                    return res.redirect('/account/myvouchers');
                } else if (!created) {
                    req.flash(
                        'error',
                        `${voucher.voucher_title} Voucher has been already been claimed`
                    );
                    return res.redirect('/account/myvouchers');
                } else {
                    await voucher.update({
                        voucher_used: (voucher.voucher_used += 1),
                    });
                    if (voucher.voucher_used >= voucher.total_voucher) {
                        await voucher.update({
                            voucher_used: (voucher.voucher_used += 1),
                        });
                        if (voucher.voucher_used >= voucher.total_voucher) {
                            await voucher.update({
                                voucher_status: 'Inactive',
                            });
                        }
                    }

                    await item.save();
                    req.flash('success', 'Successfully redeem voucher');
                    return res.redirect('/account/myvouchers');
                }
            } else {
                const [item, created] = await VoucherItem.findOrCreate({
                    where: {
                        VoucherListId: voucherlist.id,
                        VoucherId: req.body.voucherID,
                    },
                    defaults: {
                        Type: 'Daily',
                        usage: 0,
                    },
                });
                if (
                    req.body.status == 'Inactive' ||
                    voucher.voucher_used >= voucher.total_voucher
                ) {
                    req.flash(
                        'error',
                        `${voucher.voucher_title} Voucher has been fully claimed!`
                    );
                    return res.redirect('/CustomerVoucher');
                } else if (!created) {
                    req.flash(
                        'error',
                        `${voucher.voucher_title} Voucher has been already been claimed`
                    );
                    return res.redirect('/CustomerVoucher');
                } else {
                    await voucher.update({
                        voucher_used: (voucher.voucher_used += 1),
                    });
                    if (voucher.voucher_used >= voucher.total_voucher) {
                        await voucher.update({
                            voucher_used: (voucher.voucher_used += 1),
                        });
                        if (voucher.voucher_used >= voucher.total_voucher) {
                            await voucher.update({
                                voucher_status: 'Inactive',
                            });
                        }
                    }

                    await item.save();
                    req.flash('success', 'Successfully redeem voucher');
                    return res.redirect('/CustomerVoucher');
                }
            }
        } else {
            req.flash('error', 'please login as customer first');
            return res.redirect('/login');
        }
    } catch (e) {
        console.log(e);
    }
});

module.exports = customervoucher;
