const FacebookStrategy = require('passport-facebook').Strategy
const passport = require('passport')

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    scope: 'email',
    profileFields: ['emails', 'name', 'photos'],
},
function(accessToken, refreshToken, profile, done) {
    console.log('jkfbjksdfjk', accessToken)
    // return done(null, profile)
    const { name, emails, id } = profile
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      id: id,
      accessToken
    }
    return done(null, user);
}))

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((obj, done) => {
    done(null, obj)
})