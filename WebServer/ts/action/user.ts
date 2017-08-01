import * as Mongo from "mongodb";
import * as Model from "../model/user";
import * as Util from "../router/util";

let  dbUsers: Mongo.Collection  = null;

export function connect(db: Mongo.Db) {
    dbUsers = db.collection("users");
}

export function get(id: string): Promise<Model.IUser> {
    return dbUsers.find({_id: id}).next() as Promise<Model.IUser>;
}

export function getAll(): Promise<Model.IUser[]> {
    return dbUsers.find({}).sort({
        _id: 1,
        familyName: 1,
        givenName: 1,
    }).toArray() as Promise<Model.IUser[]>;
}

export function upsert(googleUser: any): Promise<Model.IUser> {
    const user = Model.fromGoogle(googleUser);
    return dbUsers.updateOne({_id: user._id}, user, {upsert: true})
                .then(() => get(user._id)) as Promise<Model.IUser>;
}

export function remove(id: string): Promise<Model.IUser> {
    return get(id)
            .then((user) => {
                return dbUsers.deleteOne({_id: id})
                    .then(() => user);
            });
}
