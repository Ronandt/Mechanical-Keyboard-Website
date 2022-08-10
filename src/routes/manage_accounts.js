const express = require('express');
const User = require('../models/User');
const manageAccountRoute = express.Router();
const { Op } = require('sequelize');

manageAccountRoute
    .route('/')
    .get(async (req, res) => {
        const users = await (await User.findAll()).map((x) => x.dataValues);
        return res.render('./staff/staff-tables', { users });
    })
    .delete(async (req, res) => {
        await User.destroy({ where: { id: req.body.id } });
        req.flash('error', 'Account has been deleted');
        res.redirect('/staff/accounts');
    })
    .patch(async (req, res) => {
        const user = await User.findByPk(req.body.id);
        user.isStaff = req.body.isStaff || user.isStaff;
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password; //unable to use short circuit eval as hashed password
        }

        await user.save();
        req.flash('success', 'User updated!');
        res.redirect('/staff/accounts');
    })
    .post(async (req, res) => {
        const user = await User.findByPk(req.body.id);

        await user.update({ disabled: req.body.disable });
        await user.save();
        console.log(req.body.disable);
        if (+req.body.disable) {
            req.flash('error', 'User has been disabled!');
        } else {
            req.flash('success', 'User has been undisabled');
        }
        res.redirect('/staff/accounts');
    });

// Author: @lx0f
// To get staff usernames and id when
// querying and assigning users to a ticket
// Refer to route /staff/tickets/:id (API)
manageAccountRoute.route('/users/:query').get(async (req, res) => {
    const query = req.params.query;
    const users = await User.findAll({
        attributes: ['id', 'username'],
        where: {
            username: {
                [Op.regexp]: query,
            },
            isStaff: 1, // 1 == truthy
        },
    });
    return res.send({ users });
});

manageAccountRoute.get('/:id', async (req, res) => {
    const id = req.params.id;
    const user = await User.findByPk(id);
    if (user) {
        return res.render('./staff/staff-manage-account', {
            user: user.dataValues, //what happens when no id
        });
    }
    req.flash('error', 'No such account!');
    return res.redirect('/staff');
});

module.exports = manageAccountRoute;
