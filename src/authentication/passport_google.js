const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const User = require('../models/User');

async function InitaliseGoogleLogin() {
    passport.use(
        new GoogleStrategy(
            {
                clientID:
                    '70066158066-ea8u4ot65lj1m73i13brakk4sbc4oh6t.apps.googleusercontent.com',
                clientSecret: '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',
                callbackURL: 'http://localhost:3000/login-google/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                const [user, created] = await User.findOrCreate({
                    where: { email: profile.emails[0].value },
                    defaults: {
                        username: profile.displayName,
                        password: null,
                        isStaff: 0,
                        email: profile.emails[0].value,
                        authMethod: 'oauth',
                    },
                });

                if (user.authMethod !== 'oauth') {
                    return done(null, false, {
                        message:
                            'An account that is not yours has an account. Please contact an administrator to resolve this dispute.',
                    });
                } else if (created) {
                    return done(null, user, {
                        message: 'You created your account! Welcome',
                    });
                } else {
                    if (user.disabled) {
                        return done(null, false, {
                            message: 'Your account has been disabled!',
                        });
                    }
                    return done(null, user, { message: 'Welcome!' });
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        return done(null, user);
    });

    passport.deserializeUser((user, done) => {
        return done(null, user);
    });
}

module.exports = InitaliseGoogleLogin;
