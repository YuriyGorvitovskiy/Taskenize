export interface IUser {
    _id: string;
    display_name: string;
    family_name: string;
    given_name: string;
    image: string;
    gender: string;
    provider: string;
    language: string;
    objectType: string;
    kind: string;
    etag: string;
    update_at: Date;
}

export function fromGoogle(gogleUser: any): IUser {
    return {
        _id: gogleUser.id,
        display_name: gogleUser.displayName,
        etag: gogleUser._json.etag,
        family_name: gogleUser.name.familyName,
        gender: gogleUser.gender,
        given_name: gogleUser.name.givenName,
        image: gogleUser._json.image.url,
        kind: gogleUser._json.kind,
        language: gogleUser._json.language,
        objectType: gogleUser._json.objectType,
        provider: gogleUser.provider,
        update_at: new Date(),
    };
}
