const express = require('express');
const ticketRouter = express.Router();
const Ticket = require('../models/Ticket');

ticketRouter.get('/', async (req, res) => {
    if (req.isUnauthenticated()) {
        req.flash('error', 'To submit a ticket, you must be logged in.');
        return res.redirect('/login');
    }
    return res.render('./customers/ticket/submit-ticket');
});

ticketRouter.post('/', async (req, res) => {
    const authorID = req.user.id;
    let { title, description, category, severity } = req.body;

    await Ticket.create({
        authorID,
        title,
        description,
        category,
        severity,
    });

    req.flash('success', 'Ticket submitted!');
    return res.redirect('/ticket');
});

module.exports = ticketRouter;
