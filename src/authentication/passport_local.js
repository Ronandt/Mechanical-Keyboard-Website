const LocalStrategy = require("passport-local").Strategy;
const db = require("../models/database_setup");
const User = require("../models/User");
const passport = require("passport");

function initalisePassportLocal() {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ where: { email } });
          console.log(user)
          return user?.compareHash(password)
            ? done(null, user, { message: "You have been logged in" })
            : done(null, false, { message: "No such account" });
        } catch (e) {
          console.log(e);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    return done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    return done(null, await User.findOne({ where: { id } }));
  });
}

module.exports = initalisePassportLocal;