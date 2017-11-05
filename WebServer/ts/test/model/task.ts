import * as Chai from "chai";
import * as Mocha from "mocha";

import * as Model from "../../model/task";

Chai.should();

describe("Model Task", () => {
    describe("version", () => {
        it("check", () => {
            Model.version.should.be.equals("0.0.1");
        });
    });
});
