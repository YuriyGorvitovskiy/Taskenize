import * as Express from 'express';
import * as BodyParser from 'body-parser';
import * as MethodOverride from 'method-override';
import * as Mongo from 'mongodb';

import * as Util from './util';
import * as Model from '../model/task';
import * as Action from '../action/task';


//var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

export var router = Express.Router();
router.use(BodyParser.urlencoded({ extended: true }));
router.use(MethodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method;
    }
}));

router.get('/', function(req, res) {
    Action.getAll()
        .then(Util.jsonResponse(res))
        .catch(Util.errorResponse(res, 'get all tasks'));
});

//POST a new task
router.post('/', function(req, res) {
    Action.insert(req.body.title,
                  req.body.subject,
                  req.body.category,
                  req.body.context,
                  req.body.project,
                  req.body.story,
                  req.body.scheduled,
                  req.body.collapsed)
        .then(Util.logJson('New task created: '))
        .then(Util.jsonResponse(res))
        .catch(Util.errorResponse(res, 'insert new task'));
});

router.param('id', function(req, res, next, _id) {
    req.body._id = _id;
    next();
});

router.param('index', function(req, res, next, index) {
    req.body.index = index;
    next();
});

router.get('/:id', function(req, res) {
    Action.get(req.body._id)
        .then(Util.jsonResponse(res))
        .catch(Util.errorResponse(res, 'get task by id'));
});

router.put('/:id', function(req, res) {
    var db : Mongo.Db = req['db'];
    var cl = db.collection('tasks');

    if (req.body.state !== undefined) {
        Action.changeState(req.body._id, parseInt(req.body.state))
            .then(Util.jsonResponse(res))
            .catch(Util.errorResponse(res, 'update task by id'));
        return;
    }

    var update : any = {};
    if (req.body.title != null)
        update.title = req.body.title;
    if (req.body.subject != null)
        update.subject = req.body.subject;
    if (req.body.context != null)
        update.context = req.body.context;
    if (req.body.category != null)
        update.category = req.body.category;
    if (req.body.project != null)
        update.project = req.body.project;
    if (req.body.story != null)
        update.story = req.body.story;
    if (req.body.scheduled != null)
        update.scheduled = (req.body.scheduled.trim() == '' ? null : new Date(req.body.scheduled));
    if (req.body.collapsed != null)
        update.collapsed = req.body.collapsed;

    for(var name in req.body) {
        if (Util.startWith(name, 'duration.'))
            update[name] = new Date(req.body[name]);
    }

    Action.update(req.body._id, {$set: update})
        .then(Util.jsonResponse(res))
        .catch(Util.errorResponse(res, 'update task by id'));
});

router.delete('/:id', function(req, res) {
    Action.remove(req.body._id)
        .then(Util.logJson('Task deleted: '))
        .then(Util.jsonResponse(res))
        .catch(Util.errorResponse(res, 'delete task by id'));
});

router.delete('/:id/duration/:index', function(req, res) {
    Action.removeDuration(req.body._id, req.body.index)
        .then(Util.logJson('Task duration deleted: '))
        .then(Util.jsonResponse(res))
        .catch(Util.errorResponse(res, 'delete task duration by index'));
});
