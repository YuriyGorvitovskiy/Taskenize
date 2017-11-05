import * as $ from "jquery";
import * as Moment from "moment";

export interface IUser {
    _id: string;
    display_name: string;
    etag: string;
    family_name: string;
    gender: string;
    given_name: string;
    image: string;
    kind: string;
    language: string;
    objectType: string;
    provider: string;
    update_at: Date;
}

export function get() {
    return $.getJSON("/rest/v1/user/").then(parseUserJson);
}

function parseUserJson(json: any): IUser {
    const user = {
        _id: json._id,
        display_name: json.display_name,
        etag: json.etag,
        family_name: json.family_name,
        gender: json.gender,
        given_name: json.given_name,
        image: json.image,
        kind: json.kind,
        language: json.language,
        objectType: json.objectType,
        provider: json.provider,
        update_at: json.update_at ? new Date(json.update_at) : null,
    };
    return user;
}
