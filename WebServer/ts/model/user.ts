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

export function fromGoogle(gogleUser: any) : User {
    return {
        _id: gogleUser.id,
        display_name: gogleUser.displayName,
        family_name: gogleUser.name.familyName,
        given_name: gogleUser.name.givenName,
        image: gogleUser._json.image.url,
        gender: gogleUser.gender,
        provider: gogleUser.provider,
        language: gogleUser._json.language,
        objectType: gogleUser._json.objectType,
        kind: gogleUser._json.kind,
        etag: gogleUser._json.etag,
        update_at: new Date()
    };
}
