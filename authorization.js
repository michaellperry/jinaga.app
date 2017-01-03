var passport = require('passport');

module.exports = function( app, config ) {
    config = config || {};

    var baseUrl = process.env.BASE_URL || config.baseUrl;
    if (!baseUrl) {
        throw new Error('Please configure a base URL in config as baseUrl: \'http://localhost:8080\', or environment variable BASE_URL');
    }

    var strategy, authenticateFunction, loginUrl, redirectUrl, usePost;
    
    if (config.google) {
        strategy = createGoogleStrategy(config.google, baseUrl);
        authenticateFunction = authenticateGoogle;
        loginUrl = config.google.loginUrl || '/loginGoogle';
        redirectUrl = config.google.redirectUrl || '/loginGoogle/callback';
        usePost = false;
    }
    else if (config.ad) {
        strategy = createAdStrategy(config.ad, baseUrl);
        authenticateFunction = authenticateAd;
        loginUrl = config.ad.loginUrl || '/loginAd';
        redirectUrl = config.ad.redirectUrl || '/loginAd/callback';
        usePost = true;
    }
    else {
        throw new Error('Please configure either google or ad in config/config.js.');
    }

    passport.use(strategy);

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

    var authenticate = authenticateFunction();

    function authenticationCallback(req, res) {
        var redirect_to = req.session.redirect_to ? req.session.redirect_to : '/';
        delete req.session.redirect_to;
        res.redirect( redirect_to );
    }
    app.get(loginUrl, authenticate);
    if (usePost) {
        app.post(redirectUrl, authenticate, authenticationCallback);
    }
    else {
        app.get(redirectUrl, authenticate, authenticationCallback);
    }

    return {
        initialize: doPassportInitialize,
        session: doPassportSession,
        require: function requireAuth(req, res, next) {
            if (req.isAuthenticated()) {
               return next();
            }
            req.session.redirect_to = req.originalUrl;
            return res.redirect(loginUrl);
        }
    };

    function createGoogleStrategy(google, baseUrl) {
        var clientId = process.env.GOOGLE_CLIENT_ID || google.clientId;
        var clientSecret = process.env.GOOGLE_CLIENT_SECRET || google.clientSecret;
        if (!clientId || !clientSecret) {
            throw new Error('Please configure Google client ID and secret in config as google { clientId: \'xxx\', clientSecret: \'yyy\' }, or environment variables GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
        }

        var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
        return new GoogleStrategy({
                clientID: clientId,
                clientSecret: clientSecret,
                callbackURL: baseUrl + (google.redirectUrl || '/loginGoogle/callback')
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
        );
    }

    function authenticateGoogle() {
        return passport.authenticate('google', {
            failureRedirect: '/',
            scope: 'openid profile'
        });
    }

    function createAdStrategy(ad, baseUrl) {
        var realm = process.env.AD_REALM || ad.realm;
        var logoutUrl = process.env.AD_LOGOUT_URL || ad.logoutUrl;
        var identityProviderUrl = process.env.AD_IDENTITY_PROVIDER_URL || ad.identityProviderUrl;
        var identityMetadata = process.env.AD_IDENTITY_METADATA || ad.identityMetadata;
        if (!realm || !logoutUrl || !identityProviderUrl || !identityMetadata) {
            throw new Error('Please configure AD realm, URLs, and metadata in config as ad { realm: \'http://mydomain\', logoutUrl: \'/logout\', ' +
                'identityProviderUrl: \'https://login.windows.net/my-tenant-id/wsfed\', identityMetadata: \'https://login.windows.net/my-tenant-id/federationmetadata/2007-06/federationmetadata.xml\' }, ' +
                'or environment variables AD_REALM, AD_LOGOUT_URL, AD_IDENTITY_PROVIDER_URL, and AD_IDENTITY_METADATA.');
        }
        
        var WsfedStrategy = require('passport-azure-ad').WsfedStrategy;
        return new WsfedStrategy({
                realm: realm,
                logoutUrl: baseUrl + logoutUrl,
                identityProviderUrl: identityProviderUrl,
                identityMetadata: identityMetadata
            },
            function (profile, done) {
                return done(null, {
                    provider: profile.provider,
                    id: profile.id,
                    profile: {
                        displayName: profile["http://schemas.microsoft.com/identity/claims/displayname"]
                    }
                });
            });
    }

    function authenticateAd() {
        return passport.authenticate('wsfed-saml2', {
            failureRedirect: '/'
        });
    }
};
