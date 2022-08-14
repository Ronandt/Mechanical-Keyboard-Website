const express = require('express');
const Voucher = require('../models/Voucher');
const User = require('../models/User');
const { CustomerVoucher } = require('../models/CustomerVoucher');
const { VoucherItem } = require('../models/CustomerVoucher');
const manageVoucher = express.Router();
const { Mail, transporter } = require('../configuration/nodemailer');
const Redeemables = require('../models/Redeemables');
const cron = require('node-cron');
const moment = require('moment');
require('dotenv').config();
const fetch = require('node-fetch');

const url = require('url');



// let sendSmtpEmail = new Sib.SendSmtpEmail();
// const email = req.query.email;
// console.log(email)
// WHEN CUSTOMER USE A VOUCHER IT UPDATES USAGE IN VOUCHERITEMS
//  const voucheritem = await VoucherItem.findByPk(req.body.voucherID)
//             await voucheritem.update({
//                 usage: voucheritem.usage += 1
//             });

cron.schedule('*/1 * * * * ', async () => {
    console.log('running a task every 1 minute');
    const vouchers = (await Voucher.findAll()).map((x) => x.dataValues);
    console.log(vouchers);
    vouchers.forEach((voucher) => {
        var startAt = moment(voucher.start_date).format('YYYY-MM-DD HH:mm:ss');
        // console.log(voucher.createdAt)
        var enddate = moment(startAt)
            .add(voucher.days, 'days')
            .format('YYYY-MM-DD HH:mm:ss');
        var now = moment().format('YYYY-MM-DD HH:mm:ss');
        // console.log(enddate)
        // console.log(startAt)
        // console.log("done");
        if (enddate <= startAt) {
            console.log('waiting');
            console.log(now);
            const find_voucher = Voucher.findOne({
                where: { id: voucher.id, voucher_status: 'Active' },
            });
            if (find_voucher) {
                Voucher.update(
                    { voucher_status: 'Inactive' },
                    { where: { id: voucher.id } }
                );
                console.log('updated');
            } else {
                console.log('no update needed');
            }
        }
    });
});

// vouchers.forEach(voucher => {
//       var startAt = moment(voucher.start_date).format('YYYY-MM-DD HH:mm:ss')
//       console.log(voucher.createdAt)
//       var enddate = moment(startAt).add(voucher.days, 'days').format('YYYY-MM-DD HH:mm:ss')
//       var now = moment().format('YYYY-MM-DD HH:mm:ss')
//       console.log(enddate)
//       console.log("done");
//       if (now >= startAt){
//           Voucher.update({voucher_status: "InActive"});
//           console.log("updated")
//       }
// });

manageVoucher.route('/').get(async (req, res) => {
    try {
        const voucher = await (
            await Voucher.findAll()
        ).map((x) => x.dataValues);
        const user = await (await User.findAll()).map((x) => x.dataValues);
        const voucherlist = await CustomerVoucher.findAll({
            include: ['voucheritem', { model: User }],
        });
        const voucheritem = await (
            await VoucherItem.findAll()
        ).map((x) => x.dataValues);

        console.log(voucherlist);

        res.render('./staff/voucher/voucher-table', {
            voucherlist,
            voucher,
            user,
            voucheritem,
        });
    } catch (e) {
        console.log(e);
    }

    
  })


manageVoucher.get('/deleteVoucher/:id', async function (req, res) {
    try {
        let voucher = await Voucher.findByPk(req.params.id);
        let result = await Voucher.destroy({ where: { id: voucher.id } });

        req.flash('success', 'Voucher Deleted');
        res.redirect('/staff/manage-vouchers');
    } catch (e) {
        console.log(e);
    }
});
manageVoucher.get('/editVoucher/:id', (req, res) => {
    Voucher.findByPk(req.params.id)
        .then((voucher) => {
            res.render('./staff/voucher/voucher-edit', { voucher });
        })
        .catch((err) => console.log(err));
});

manageVoucher.post('/editVoucher/:id', async (req, res) => {
    // const coupon_id = req.body.coupon_id;
    // const coupon_name = req.body.coupon_name;
    // const coupon_value = req.body.coupon_value;
    // const coupon_status = req.body.coupon_status;
    // const coupon_desc = req.body.coupon_desc;
    // const coupon_qty = req.body.coupon_qty;
    // const start = req.body.start_date;
    // const end = req.body.end_date;
    // const coupon_type = req.body.coupon_type;
    var startAt = moment(req.body.start_date).format('YYYY-MM-DD HH:mm:ss');

    const voucher = await Voucher.findByPk(req.params.id);
    await voucher.update({
        voucher_title: req.body.voucher_title,
        voucher_name: req.body.voucher_name,
        voucher_value: req.body.voucher_value,
        voucher_code: voucher.voucher_code,
        total_voucher: req.body.total_voucher,
        voucher_used: voucher.voucher_used,
        voucher_desc: req.body.voucher_desc,
        start_date: startAt,
        spend: req.body.spend,
        days: req.body.days,
        // voucher_type: req.body.voucher_type,
        voucher_cat: req.body.voucher_cat,
        usage: req.body.usage,
        spend: req.body.spend,
    });

    req.flash('success', 'Voucher updated!');
    res.redirect('/staff/manage-vouchers');
});

manageVoucher
    .route('/voucher-form')
    .get((req, res) => {
        // if (req.isUnauthenticated() || !req.user.isStaff) {
        //   return res.redirect("/");
        // }
        // else {
        res.render('staff/voucher/voucher-form');
        // }
    })
    .post(async (req, res) => {
        try {
            var startAt = moment(req.body.start_date).format(
                'YYYY-MM-DD HH:mm:ss'
            );

            Voucher.create({
                voucher_title: req.body.voucher_title,
                voucher_name: req.body.voucher_name,
                voucher_value: req.body.voucher_value,
                voucher_code: req.body.voucher_code,
                voucher_status: req.body.voucher_status,
                total_voucher: req.body.total_voucher,
                voucher_used: req.body.voucher_used,
                voucher_desc: req.body.voucher_desc,
                start_date: startAt,
                days: req.body.days,
                voucher_type: req.body.voucher_type,
                voucher_cat: req.body.voucher_cat,
                usage: req.body.usage,
                spend: req.body.spend,
            });

            req.flash('success', 'Successfully created Voucher!');
            return res.redirect('/staff/manage-vouchers');
        } catch (e) {
            req.flash('error', e);
        }
    });

manageVoucher.post('/sendmail/:voucher_id', async (req, res) => {
    const voucherlist = await CustomerVoucher.findAll({
        where: { setrole: 1 },
    });
    for (i = 0; i < voucherlist.length; i++) {
        const send_to = await User.findOne({
            where: { id: voucherlist[i].UserID },
        });

        if (send_to) {
            const link = `http://localhost:3000/staff/manage-vouchers/emailvoucher/${send_to.id}/${req.params.voucher_id}`;

            Mail.Send({
                email_recipient: `${send_to.email}`,
                subject: 'Thank You for your Patron',
                template_path: '../../views/staff/voucher/vouchermail_1.html',
                context: { link },
            });
        } else {
            req.flash('error', 'No Mail to send');
            res.redirect('/staff/manage-vouchers');
        }

        const link = `http://localhost:3000/staff/manage-vouchers/emailvoucher/${send_to.id}/${req.params.voucher_id}`;

        Mail.Send({
            email_recipient: `${send_to.email}`,
            subject: 'Thank You for your Patron',
            template_path: '../../views/staff/voucher/vouchermail_1.html',
            context: { link },
        });
    }

    req.flash('success', 'Mail sent successfully');
    res.redirect('/staff/manage-vouchers');
});

manageVoucher.post('/emailvoucher/:user_id/:voucher_id', async (req, res) => {
    const voucherlist = await CustomerVoucher.findOne({
        where: {
            UserID: req.params.user_id || 0,
        },
    });
    const voucher = await Voucher.findByPk(req.params.voucher_id);

    // find items in voucher list
    const item = await VoucherItem.findOne({
        where: {
            VoucherListId: voucherlist.id,
            VoucherId: voucher.id,
        },
    });
    if (item) {
        req.flash('error', 'You have already redeem this voucher !');
        res.redirect('/');
    } else {
        const Redeemcount = await Redeemables.findOne({
            where: { VoucherId: voucher.id },
        });
        voucher.update({
            voucher_used: voucher.voucher_used + 1,
        });
        Redeemcount.update({
            Redeemcount: Redeemcount.Redeemcount + 1,
        });

        await VoucherItem.create({
            VoucherListId: voucherlist.id,
            VoucherId: voucher.id,
            Type: 'Reward',
            usage: 0,
        });
        req.flash('success', 'Congrats, You have just redeem this voucher!');
        res.redirect('/');
    }
});

// manageVoucher.post('/', async (req, res) => {

//     const voucherlist = await CustomerVoucher.findOne({
//         where: {
//           UserID: req.params.user_id || 0
//         }
//       })
//     const voucher = await Voucher.findByPk(req.params.voucher_id)

//     // find items in voucher list
//     const item = await VoucherItem.findOne({
//       where: {
//         VoucherListId:voucherlist.id,
//         VoucherId:voucher.id,
//       },
//     })
//   if (item) {

//       req.flash("error", "You have already redeem this voucher !")
//       res.redirect("/");
//     } else {
//       voucher.update({
//               voucher_used:voucher.voucher_used + 1
//           })

//       await VoucherItem.create({ VoucherListId: voucherlist.id, VoucherId: voucher.id, Type: "Reward", usage: 0 })
//       req.flash("success", "Congrats, You have just redeem this voucher!")
//       res.redirect("/");
//     }
// })
module.exports = manageVoucher;
