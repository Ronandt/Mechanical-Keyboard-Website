const express = require("express");
const Voucher = require("../models/Voucher");
const User = require("../models/User");
const manageVoucher = express.Router();
require('dotenv').config()
// let sendSmtpEmail = new Sib.SendSmtpEmail();
// const email = req.query.email;
// console.log(email)

manageVoucher.get('/deleteVoucher/:id', async function
(req, res) {
  try {
    let voucher = await Voucher.findByPk(req.params.id);
    let result = await Voucher.destroy({ where: { id: voucher.id } });
    console.log(result + ' video deleted');
    req.flash('success', 'Voucher Deleted');
    res.redirect('/staff/manage-vouchers');
    }
    catch (err) {
      console.log(err);
  }
});
manageVoucher.get('/editVoucher/:id', (req, res) => {
  Voucher.findByPk(req.params.id)
  .then((voucher) => {
    res.render('./staff/voucher/voucher-edit', { voucher });
  })
  .catch(err => console.log(err));
});

manageVoucher.post('/editVoucher/:id', async (req, res) => {
  const coupon_id = req.body.coupon_id;
  const coupon_name = req.body.coupon_name;
  const coupon_value = req.body.coupon_value;
  const coupon_status = req.body.coupon_status;
  const coupon_desc = req.body.coupon_desc;
  const coupon_qty = req.body.coupon_qty;
  const start = req.body.start_date;
  const end = req.body.end_date; 
  const coupon_type = req.body.coupon_type;

  const voucher = await Voucher.findByPk(req.params.id);
  await voucher.update({
      voucher_name: req.body.voucher_name,
      voucher_value: req.body.voucher_value,
      voucher_code: req.body.voucher_code,
      voucher_status: req.body.voucher_status,
      total_voucher: req.body.total_voucher,
      voucher_used: req.body.voucher_used,
      voucher_desc: req.body.voucher_desc,
      start_date: req.body.start_date,
      days: req.body.days,
      voucher_type: req.body.voucher_type

  });

  req.flash("success", "Voucher updated!");
  res.redirect("/staff/manage-vouchers");

})

manageVoucher
  .route("/")
  .get(async (req, res) => {
    const voucher = await (await Voucher.findAll()).map((x) => x.dataValues);
    const user = await (await User.findAll()).map((x) => x.dataValues);
    return res.render("./staff/voucher/voucher-table", { voucher, user });
  })


manageVoucher.route("/voucher-form").get((req, res) => {
// if (req.isUnauthenticated() || !req.user.isStaff) {
//   return res.redirect("/");
// }
// else {
  res.render("staff/voucher/voucher-form");
// }

}).post(async (req, res) => {
  try {
    Voucher.create({
      voucher_name: req.body.voucher_name,
      voucher_value: req.body.voucher_value,
      voucher_code: req.body.voucher_code,
      voucher_status: req.body.voucher_status,
      total_voucher: req.body.total_voucher,
      voucher_used: req.body.voucher_used,
      voucher_desc: req.body.voucher_desc,
      start_date: req.body.start_date,
      days: req.body.days,
      voucher_type: req.body.voucher_type
    })
    req.flash("success", "Successfully created Master Voucher!")
    return res.redirect("/staff/manage-vouchers")
  } catch(e) {
        req.flash("error", e)
    }
});

module.exports = manageVoucher;
