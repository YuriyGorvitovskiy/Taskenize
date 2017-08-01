import * as BodyParser from "body-parser";
import * as Express from "express";
import * as MethodOverride from "method-override";
import * as Mongo from "mongodb";

import * as Action from "../action/report";
import * as Model from "../model/report";
import * as Util from "../util/util";

// var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

export const router = Express.Router();
router.use(BodyParser.urlencoded({ extended: true }));
router.use(MethodOverride((req, res) => {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
        // look in urlencoded POST bodies and delete it
        const method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

router.get("/", (req, res) => {
    // console.log("Request: " + JSON.stringify(req.query));
    const request: Model.IRequest = {
        begin: new Date(req.query.begin),
        end: new Date(req.query.end),
        group_by: req.query.group_by,
    };
    Action.get(req.session.user._id, request)
        .then(Util.jsonResponse(res))
        .catch(Util.errorResponse(res, "get active user"));
});
