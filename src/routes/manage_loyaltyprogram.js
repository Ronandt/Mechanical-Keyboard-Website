const express = require('express');
const User = require('../models/User');
const LoyaltyCard = require('../models/LoyaltyCard');
const { CustomerVoucher } = require('../models/CustomerVoucher');
const { VoucherItem } = require('../models/CustomerVoucher');
const Voucher = require('../models/Voucher');
const Redeemables = require('../models/Redeemables');
const { Mail, transporter } = require('../configuration/nodemailer');
const manage_loyaltyprogram = express.Router();

manage_loyaltyprogram.get('/', async (req, res) => {
    const User_Cards = await LoyaltyCard.findAll();
    const Users = await User.findAll();
    const Redeems = await Redeemables.findAll();
    const Vouchers = await Voucher.findAll();
    res.render('./staff/loyaltyprogram/loyaltyprogram-table', {
        User_Cards,
        Users,
        Redeems,
        Vouchers,
    });
});

manage_loyaltyprogram.post('/account/disabled/:id', async (req, res) => {
    const User_Card = await LoyaltyCard.findOne({
        where: { id: req.params.id },
    });
    User_Card.update({
        Activation: 'Off',
    });
    req.flash('success', 'Account has been disabled');
    res.redirect('/staff/manage-loyaltyprogram');
});
manage_loyaltyprogram.post('/account/enabled/:id', async (req, res) => {
    const User_Card = await LoyaltyCard.findOne({
        where: { id: req.params.id },
    });
    User_Card.update({
        Activation: 'On',
    });
    req.flash('success', 'Account has been enabled');
    res.redirect('/staff/manage-loyaltyprogram');
});

manage_loyaltyprogram.post('/rewards/delete/:id', async (req, res) => {
    const Redeem = await Redeemables.findOne({ where: { id: req.params.id } });
    Redeem.destroy();

    req.flash('success', 'Reward has been removed');
    res.redirect('/staff/manage-loyaltyprogram');
});

module.exports = manage_loyaltyprogram;
