import * as Cookie from "cookie-parser";
import * as Express from "express";
import * as Session from "express-session";
import * as Https from "https";
import * as Mongo from "mongodb";
import * as Passport from "passport";
import * as Google from "passport-google-oauth";

import * as ActionReport from "./action/report";
import * as ActionTask from "./action/task";
import * as ActionUser from "./action/user";
import * as RouterReport from "./router/report";
import * as RouterTasks from "./router/tasks";
import * as RouterUser from "./router/user";
import * as Util from "./util/util";

/* tslint:disable:no-var-requires */
export const config = require("../../OAuth/config.secret.js").config;
// console.log("Config: " + JSON.stringify(config))
/* tslint:enable:no-var-requires */

export class Application {
    public accessTokens: {[userId: string]: string} = {};

    public initMongoClient(): Promise<any> {
        return Mongo.MongoClient.connect("mongodb://@127.0.0.1:27017/taskenize")
            .then((db) => {
                ActionTask.connect(db);
                ActionUser.connect(db);
                ActionReport.connect(db);
                console.log("Connection to DB established");
            })
            .catch((err) => console.log("Connection to DB Failed: " + err));
    }

    public initPassportSession(app: Express.Application): void {
        Passport.use(new Google.OAuth2Strategy({
                callbackURL: config.google.server_address + "/auth/callback",
                clientID: config.google.client_id,
                clientSecret: config.google.client_secret,
                scope: ["https://www.googleapis.com/auth/plus.login"],
            } as Google.IOAuth2StrategyOption,
            (accessToken, refreshToken, profile, done) => {
                if (profile.id === "103797599429081501264") {
                    this.accessTokens[profile.id] = accessToken;
                    console.log("Profile.ID: " + profile.id);
                    return done(null, profile);
                }
                console.log("Profile: " + JSON.stringify(profile));
                return done("Unauthorised user.", false);
            },
        ));
        app.use(Passport.session());
    }

    public initPassportLogin(app: Express.Application): void {
        app.get("/auth", Passport.authenticate("google", { session: false }));
    }

    public initPassportCallback(app: Express.Application): void {
        app.get("/auth/callback",
            Passport.authenticate("google", { session: false, failureRedirect: "/login" }),
            (req, res) => this.passportCallback(req, res),
        );
    }

    public passportCallback(req, res): Promise<any> {
        return ActionUser.upsert(req.user)
            .then((user) => {
                req.session.user = user;
                req.session.access_token = this.accessTokens[user._id];
                delete this.accessTokens[user._id];
                res.redirect("/");
            });
    }

    public initPassportLogout(app: Express.Application): void {
        app.get("/logout", (req, res) => this.passportLogout(req, res));
    }

    public passportLogout(req, res): void {
        Https.get({
            host: "accounts.google.com",
            method: "GET",
            path: "/o/oauth2/logout?token=" + req.session.access_token,
            protocol: "https",
        }, (r) => {
            req.session.destroy(() => {
                req.logout();
                res.redirect("/");
            });
        });
    }

    public initPassport(app: Express.Application): void {
        this.initPassportSession(app);
        this.initPassportLogin(app);
        this.initPassportCallback(app);
        this.initPassportLogout(app);
    }

    public initApplicationRest(app: Express.Application): void {
        app.use("/rest/*", (req, res, next) => {
            if (req.session.user) {
                return next();
            }
            res.sendStatus(401);
        });

        app.use("/rest/v1/tasks", RouterTasks.router);
        app.use("/rest/v1/user", RouterUser.router);
        app.use("/rest/v1/report", RouterReport.router);
    }

    public initExpress(): void {
        const app = Express();
        app.use(Cookie());
        const session = Session({
            resave: true,
            saveUninitialized: false,
            secret: config.session.secret,
        });

        app.use(session);
        app.use(Passport.initialize());
        this.initPassport(app);
        this.initApplicationRest(app);

        app.use(Express.static("../WebClient"));

        app.listen(config.server_port);
        console.log("Listening for port: " + config.server_port);
    }
}

/* istanbul ignore next */
if (require.main === module) {
    new Application().initExpress();
}
