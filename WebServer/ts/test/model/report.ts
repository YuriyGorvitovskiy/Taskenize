import * as Chai from "chai";
import * as Mocha from "mocha";

import * as Model from "../../model/report";

Chai.should();

describe("Model Report", () => {
    describe("version", () => {
        it("check", () => {
            Model.version.should.be.equals("0.0.1");
        });
    });
});
