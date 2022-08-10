const AnonymousStrategy = require('passport-anonymous').Strategy;
const passport = require('passport');

function initalisePassportAnonymous() {
    passport.use(new AnonymousStrategy());
}
module.exports = initalisePassportAnonymous;
