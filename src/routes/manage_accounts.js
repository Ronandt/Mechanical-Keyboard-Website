const express = require("express");
const User = require("../models/User");
const manageAccountRoute = express.Router();
manageAccountRoute
  .route("/")
  .get(async (req, res) => {
    const users = await (await User.findAll()).map((x) => x.dataValues);
    return res.render("./staff/staff-tables", { users });
  })
  .post(async (req, res) => {
   
   
    const method = req.body.method
    switch(method) {
  
      case "DELETE":

        await User.destroy({ where: { id: req.body.id } });
    
        break;
      case "PATCH":
      
        const user = await User.findByPk(req.body.id);
        user.isStaff = req.body.isStaff || user.isStaff;
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        if (req.body.password != "") {
          user.password = req.body.password; //unable to use short circuit eval as hashed password
        }
    
        await user.save();
        req.flash("success", "User updated!");
        break;
      default:
        break;


    }
    res.redirect("/staff/accounts")
  });

manageAccountRoute.get("/:id", async (req, res) => {
  const id = req.params.id
  const user = await User.findByPk(id);
  if (user) {
    return res.render("./staff/staff-manage-account", {
      user: user.dataValues, //what happens when no id
    });
  }
  req.flash("error", "No such account!");
  return res.redirect("/staff");
});

module.exports = manageAccountRoute;
