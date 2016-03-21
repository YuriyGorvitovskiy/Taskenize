import * as Https from 'https';
import * as Express from 'express';
import * as Session from 'express-session';
import * as Cookie from 'cookie-parser';
import * as Passport from 'passport';
import * as Google from 'passport-google-oauth';
import * as Mongo from 'mongodb';

import * as ActionTask  from './action/task';
import * as ActionUser  from './action/user';
import * as RouterTasks from './router/tasks';
import * as RouterUser from './router/user';
import * as Util from './router/util';

var config = require('../../OAuth/config.secret.js').config;
//console.log('Config: ' + JSON.stringify(config))

var db : Mongo.Db = null;

Mongo.MongoClient.connect('mongodb://@127.0.0.1:27017/taskenize')
    .then((_db) => {
        db = _db;
        ActionTask.connect(_db);
        ActionUser.connect(_db);
        console.log('Connection to DB Successful')
    })
    .catch((err) => console.log('Connection to DB Failed: ' + err));

var app = Express();
app.use(Cookie());
var session = Session({
    resave: true,
    saveUninitialized: false,
    secret: config.session.secret
});


app.use(session);
app.use(Passport.initialize());

//The life of the entry in the map is between google verify and '/auth/callback'
var accessTokens : {[user_id:string]:string} = {};
Passport.use(new Google.OAuth2Strategy(<Google.IOAuth2StrategyOption>{
        clientID: config.google.client_id,
        clientSecret: config.google.client_secret,
        callbackURL: config.google.server_address + "/auth/callback",
        scope: ['https://www.googleapis.com/auth/plus.login']
    },
    function(accessToken, refreshToken, profile, done) {
        if (profile.id == "103797599429081501264") {
            accessTokens[profile.id] = accessToken;
            console.log('Profile.ID: ' + profile.id);
            return done(null, profile);
        }
        console.log('Profile: ' + JSON.stringify(profile));
        //return done(null, false, { message: 'Unauthorised user.' });
        return done('Unauthorised user.', false);
    }
));
app.use(Passport.session());

app.get('/auth', Passport.authenticate('google', { session: false }));
app.get('/auth/callback',
    Passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    function(req, res) {
        ActionUser.upsert(req.user)
            .then((user) => {
                req.session['user'] = user;
                req.session['access_token'] = accessTokens[user._id];
                delete accessTokens[user._id];
                res.redirect('/');
            });
    }
);

app.get('/logout', function(req, res) {
    Https.get("https://accounts.google.com/o/oauth2/logout?token=" + req.session['access_token'],
        (r) => {
            req.session.destroy(()=>{
                req.logout();
                res.redirect('/');
            });
    });
});

app.use(Express.static('../WebClient'));
app.use((req, res, next) => {
    req['db'] = db;
    next();
});
app.use('/rest/*', (req, res, next) => {
    if (req.session['user']) {
        return next();
    }
    res.sendStatus(401);
});

app.use('/rest/v1/tasks', RouterTasks.router);
app.use('/rest/v1/user', RouterUser.router);

app.listen(config.server_port);
console.log('Listen for: ' + config.server_port);
