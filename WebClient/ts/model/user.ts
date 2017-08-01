import * as $ from 'jquery';
import * as Moment from 'moment';

export interface User {
    _id:            string;
    display_name:   string;
    family_name:    string;
    given_name:     string;
    image:          string;
    gender:         string;
    provider:       string;
    language:       string;
    objectType:     string;
    kind:           string;
    etag:           string;
    update_at:      Date;
};

export function get() {
    return $.getJSON('/rest/v1/user/').then(parseUserJson);
}

function parseUserJson(json: any) : User {
    var user = {
        _id:            json._id,
        display_name:   json.display_name,
        family_name:    json.family_name,
        given_name:     json.given_name,
        image:          json.image
        gender:         json.gender
        provider:       json.provider,
        language:       json.language,
        objectType:     json.objectType,
        kind:           json.kind,
        etag:           json.etag,
        update_at:      json.update_at ? new Date(json.update_at) : null,
    }
    return user;
}
