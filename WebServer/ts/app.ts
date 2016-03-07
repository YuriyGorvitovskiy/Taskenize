import * as Express from 'express';
import * as Session from 'express-session';
import * as Cookie from 'cookie-parser';
import * as Passport from 'passport';
import * as Google from 'passport-google-oauth';
import * as Mongo from 'mongodb';

import * as ActionTask  from './action/task';
import * as RouterTasks from './router/tasks';
import * as Util from './router/util';

var config = require('../../OAuth/config.secret.js').config;
//console.log('Config: ' + JSON.stringify(config))

var db : Mongo.Db = null;

Mongo.MongoClient.connect('mongodb://@127.0.0.1:27017/taskenize')
    .then((_db) => {
        db = _db;
        ActionTask.connect(_db);
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
Passport.use(new Google.OAuth2Strategy(<Google.IOAuth2StrategyOption>{
        clientID: config.google.client_id,
        clientSecret: config.google.client_secret,
        callbackURL: "http://localhost:8080/auth/callback",
        scope: ['https://www.googleapis.com/auth/plus.login']
    },
    function(accessToken, refreshToken, profile, done) {
        if (profile.id == "103797599429081501264") {
            console.log('Profile.ID: ' + profile.id);
            return done(null, profile);
        }

        console.log('Profile: ' + JSON.stringify(profile));
        //return done(null, false, { message: 'Unauthorised user.' });
        return done('Unauthorised user.', false);
    }
));
app.use(Passport.session());

app.get('/auth',
    (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin','*');
        next();
    },
    Passport.authenticate('google', { session: false })
);
app.get('/auth/callback',
    Passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    function(req, res) {
        req.session['user'] = req.user;
        res.redirect('/');
    }
);
app.get('/logout', function(req, res){
    req.session.destroy(()=>{
        req.logout();
        res.send('Goodbye');
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

app.listen(8080);
