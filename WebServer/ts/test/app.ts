import * as Chai from "chai";
import * as Mocha from "mocha";
import * as Proxyquire from "proxyquire";
import * as Sinon from "sinon";

import * as Cookie from "cookie-parser";
import * as Express from "express";
import * as Session from "express-session";
import * as Https from "https";
import * as Mongo from "mongodb";
import * as Passport from "passport";
import * as Google from "passport-google-oauth";

import * as ActionReport from "../action/report";
import * as ActionTask from "../action/task";
import * as ActionUser from "../action/user";
import * as ModelUser from "../model/user";
import * as RouterReport from "../router/report";
import * as RouterTasks from "../router/tasks";
import * as RouterUser from "../router/user";

import * as App from "../app";

/* tslint:disable:no-unused-expression */
Chai.should();

describe("App", () => {
    describe("initMongoClient()", () => {
        it("check main flow", () => {
            const application = new App.Application();
            const db = {mongo: "connection"};
            const stubConsoleLog = Sinon.stub(console, "log");
            const stubActionReport = Sinon.stub(ActionReport, "connect");
            const stubActionTask = Sinon.stub(ActionTask, "connect");
            const stubActionUser = Sinon.stub(ActionUser, "connect");
            const stubMongoConnect = Sinon.stub(Mongo.MongoClient, "connect").returns(new Promise((resolve, reject) => {
                resolve(db);
            }));
            return application.initMongoClient().then(() => {
                stubConsoleLog.restore();
                stubActionReport.restore();
                stubActionTask.restore();
                stubActionUser.restore();
                stubMongoConnect.restore();

                stubMongoConnect.calledWith("mongodb://@127.0.0.1:27017/taskenize").should.be.true;
                stubActionUser.calledWith(db).should.be.true;
                stubActionTask.calledWith(db).should.be.true;
                stubActionReport.calledWith(db).should.be.true;
                stubConsoleLog.calledWith("Connection to DB established");
            });
        });
        it("check mongo connect failure", () => {
            const application = new App.Application();
            const error = "Test Mongo Error";
            const stubConsoleLog = Sinon.stub(console, "log");
            const stubActionReport = Sinon.stub(ActionReport, "connect");
            const stubActionTask = Sinon.stub(ActionTask, "connect");
            const stubActionUser = Sinon.stub(ActionUser, "connect");
            const stubMongoConnect = Sinon.stub(Mongo.MongoClient, "connect").returns(new Promise((resolve, reject) => {
                reject(error);
            }));
            return application.initMongoClient().then(() => {
                stubConsoleLog.restore();
                stubActionReport.restore();
                stubActionTask.restore();
                stubActionUser.restore();
                stubMongoConnect.restore();

                stubMongoConnect.calledWith("mongodb://@127.0.0.1:27017/taskenize").should.be.true;
                stubActionUser.called.should.be.false;
                stubActionTask.called.should.be.false;
                stubActionReport.called.should.be.false;
                stubConsoleLog.calledWith("Connection to DB failed: " + error);
            });
        });
        it("check module failure", () => {
            const application = new App.Application();
            const error = "Test Mongo Error";
            const db = {mongo: "connection"};
            const stubConsoleLog = Sinon.stub(console, "log");
            const stubActionTask = Sinon.stub(ActionTask, "connect");
            const stubActionUser = Sinon.stub(ActionUser, "connect").throws(error);
            const stubActionReport = Sinon.stub(ActionReport, "connect");
            const stubMongoConnect = Sinon.stub(Mongo.MongoClient, "connect").returns(new Promise((resolve, reject) => {
                resolve(db);
            }));
            return application.initMongoClient().then(() => {
                stubConsoleLog.restore();
                stubActionReport.restore();
                stubActionTask.restore();
                stubActionUser.restore();
                stubMongoConnect.restore();

                stubMongoConnect.calledWith("mongodb://@127.0.0.1:27017/taskenize").should.be.true;
                stubActionTask.calledWith(db).should.be.true;
                stubActionUser.calledWith(db).should.be.true;
                stubActionReport.called.should.be.false;
                stubConsoleLog.calledWith("Connection to DB failed: " + error);
            });
        });
    });
    describe("initPassportSession(app)", () => {
        it("check main flow", () => {
            const application = new App.Application();
            const app = Express();
            const strategy = {strategy: "google"};
            const session = {session: "google"};
            const config = {
                google: {
                    client_id: "abcdefg",
                    client_secret: "dfghjk",
                    server_address: "http://localhost:1234",
                },
            };

            const stubConfig = Sinon.stub(App, "config").get(() => config);
            const stubPasportUse = Sinon.stub(Passport, "use");
            const stubPasportSession = Sinon.stub(Passport, "session").returns(session);
            const stubPasportAuthenticate = Sinon.stub(Passport, "authenticate").onFirstCall().returns({});
            const stubAppUse = Sinon.stub(app, "use");
            const stubGoogleOAuth2Strategy = Sinon.stub(Google, "OAuth2Strategy").returns(strategy);
            for (const key in application.accessTokens) {
                if (application.accessTokens.hasOwnProperty(key)) {
                    delete application.accessTokens[key];
                }
            }

            application.initPassportSession(app);

            stubPasportUse.restore();
            stubGoogleOAuth2Strategy.restore();
            stubPasportAuthenticate.restore();
            stubConfig.restore();
            stubAppUse.restore();

            stubGoogleOAuth2Strategy.called.should.be.true;
            const strategyConfig = stubGoogleOAuth2Strategy.args[0][0];
            strategyConfig.callbackURL.should.be.equals(config.google.server_address + "/auth/callback");
            strategyConfig.clientID.should.be.equals(config.google.client_id);
            strategyConfig.clientSecret.should.be.equals(config.google.client_secret);

            const verify: (
                    accessToken: string,
                    refreshToken: string,
                    profile: Google.Profile,
                    done: (error: any, user?: any) => void,
                ) => void
                = stubGoogleOAuth2Strategy.args[0][1];

            const accessToken = "Test Access Token";
            const refreshToken = "Test Refresh Token";
            const profileGood = {
                id: "103797599429081501264",
            };
            const doneGood = (error, user) => {
                Chai.assert.isNull(error);
                user.should.be.equals(profileGood);
            };
            let stubConsoleLog = Sinon.stub(console, "log");
            verify(accessToken, refreshToken, profileGood as Google.Profile, doneGood);
            stubConsoleLog.restore();
            stubConsoleLog.calledWith("Profile.ID: " + profileGood.id);

            const profileBad = {
                id: "Bad Profile",
            };
            const doneBad = (error, user) => {
                error.should.be.equals("Unauthorised user.");
                user.should.be.false;
            };
            stubConsoleLog = Sinon.stub(console, "log");
            verify(accessToken, refreshToken, profileBad as Google.Profile, doneBad);
            verify(accessToken, refreshToken, profileGood as Google.Profile, doneGood);
            stubConsoleLog.restore();
            stubConsoleLog.calledWith("Profile: " + JSON.stringify(profileBad));

            application.accessTokens[profileGood.id].should.be.equals(accessToken);
            Chai.assert.isUndefined(application.accessTokens[profileBad.id]);

            stubPasportUse.calledWith(strategy).should.be.true;
            stubAppUse.calledWith(session).should.be.true;
        });
    });
    describe("initPassportLogin(app)", () => {
        it("check main flow", () => {
            const application = new App.Application();
            const app = Express();
            const handler: any = {handler: "authenticate"};
            const stubAppGet = Sinon.stub(app, "get");
            const stubPassportAuthenticate = Sinon.stub(Passport, "authenticate").returns(handler as Express.Handler);

            application.initPassportLogin(app);
            stubAppGet.restore();
            stubPassportAuthenticate.restore();

            stubPassportAuthenticate.callCount.should.be.equals(1);
            stubPassportAuthenticate.args[0].length.should.be.equals(2);
            stubPassportAuthenticate.args[0][0].should.be.equals("google");
            stubPassportAuthenticate.args[0][1].should.be.deep.equals({ session: false });

            stubAppGet.callCount.should.be.equals(1);
            stubAppGet.calledWithExactly("/auth", handler).should.be.true;
        });
    });
    describe("initPassportCallback(app)", () => {
        it("check main flow", () => {
            const application = new App.Application();
            const app = Express();
            const handler: any = {handler: "authenticate"};
            const stubAppGet = Sinon.stub(app, "get");
            const stubPassportAuthenticate = Sinon.stub(Passport, "authenticate").returns(handler as Express.Handler);

            application.initPassportCallback(app);
            stubAppGet.restore();
            stubPassportAuthenticate.restore();

            Sinon.assert.calledOnce(stubPassportAuthenticate);
            stubPassportAuthenticate.args[0].length.should.be.equals(2);
            stubPassportAuthenticate.args[0][0].should.be.equals("google");
            stubPassportAuthenticate.args[0][1].should.be.deep.equals({
                failureRedirect: "/login",
                session: false,
            });

            Sinon.assert.calledOnce(stubAppGet);
            stubAppGet.calledWith("/auth/callback", handler).should.be.true;
            stubAppGet.args[0].length.should.be.equals(3);

            const callback: (req, res) => any = stubAppGet.args[0][2];
            const stubAppPassportCallback = Sinon.stub(application, "passportCallback");
            const req = {request: "Request"};
            const res = {response: "Response"};
            callback(req, res);
            Sinon.assert.calledOnce(stubAppPassportCallback);
            Sinon.assert.calledWithMatch(stubAppPassportCallback, req, res);
        });
    });
    describe("passportCallback(req, res)", () => {
        it("check main flow", () => {
            const application = new App.Application();
            const userId = "USER123456";
            const token = "Access Token";
            const googleUser = {
                pay: "load",
            };
            const mongoUser = {
                _id: userId,
            };
            const request: any = {
                session: {},
                user: googleUser,
            };
            const response = {
                redirect: Sinon.stub(),
            };
            const stubActionUserUpsert = Sinon.stub(ActionUser, "upsert").returns(new Promise((resolve, reject) => {
                resolve(mongoUser);
            }));
            application.accessTokens[userId] = token;
            return application.passportCallback(request, response)
                .then(() => {
                    stubActionUserUpsert.restore();
                    response.redirect;

                    Sinon.assert.calledOnce(stubActionUserUpsert);
                    Sinon.assert.calledWithExactly(stubActionUserUpsert, googleUser);
                    request.session.user.should.be.equals(mongoUser);
                    request.session.access_token.should.be.equals(token);
                    Chai.assert.isUndefined(application.accessTokens[userId]);
                    Sinon.assert.calledOnce(response.redirect);
                    Sinon.assert.calledWithExactly(response.redirect, "/");
                });
        });
    });
    describe("initPassportLogout(app)", () => {
        it("check main flow", () => {
            const application = new App.Application();
            const app = Express();
            const stubAppGet = Sinon.stub(app, "get");

            application.initPassportLogout(app);
            stubAppGet.restore();

            Sinon.assert.calledOnce(stubAppGet);
            stubAppGet.calledWith("/logout").should.be.true;
            stubAppGet.args[0].length.should.be.equals(2);

            const callback: (req, res) => any = stubAppGet.args[0][1];
            const stubAppPassportLogout = Sinon.stub(application, "passportLogout");
            const req = {request: "Request"};
            const res = {response: "Response"};
            callback(req, res);
            Sinon.assert.calledOnce(stubAppPassportLogout);
            Sinon.assert.calledWithExactly(stubAppPassportLogout, req, res);
        });
    });

    describe("passportLogout(req, res)", () => {
        it("check main flow", () => {
            const application = new App.Application();
            const request: any = {
                logout: Sinon.stub(),
                session: {
                    access_token: "Access Token",
                    destroy: Sinon.stub().callsFake((callback: () => any) => callback()),
                },
            };
            const response = {
                redirect: Sinon.stub(),
            };
            const stubHttpsGet = Sinon.stub(Https, "get").callsFake((params, callback) => {
                params.should.be.deep.equals({
                    host: "accounts.google.com",
                    method: "GET",
                    path: "/o/oauth2/logout?token=" + request.session.access_token,
                    protocol: "https",
                });
                callback(null);
            });

            application.passportLogout(request, response);
            stubHttpsGet.restore();

            Sinon.assert.calledOnce(request.session.destroy);
            Sinon.assert.calledOnce(request.logout);
            Sinon.assert.calledOnce(response.redirect);
            Sinon.assert.calledWithExactly(response.redirect, "/");
        });
    });
    describe("initPassport(app)", () => {
        it("check main flow", () => {
            const application = new App.Application();
            const app = Express();
            const initResult: any = {
                pay: "load",
            };

            const stubPassportInitialize = Sinon.stub(Passport, "initialize").returns(initResult);
            const stubAppUse = Sinon.stub(app, "use");
            const stubInitPassportSession = Sinon.stub(application, "initPassportSession");
            const stubInitPassportLogin = Sinon.stub(application, "initPassportLogin");
            const stubInitPassportCallback = Sinon.stub(application, "initPassportCallback");
            const stubInitPassportLogout = Sinon.stub(application, "initPassportLogout");
            application.initPassport(app);
            stubPassportInitialize.restore();
            stubAppUse.restore();
            stubInitPassportSession.restore();
            stubInitPassportLogin.restore();
            stubInitPassportCallback.restore();
            stubInitPassportLogout.restore();

            Sinon.assert.callOrder(
                stubPassportInitialize,
                stubAppUse,
                stubInitPassportSession,
                stubInitPassportLogin,
                stubInitPassportCallback,
                stubInitPassportLogout,
            );
            Sinon.assert.calledWithExactly(stubPassportInitialize);
            Sinon.assert.calledWithExactly(stubAppUse, initResult);
            Sinon.assert.calledWithExactly(stubInitPassportSession, app);
            Sinon.assert.calledWithExactly(stubInitPassportLogin, app);
            Sinon.assert.calledWithExactly(stubInitPassportCallback, app);
            Sinon.assert.calledWithExactly(stubInitPassportLogout, app);
        });
    });

    describe("initSessionManagement(app)", () => {
        it("check main flow", () => {
            const cookieParser = {Cookie: "payload"};
            const expressSession = {Session: "payload"};

            const stubCookie = Sinon.stub().returns(cookieParser);
            const stubSession = Sinon.stub().returns(expressSession);

            const AppProxy = Proxyquire("../app", {
                "cookie-parser": stubCookie,
                "express-session": stubSession,
            });

            const application = new AppProxy.Application();
            const app = Express();
            const config = {
                session: {
                    secret: "Session Secret",
                },
            };
            const stubConfig = Sinon.stub(AppProxy, "config").get(() => config);
            const stubAppUse = Sinon.stub(app, "use");

            application.initSessionManagement(app);
            stubConfig.restore();
            stubAppUse.restore();

            Sinon.assert.callOrder(
                stubCookie,
                stubAppUse,
                stubSession,
                stubAppUse,
            );
            Sinon.assert.calledWithExactly(stubCookie);
            Sinon.assert.calledWithExactly(stubSession, {
                resave: true,
                saveUninitialized: false,
                secret: config.session.secret,
            });

            Sinon.assert.callCount(stubAppUse, 2);
            stubAppUse.args[0][0].should.be.deep.equal(cookieParser);
            stubAppUse.args[1][0].should.be.deep.equals(expressSession);
        });
    });
    describe("initSessionFiltering(app)", () => {
        it("check main flow", () => {
            const application = new App.Application();
            const app = Express();

            const stubAppUse = Sinon.stub(app, "use");
            application.initSessionFiltering(app);
            stubAppUse.restore();

            Sinon.assert.calledOnce(stubAppUse);
            Sinon.assert.calledWith(stubAppUse, "/rest/*");
            const filter: (req, res, next) => any = stubAppUse.args[0][1];

            const requestGood: any = {
                session: {
                    user: {
                        User: "payload",
                    },
                },
            };
            const responseGood = {
                sendStatus: Sinon.stub(),
            };
            const nextGood = Sinon.stub();

            filter(requestGood, responseGood, nextGood);
            Sinon.assert.calledOnce(nextGood);
            Sinon.assert.calledWithExactly(nextGood);
            Sinon.assert.notCalled(responseGood.sendStatus);

            const requestBad: any = {
                session: {},
            };
            const responseBad = {
                sendStatus: Sinon.stub(),
            };
            const nextBad = Sinon.stub();
            filter(requestBad, responseBad, nextBad);
            Sinon.assert.calledOnce(responseBad.sendStatus);
            Sinon.assert.calledWithExactly(responseBad.sendStatus, 401);
            Sinon.assert.notCalled(nextBad);
        });
    });
    describe("initRestEndpoints(app)", () => {
        it("check main flow", () => {
            const application = new App.Application();
            const app = Express();

            const stubAppUse = Sinon.stub(app, "use");
            application.initRestEndpoints(app);
            stubAppUse.restore();

            Sinon.assert.callOrder(
                stubAppUse.withArgs("/rest/v1/tasks", RouterTasks.router),
                stubAppUse.withArgs("/rest/v1/user", RouterUser.router),
                stubAppUse.withArgs("/rest/v1/report", RouterReport.router),
            );
        });
    });
    describe("initStaticContent(app)", () => {
        it("check main flow", () => {
            const application = new App.Application();
            const app = Express();
            const staticHandler = {
                static: "payload",
            };
            const stubExpressStatic = Sinon.stub(Express, "static").returns(staticHandler);
            const stubAppUse = Sinon.stub(app, "use");
            application.initStaticContent(app);
            stubExpressStatic.restore();
            stubAppUse.restore();

            Sinon.assert.callOrder(
                stubExpressStatic.withArgs("../WebClient"),
                stubAppUse.withArgs(staticHandler),
            );
        });
    });

    describe("startServer(app)", () => {
        it("check main flow", () => {
            const application = new App.Application();
            const app = Express();
            const config = {
                server_port: 1234,
            };

            const stubConfig = Sinon.stub(App, "config").get(() => config);
            const stubAppListen = Sinon.stub(app, "listen");
            const stubConsoleLog = Sinon.stub(console, "log");
            application.startServer(app);
            stubConfig.restore();
            stubAppListen.restore();
            stubConsoleLog.restore();

            Sinon.assert.callOrder(
                stubAppListen.withArgs(config.server_port),
                stubConsoleLog.withArgs("Listening for port: " + config.server_port),
            );
        });
    });

    describe("initExpress()", () => {
        const express = {
            express: "Payload",
        };
        it("check main flow", () => {
            const AppProxy = Proxyquire("../app", {
                express: Sinon.stub().returns(express),
            });

            const application = new AppProxy.Application();
            const stubInitSessionManagement = Sinon.stub(application, "initSessionManagement");
            const stubInitPassport = Sinon.stub(application, "initPassport");
            const stubInitSessionFiltering = Sinon.stub(application, "initSessionFiltering");
            const stubInitRestEndpoints = Sinon.stub(application, "initRestEndpoints");
            const stubInitStaticContent = Sinon.stub(application, "initStaticContent");
            const stubStartServer = Sinon.stub(application, "startServer");

            application.initExpress();
            stubInitSessionManagement.restore();
            stubInitPassport.restore();
            stubInitSessionFiltering.restore();
            stubInitRestEndpoints.restore();
            stubInitStaticContent.restore();
            stubStartServer.restore();

            Sinon.assert.callOrder(
                stubInitSessionManagement.withArgs(express),
                stubInitPassport.withArgs(express),
                stubInitSessionFiltering.withArgs(express),
                stubInitRestEndpoints.withArgs(express),
                stubInitStaticContent.withArgs(express),
                stubStartServer.withArgs(express),
            );
        });
    });

    /*
    public initExpress(): void {
        const app = Express();

        this.initSessionManagement(app);
        this.initPassport(app);
        this.initSessionFiltering(app);
        this.initRestEndpoints(app);
        this.initStaticContent(app);

        this.startServer(app);
    }
    */
});
