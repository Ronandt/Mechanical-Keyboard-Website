// const express = require("express");
// const SendMail = require("../configuration/nodemailer");
// const Mail = require("../models/Mail");
// const User = require("../models/User");
// const manageMail = express.Router();
// let cron = require('node-cron');
// require('dotenv').config()
// const Sib = require('sib-api-v3-sdk')
// const client = Sib.ApiClient.instance
// const apiKey = client.authentications['api-key']
// apiKey.apiKey = process.env.API_KEY
// const apiInstance = new Sib.TransactionalEmailsApi();

// const monthsShort = {
//   Jan: '01',
//   Feb: '02',
//   Mar: '03',
//   Apr: '04',
//   May: '05',
//   Jun: '06',
//   Jul: '07',
//   Aug: '08',
//   Sep: '09',
//   Oct: '10',
//   Nov: '11',
//   Dec: '12',
// };

// cron.schedule('* * * * *', async function () {
//   const mail = await (await Mail.findAll()).map((x) => x.dataValues);
//   const user = await (await User.findAll()).map((x) => x.dataValues);
//   for (x = 0; x < mail.length; x++) {
//       var split_time = mail[x].date
//       var Date = split_time.toDateString().split(" ")
//       var Month = Date[1]
//       var Day = Date[2]
//       var Time = split_time.toTimeString().split(" ")
//       var Time_2 = Time[0]
//       var Time_3 = Time_2.split(":")
//       var hr = Time_3[0]
//       var min = Time_3[1]
//       console.log(Time_3)
//     if (mail[x].send_type == "Automatic") {
//       console.log('Automatic');
//       cron.schedule(`${min} ${hr} ${Day} ${monthsShort[Month]} *`, function () {
//         console.log('---------------------');
//         console.log('Sending Mail');
//         for (i = 0; i < user.length; i++) {
//             const email = user[i].email
//             const link = `http://localhost:3000/reset-password/${user[i].id}`
//             try {
//               SendMail.send(res, {
//                   to: email,
//                   subject: "Promotions",
//                   text: link,
//                   template: "./customers/email",
//                   context: { link },
//               });
//             } catch (e) {
//               req.flash("error", e)
//             }

//           }
//         })
//       }
//       else {
//             console.log("Manual");
//           }
//       }

// });

// manageMail
//     .route("/")
//   .get(async (req, res) => {
//         const mail = await (await Mail.findAll()).map((x) => x.dataValues);
//         return res.render("./staff/mails/mail-table", { mail });
//     });

// manageMail.route("/mail-form").get((req, res) => {
//   res.render("staff/mails/mail-form");
// }).post(async (req, res) => {
//   try {
//     Mail.create({ mail_title:req.body.mail_title,mail_subject:req.body.mail_subject,template_id:req.body.template_id,send_type:req.body.send_type,date:req.body.date,mail_type:req.body.mail_type })
//     req.flash("success", "Successfully create!")
//     return res.redirect("/staff/manage-mail")
//   } catch(e) {
//         req.flash("error", e)
//     }
// });

// manageMail.get('/deleteMail/:id', async function
// (req, res) {
//   try {
//     let mail = await Mail.findByPk(req.params.id);
//     let result = await Mail.destroy({ where: { id: mail.id } });
//     console.log(result + ' Mail deleted');
//     req.flash('success', 'Mail Deleted');
//     res.redirect('/staff/manage-mail');
//     }
//     catch (err) {
//       console.log(err);
//   }
// });
// manageMail.get('/sendMail/:id', async function
//   (req, res) {
//     const user = await (await User.findAll()).map((x) => x.dataValues);
//     const mail = await Mail.findByPk(req.params.id);
//    for (i = 0; i < user.length; i++) {
//       const email = user[i].email
//      const link = `http://localhost:3000/reset-password/${user[i].id}`

//       try {
//         // const sender = {
//         //   email: 'tayzheyin123@gmail.com',
//         //   name: 'TZY',
//         // }
//         // const receivers = [
//         //   {
//         //     email: email
//         //   },
//         // ]
//          SendMail.send(res, {
//             to: email,
//             subject: mail.mail_title,
//             text: link,
//             template: `./staff/email/${mail.template_id}`,
//             context: { link },
//          });

//         // apiInstance
//         //   .sendTransacEmail({
//         //     sender: sender,
//         //     to: receivers,
//         //     subject: mail.mail_title,
//         //     templateId: mail.template_id,
//         //   })
//         //   .then(console.log)
//         //   .catch(console.log)
//       } catch (e) {
//         req.flash("error", e)
//       }
//   };
//     req.flash("success", "Mail send successfully")
//     return res.redirect("/staff/manage-mail")

// });

// manageMail.get('/editMail/:id', (req, res) => {
//   Mail.findByPk(req.params.id)
//   .then((mail) => {
//     res.render('./staff/mails/mail-edit', { mail});
//   })
//   .catch(err => console.log(err));
// });

// manageMail.post('/editMail/:id', async (req, res) => {
//   const title = req.body.mail_title;
//   const subject = req.body.mail_subject;
//   const template = req.body.template_id;
//   const send_type = req.body.send_type;
//   const date = req.body.date;

//   const mail = await Mail.findByPk(req.params.id);
//   await mail.update({
//     title,
//     subject,
//     template,
//     send_type,
//     date
//   });

//   req.flash("success", "Mail updated!");
//   res.redirect("/staff/manage-mail");

// });

// module.exports = manageMail;
