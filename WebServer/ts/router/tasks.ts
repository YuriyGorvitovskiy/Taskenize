import * as BodyParser from "body-parser";
import * as Express from "express";
import * as MethodOverride from "method-override";
import * as Mongo from "mongodb";

import * as Action from "../action/task";
import * as Model from "../model/task";
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
    const query: Model.IQuery = {
        state: req.query.state,
        user_id: req.session.user._id,
    };
    if (req.query.completed_begin) {
        query.completed_period = {
            begin: new Date(req.query.completed_begin),
            end: req.query.completed_end ? new Date(req.query.completed_end) : new Date(),
        };
    }
    Action.getAll(query)
        .then(Util.jsonResponse(res))
        .catch(Util.errorResponse(res, "get all tasks"));
});

// POST a new task
router.post("/", (req, res) => {
    // console.log("Session["user"] " + JSON.stringify(req.session["user"]));
    Action.insert(req.session.user._id,
                  req.body.title,
                  req.body.subject,
                  req.body.category,
                  req.body.context,
                  req.body.project,
                  req.body.story,
                  req.body.scheduled ? new Date(req.body.scheduled) : null,
                  req.body.collapsed,
                  req.body.created_time ? new Date(req.body.created_time) : null,
              )
        .then(Util.logJson("New task created: "))
        .then(Util.jsonResponse(res))
        .catch(Util.errorResponse(res, "insert new task"));
});

router.param("id", (req, res, next, id) => {
    req.body._id = id;
    next();
});

router.param("index", (req, res, next, index) => {
    req.body.index = index;
    next();
});

router.get("/:id", (req, res) => {
    Action.get(req.body._id)
        .then(Util.jsonResponse(res))
        .catch(Util.errorResponse(res, "get task by id"));
});

router.put("/:id", (req, res) => {
    if (req.body.state !== undefined) {
        Action.changeState(req.body._id, parseInt(req.body.state, 10), new Date(req.body.time))
            .then(Util.jsonResponse(res))
            .catch(Util.errorResponse(res, "update task by id"));
        return;
    }

    const update: any = {};
    if (req.body.title != null) {
        update.title = req.body.title;
    }
    if (req.body.subject != null) {
        update.subject = req.body.subject;
    }
    if (req.body.context != null) {
        update.context = req.body.context;
    }
    if (req.body.category != null) {
        update.category = req.body.category;
    }
    if (req.body.project != null) {
        update.project = req.body.project;
    }
    if (req.body.story != null) {
        update.story = req.body.story;
    }
    if (req.body.scheduled != null) {
        update.scheduled = (req.body.scheduled.trim() === "" ? null : new Date(req.body.scheduled));
    }
    if (req.body.collapsed != null) {
        update.collapsed = req.body.collapsed;
    }

    for (const name in req.body) {
        if (!req.body.hasOwnProperty(name)) {
            continue;
        }

        if (Util.startWith(name, "duration.")) {
            update[name] = new Date(req.body[name]);
        }
        if (Util.startWith(name, "automation.")) {
            if (name === "automation.behavior") {
                update[name] = parseInt(req.body[name], 10);
            } else if (name === "automation.timingKind") {
                update[name] = parseInt(req.body[name], 10);
            } else if (name === "automation.timingDuration") {
                update[name] = parseInt(req.body[name], 10);
            } else if (name === "automation.timingDurationUnit") {
                update[name] = parseInt(req.body[name], 10);
            } else if (name === "automation.timingAdjustment") {
                update[name] = parseInt(req.body[name], 10);
            } else if (name === "automation.timingAdjustmentKind") {
                update[name] = parseInt(req.body[name], 10);
            } else {
                update[name] = req.body[name];
            }
        }
    }

    Action.update(req.body._id, {$set: update})
        .then(Util.jsonResponse(res))
        .catch(Util.errorResponse(res, "update task by id"));
});

router.delete("/:id", (req, res) => {
    Action.remove(req.body._id)
        .then(Util.logJson("Task deleted: "))
        .then(Util.jsonResponse(res))
        .catch(Util.errorResponse(res, "delete task by id"));
});

router.delete("/:id/duration/:index", (req, res) => {
    Action.removeDuration(req.body._id, req.body.index)
        .then(Util.logJson("Task duration deleted: "))
        .then(Util.jsonResponse(res))
        .catch(Util.errorResponse(res, "delete task duration by index"));
});
