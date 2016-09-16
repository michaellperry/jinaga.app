var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

module.exports = function( app, config ) {
    config = config || {};
    var google = config.google || {};
    var baseUrl = process.env.BASE_URL || config.baseUrl;
    if (!baseUrl) {
        throw new Error('Please configure a base URL in config as baseUrl: \'http://localhost:8080\', or environment variable BASE_URL');
    }

    var clientId = process.env.GOOGLE_CLIENT_ID || google.clientId;
    var clientSecret = process.env.GOOGLE_CLIENT_SECRET || google.clientSecret;
    if (!clientId || !clientSecret) {
        throw new Error('Please configure Google client ID and secret in config as google { clientId: \'xxx\', clientSecret: \'yyy\' }, or environment variables GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
    }

    passport.use(new GoogleStrategy({
            clientID: clientId,
            clientSecret: clientSecret,
            callbackURL: baseUrl + '/loginGoogle/callback'
        },
        function(accessToken, refreshToken, profile, done) {
            done(null, {
                provider: profile.provider,
                id: profile.id,
                profile: {
                    displayName: profile.displayName
                }
            });
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, JSON.stringify(user));
    });

    passport.deserializeUser(function(str, done) {
        done(null, JSON.parse(str));
    });

    var doPassportInitialize = passport.initialize();
    var doPassportSession = passport.session();
    app.use(doPassportInitialize);
    app.use(doPassportSession);

    var authenticate = passport.authenticate('google', {
        failureRedirect: '/',
        scope: 'openid profile'
    });
    function authenticationCallback(req, res) {
        var redirect_to = req.session.redirect_to ? req.session.redirect_to : '/';
        delete req.session.redirect_to;
        res.redirect( redirect_to );
    }
    app.get('/loginGoogle', authenticate);
    app.get('/loginGoogle/callback', authenticate, authenticationCallback);

    return {
        initialize: doPassportInitialize,
        session: doPassportSession,
        require: function requireAuth(req, res, next) {
            if (req.isAuthenticated()) {
               return next();
            }
            req.session.redirect_to = req.originalUrl;
            return res.redirect('/loginGoogle');
        }
    }
};
