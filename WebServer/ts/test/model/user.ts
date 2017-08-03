import * as Chai from "chai";
import * as Mocha from "mocha";

import * as Model from "../../model/user";

Chai.should();

describe("Model User", () => {
    describe("version", () => {
        it("check", () => {
            Model.version.should.be.equals("0.0.1");
        });
    });
    describe("fromGoogle(gogleUser)", () => {
        it("check transformation", () => {
            const googleUser = {
                _json: {
                    etag: "Etag",
                    image: {
                        url: "http://google.com/what-ever",
                    },
                    kind: "Kind field",
                    language: "Russian",
                    objectType: "Json Object Type",
                },
                id: "Google ID",
                gender: "Female",
                displayName: "Google Display Name",
                name: {
                    familyName: "Gorvitovskaia",
                    givenName: "Elena",
                },
                provider: "Google",
            };
            const user = Model.fromGoogle(googleUser);

            user._id.should.be.equals(googleUser.id);
            user.display_name.should.be.equals(googleUser.displayName);
            user.etag.should.be.equals(googleUser._json.etag);
            user.family_name.should.be.equals(googleUser.name.familyName);
            user.gender.should.be.equals(googleUser.gender);
            user.given_name.should.be.equals(googleUser.name.givenName);
            user.image.should.be.equals(googleUser._json.image.url);
            user.kind.should.be.equals(googleUser._json.kind);
            user.language.should.be.equals(googleUser._json.language);
            user.objectType.should.be.equals(googleUser._json.objectType);
            user.provider.should.be.equals(googleUser.provider);
            user.update_at.getTime().should.be.not.greaterThan(new Date().getTime());
        });
    });
});
