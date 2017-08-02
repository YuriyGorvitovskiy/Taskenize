import * as Mocha from "mocha";
import * as Chai from "chai";
import * as Util from "../../util/util";

Chai.should();

describe("Util", () => {
    describe("startWith()", () => {
        it("should return true", () => {
            Util.startWith("Hello World", "Hello").should.be.equal(true);
            Util.startWith("Hello World", "H").should.be.equal(true);
            Util.startWith("Hello World", "Hello World").should.be.equal(true);
            Util.startWith("Hello World", "").should.be.equal(true);
            Util.startWith("", "").should.be.equal(true);
        });
        it("should return false", () => {
            Util.startWith("Hello World", "hello").should.be.equal(false);
            Util.startWith("Hello World", "World").should.be.equal(false);
            Util.startWith("", "Anything").should.be.equal(false);
        });
    });
});
