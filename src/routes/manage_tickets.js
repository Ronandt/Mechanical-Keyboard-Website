const express = require('express');
const manageTicketRouter = express.Router();

const Ticket = require('../models/Ticket');
const TicketComment = require('../models/TicketComment');
const TicketAssignee = require('../models/TicketAssignee');
const User = require('../models/User');
manageTicketRouter.get('/', async (req, res) => {
    const tickets = await Ticket.findAll();
    return res.render('./staff/ticket/ticket-table', { tickets });
});

manageTicketRouter.patch('/', async (req, res) => {
    const ticket = await Ticket.findByPk(req.body.id);
    const meta = req.body.meta;
    const message = req.body.message;

    ticket.status = meta || ticket.status;
    ticket.save();
    await TicketComment.create({
        message,
        meta: meta || null,
        authorID: req.user.id,
        ticketID: ticket.id,
    });

    res.redirect(`/staff/tickets/${ticket.id}`);
});

manageTicketRouter.post('/assign/user', async (req, res) => {
    const userID = req.body.user;
    const ticketID = req.body.id;
    console.log(userID);

    const ticketAssignee = await TicketAssignee.findOne({
        where: { userID, ticketID },
    });

    if (ticketAssignee) {
        req.flash('error', `User already assigned to ticket ${ticketID}.`);
        return res.redirect(`/staff/tickets/${ticketID}`);
    }

    await TicketAssignee.create({
        ticketID,
        userID,
    });

    return res.redirect(`/staff/tickets/${ticketID}`);
});

manageTicketRouter.post('/reassign/user', async (req, res) => {
    const ticket = await Ticket.findByPk(req.body.id);
    const assignees = await TicketAssignee.findAll({
        where: { ticketID: ticket.id },
        include: { model: User },
    });
    const userIDs = req.body.users;
    const assigneeIDs = assignees.map((assignee) => assignee.id);

    console.log(userIDs);

    // add new assignees
    if (userIDs) {
        userIDs.forEach(async (userID) => {
            if (!assigneeIDs.includes(userID)) {
                await TicketAssignee.create({
                    ticketID: ticket.id,
                    userID: userID,
                });
            }
        });
    }

    // delete unassigned assignees
    if (assigneeIDs) {
        assigneeIDs.forEach(async (assigneeID) => {
            if (userIDs) {
                if (!userIDs.includes(assigneeID)) {
                    const assignee = await TicketAssignee.findOne({
                        where: {
                            ticketID: ticket.id,
                            userID: assigneeID,
                        },
                    });
                    await TicketAssignee.destroy(assignee);
                }
            } else {
                const assignee = await TicketAssignee.findOne({
                    where: {
                        ticketID: ticket.id,
                    },
                });
                if (assignee) {
                    await assignee.destroy();
                }
            }
        });
    }

    return res.redirect(`/staff/tickets/${ticket.id}`);
});

manageTicketRouter.post('/assign/category', async (req, res) => {
    const ticketID = req.body.id;
    const category = req.body.category;
    const ticket = await Ticket.findByPk(ticketID);
    ticket.update({ category });
    return res.redirect(`/staff/tickets/${ticket.id}`);
});

manageTicketRouter.post('/assign/severity', async (req, res) => {
    const ticketID = req.body.id;
    const severity = req.body.severity;
    const ticket = await Ticket.findByPk(ticketID);
    ticket.update({ severity });
    return res.redirect(`/staff/tickets/${ticket.id}`);
});

manageTicketRouter.get('/:id', async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    const ticket = await Ticket.findByPk(id, { include: User });
    const comments = await TicketComment.findAll({
        where: { ticketID: ticket.id },
        include: { model: User },
        order: [['createdAt', 'ASC']], // order ascending by creation date
    });
    const assignees = await TicketAssignee.findAll({
        where: { ticketID: ticket.id },
        include: { model: User },
    });
    if (ticket) {
        return res.render('./staff/ticket/ticket', {
            ticket,
            comments,
            user,
            assignees,
        });
    }
    req.flash('error', 'No such account!');
    return res.redirect('/staff');
});

module.exports = manageTicketRouter;
