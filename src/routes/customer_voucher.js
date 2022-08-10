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
                await Voucher.findAll()
            ).map((x) => x.dataValues);
            console.log(voucherlist);
            res.render('./customers/customer_voucher/customervoucher', {
                voucherlist,
                voucher,
            });
        } else {
            const voucher = await (
                await Voucher.findAll()
            ).map((x) => x.dataValues);
            res.render('./customers/customer_voucher/customervoucher', {
                voucher,
            });
        }

        // req.flash('error', 'please login as customer first')
        // return res.redirect('/login')
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

            // find items in the cart or not
            const [item, created] = await VoucherItem.findOrCreate({
                where: {
                    VoucherListId: voucherlist.id,
                    VoucherId: req.body.voucherID,
                },
                defaults: {
                    usage: 0,
                },
            });
            // update inventory data

            const voucher = await Voucher.findByPk(req.body.voucherID);
            if (
                req.body.status == 'Inactive' ||
                voucher.voucher_used >= voucher.total_voucher
            ) {
                req.flash(
                    'error',
                    `${req.body.name} Voucher has been fully claimed!`
                );
                return res.redirect('/CustomerVoucher');
            } else if (!created) {
                req.flash(
                    'error',
                    `${req.body.name} Voucher has been already been claimed`
                );
                return res.redirect('/CustomerVoucher');
            } else {
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
            return res.redirect('/CustomerVoucher');
        } else {
            req.flash('error', 'please login as customer first');
            return res.redirect('/login');
        }
    } catch (e) {
        console.log(e);
    }
});

module.exports = customervoucher;
