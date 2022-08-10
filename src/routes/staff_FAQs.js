const express = require("express");
const db = require("../models/database_setup");
const FAQs = require("../models/FAQs");
const FAQrouter = express.Router();

FAQrouter.get("/", (req, res) => {
  res.render("./staff/faqs/staff-manage-faqs");
});

FAQrouter.post("/", async function (req, res) {
  let { Category, Question, Answer } = req.body;
  console.log(req.body.Answer);
  FAQs.create({
    Category,
    Question,
    Answer,
  });

  req.flash("success", "FAQ has been successfully created");
  res.redirect("/staff/manage-faqs/faqs");
});

FAQrouter.get("/faqs", async (req, res) => {
  const faqs = (await FAQs.findAll()).map((x) => x.dataValues);
  return res.render("./staff/faqs/staff-faqs-tables", { faqs });
});

// FAQrouter.get('/updatefaqs/:id', async (req,res) => {
//     const faqs = await FAQs.findByPk(req.params.id);
//     console.log(faqs.dataValues)
//     res.render('./staff/staff-faqs-updatefaqs', {faqs:faqs.dataValues});
// })

FAQrouter.get("/updatefaqs/:id", (req, res) => {
  FAQs.findByPk(req.params.id)
    .then((faqs) => {
      res.render("./staff/faqs/staff-faqs-updatefaqs", { faqs });
    })
    .catch((err) => console.log(err));
});

// FAQrouter.post('/updatefaqs',async (req, res) => {
//     const faqs = await FAQs.findByPk(req.body.id);
//     console.log(req.body.id)
//     console.log(faqs)
//     if (req.body.Question) {
//         FAQs.Question = req.body.Question;
//     }
//     if (req.body.Answer) {
//         FAQs.Answer = req.body.Answer;
//     }
//     console.log(req.body.Question)
//     await faqs.update();
//     req.flash("success", "FAQ updated!");
//     res.redirect("/staff/manage-faqs/faqs");
//   });

FAQrouter.post("/updatefaqs/:id", (req, res) => {
  let Question = req.body.Question;
  let Answer = req.body.Answer;
  FAQs.update({ Question, Answer }, { where: { id: req.params.id } });
  req.flash("success", "FAQ updated!");
  res.redirect("/staff/manage-faqs/faqs");
});

FAQrouter.get("/deletefaqs/:id", async function (req, res) {
  try {
    let faqs = await FAQs.findByPk(req.params.id);
    if (!faqs) {
      flashMessage(res, "error", "Faq not found");
      res.redirect("/staff/manage-faqs/faqs");
      return;
    }
    let result = await FAQs.destroy({ where: { id: faqs.id } });
    req.flash("success", "FAQ" + result + " is deleted!");
    res.redirect("/staff/manage-faqs/faqs");
  } catch (err) {
    console.log(err);
  }
});

module.exports = FAQrouter;
