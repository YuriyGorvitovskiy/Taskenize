import * as Mongo from 'mongodb';
import * as Model from '../model/user'
import * as Util from '../router/util'

var  _db  : Mongo.Db          = null;
var  _cl  : Mongo.Collection  = null;

export function connect(db : Mongo.Db) {
    _db = db;
    _cl = db.collection('users');
}

export function get(_id: string) : Promise<Model.User> {
    return _cl.find({_id: _id}).next();
}

export function getAll() : Promise<Model.User[]> {
    return _cl.find({}).sort({
        'familyName': 1,
        'givenName': 1,
        '_id': 1
    }).toArray();
}

export function upsert(googleUser: any) : Promise<Model.User> {
    var user = Model.fromGoogle(googleUser);
    return _cl.updateOne({_id: user._id}, user, {upsert: true})
                .then(() => get(user._id));
}

export function remove(_id: string) : Promise<Model.User> {
    return get(_id)
            .then((user) => {
                return _cl.deleteOne({_id: _id})
                    .then(()=>user);
            });
}
