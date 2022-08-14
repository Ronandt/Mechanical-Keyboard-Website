const express = require('express');
const db = require('../models/database_setup');
const User = require('../models/User');
const passport = require('passport');
const { Mail, transporter } = require('../configuration/nodemailer');
const { CustomerVoucher } = require('../models/CustomerVoucher');

const loginRouter = express.Router();
var handlebars = require('handlebars');
const { callbackPromise } = require('nodemailer/lib/shared');
const path = require('path');

/*loginRouter.use((req, res, next) => {
    if (req.isAuthenticated()) {
        req.flash("info", "You have already logged in. Please logout first")
        res.redirect("/")
    }
    
    next()
})*/

loginRouter
    .route('/register')
    .get((req, res) => {
        res.render('./customers/page-user-register');
    })
    .post(async (req, res) => {
        try {
            if (req.body.repeatpassword != req.body.password) {
                req.flash(
                    'error',
                    'Your repeat password and password are not the same!'
                );
                return res.redirect('/register');
            } else if (
                await User.findOne({ where: { email: req.body.email } })
            ) {
                req.flash('error', 'Email is not unique!');
                return res.redirect('/register');
            }
            await User.create({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                isStaff: false,
            });
            const Find_User = await User.findOne({
                where: { email: req.body.email },
            });
            if (req.body.promotions) {
                await CustomerVoucher.create({
                    UserID: Find_User.id,
                    setrole: 1,
                });
            } else {
                await CustomerVoucher.create({
                    UserID: Find_User.id,
                    setrole: 0,
                });
            }

            req.flash('success', 'Successfully registered!');
            return res.redirect('/login');
        } catch (e) {
            req.flash('error', e);
        }
    });

loginRouter
    .route('/login-google')
    .get(passport.authenticate('google', { scope: ['profile', 'email'] }));
loginRouter.route('/login-google/callback').get(
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true,
        successFlash: true,
    }),
    (req, res) => {
        res.redirect('/');
    }
);

loginRouter
    .route('/login')
    .get((req, res) => {
        res.render('./customers/page-user-login');
    })
    .post(
        passport.authenticate(['local', 'anonymous'], {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true,
            successFlash: true,
        }),
        (req, res) => {
            req.flash('error', 'No such account');
            res.redirect('/login');
        }
    );

loginRouter
    .route('/reset-password')
    .get(async (req, res) => {
        res.render('./customers/page-reset-password');
    })
    .post(async (req, res) => {
        const user = await User.findOne({ where: { email: req.body.email } });
        if (user /*&& user.authMethod == "local"*/) {
            user.generateResetToken();
            const link = `http://localhost:3000/reset-password/${user.id}/${user.resetTokenID}`;

            Mail.Send({
                email_recipient: user.email,
                subject: 'Your Reset Link',
                template_path: '../../views/customers/email1.html',
                context: { link },
            });
        }

        req.flash(
            'success',
            'Reset link to your email sent! Please check your email.'
        );
        res.redirect('/reset-password');
    });

loginRouter
    .route('/reset-password/:id/:uuid')
    .get(async (req, res) => {
        const user = await User.findByPk(req.params.id);
        if (req.params.uuid === user.resetTokenID && user.verifyTokenAge()) {
            return res.render('./customers/page-password-verified-reset', {
                id: req.params.id,
                uuid: req.params.id,
            });
        }
        req.flash(
            'error',
            'The token is either invalid or expired! Please reset your password again.'
        );
        return res.redirect('/reset-password');
    })
    .post((req, res) => {
        if (req.body.password === req.body.repeatpassword) {
            User.update(
                { password: req.body.password },
                { where: { id: req.params.id } }
            );
            req.flash('success', 'Password changed!');
            return res.redirect('/login');
        }
        res.flash('error', 'Repeat password must be the same as the password');
    });

module.exports = loginRouter;
