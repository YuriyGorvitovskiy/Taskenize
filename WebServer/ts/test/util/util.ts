import * as Express from "express";
import * as Chai from "chai";
import * as Mocha from "mocha";
import * as Sinon from "sinon";

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
    describe("jsonResponse(res)", () => {
        it("should be calling appropriate chain", () => {
            let json_been_called = false;
            const payload = {
                pay: "load"
            };
            const res: any = {
                format: (obj: any) => {
                    obj.json();
                },
                json: (jo: any) => {
                    json_been_called = true;
                    jo.should.be.equals(payload)
                }
            };
            Util.jsonResponse(res)(payload);
            json_been_called.should.be.equals(true);
        });
    });
    describe("errorResponse(res, action)", () => {
        it("should be calling appropriate chain", () => {
            let json_been_called = false;
            const action = "Test Action";
            const error = "Error Message";
            const res: any = {
                format: (obj: any) => {
                    obj.json();
                },
                json: (jo: any) => {
                    json_been_called = true;
                    jo.should.be.equals(error)
                }
            };
            const stub = Sinon.stub(console, 'log');
            Util.errorResponse(res, action)(error);
            // should restore it as fast as posible, to avoid hiding test messages
            stub.restore();

            json_been_called.should.be.true;
            stub.calledWith("Failed to perform " + action + ": " + error).should.be.true;
        });
    });
    describe("logJson(message)", () => {
        it("should be calling appropriate chain", () => {
            const message = "Test JSON: ";
            const payload = {
                pay: "load"
            };
            const stub = Sinon.stub(console, 'log');
            return Util.logJson(message)(payload).then((p) =>{
                // should restore it as fast as posible, to avoid hiding test messages
                stub.restore();

                p.should.be.equals(payload);
                stub.calledWith(message + JSON.stringify(payload)).should.be.true;
            });
        });
    });
});
