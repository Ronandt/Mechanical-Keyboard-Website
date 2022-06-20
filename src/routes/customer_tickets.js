const express = require("express");
const ticketRouter = express.Router();
const Ticket = require("../models/Ticket");
const User = require("../models/User");

ticketRouter.get("/", async (req, res) => {
    if (req.isUnauthenticated()) {
        req.flash("error", "To submit a ticket, you must be logged in.");
        return res.redirect("/login");
    }
    return res.render("./customers/ticket/submit-ticket");
});

ticketRouter.post("/", async (req, res) => {
    const authorID = req.user.id;
    const title = req.body.title;
    const description = req.body.description;
    const category = req.body.category;
    const severity = req.body.severity;

    await Ticket.create({
        authorID,
        title,
        description,
        category,
        severity,
    });

    req.flash("success", "Ticket submitted!");
    return res.redirect("/ticket");
});

ticketRouter.get("/status", async (req, res) => {
    if (req.isUnauthenticated()) {
        req.flash("error", "To view tickets, you must be logged in.");
        return res.redirect("/login");
    }

    const userID = req.user.id;
    const tickets = await Ticket.findAll({ where: { authorID: userID } });

    return res.render("./customers/ticket/ticket-status", {
        tickets,
    });
});

module.exports = ticketRouter;
