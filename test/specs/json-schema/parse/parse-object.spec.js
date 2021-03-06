"use strict";

const swagger = require("../../../../");
const expect = require("chai").expect;
const _ = require("lodash");
const specs = require("../../../fixtures/specs");
const helper = require("./helper");

let api, petParam;

describe("JSON Schema - parse object params", () => {

  beforeEach(() => {
    api = _.cloneDeep(specs.swagger2.samples.petStore);
    petParam = api.paths["/pets/{PetName}"].patch.parameters[0];
  });

  it("should parse a valid object param", (done) => {
    swagger(api, (err, middleware) => {
      let express = helper.express(middleware.metadata(), middleware.parseRequest());

      helper.supertest(express)
        .patch("/api/pets/fido")
        .send({ Name: "Fido", Type: "dog" })
        .end(helper.checkSpyResults(done));

      express.patch("/api/pets/fido", helper.spy((req, res, next) => {
        expect(req.body).to.deep.equal({
          Name: "Fido",
          Type: "dog"
        });
      }));
    });
  });

  it("should parse an optional, unspecified object param", (done) => {
    petParam.required = false;

    swagger(api, (err, middleware) => {
      let express = helper.express(middleware.metadata(), middleware.parseRequest());

      helper.supertest(express)
        .patch("/api/pets/fido")
        .end(helper.checkSpyResults(done));

      express.patch("/api/pets/fido", helper.spy((req, res, next) => {
        expect(req.body || "").to.have.lengthOf(0);
      }));
    });
  });

  it("should parse the default Object value if no value is specified", (done) => {
    petParam.required = false;
    petParam.schema.default = { Name: "Fido", Type: "dog" };

    swagger(api, (err, middleware) => {
      let express = helper.express(middleware.metadata(), middleware.parseRequest());

      helper.supertest(express)
        .patch("/api/pets/fido")
        .end(helper.checkSpyResults(done));

      express.patch("/api/pets/fido", helper.spy((req, res, next) => {
        expect(req.body).to.deep.equal({
          Name: "Fido",
          Type: "dog"
        });
      }));
    });
  });

  it("should parse the default String value if no value is specified", (done) => {
    petParam.required = false;
    petParam.schema.default = '{"Name": "Fido", "Type": "dog"}';

    swagger(api, (err, middleware) => {
      let express = helper.express(middleware.metadata(), middleware.parseRequest());

      helper.supertest(express)
        .patch("/api/pets/fido")
        .end(helper.checkSpyResults(done));

      express.patch("/api/pets/fido", helper.spy((req, res, next) => {
        expect(req.body).to.deep.equal({
          Name: "Fido",
          Type: "dog"
        });
      }));
    });
  });

  it("should parse the default value if the specified value is blank", (done) => {
    petParam.required = false;
    petParam.schema.default = '{"Name": "Fido", "Type": "dog"}';

    swagger(api, (err, middleware) => {
      let express = helper.express(middleware.metadata(), middleware.parseRequest());

      helper.supertest(express)
        .patch("/api/pets/fido")
        .set("content-type", "text/plain")
        .send("")
        .end(helper.checkSpyResults(done));

      express.patch("/api/pets/fido", helper.spy((req, res, next) => {
        expect(req.body).to.deep.equal({
          Name: "Fido",
          Type: "dog"
        });
      }));
    });
  });

  it("should throw an error if the value is blank", (done) => {
    swagger(api, (err, middleware) => {
      let express = helper.express(middleware.metadata(), middleware.parseRequest());

      helper.supertest(express)
        .patch("/api/pets/fido")
        .set("content-type", "text/plain")
        .send("")
        .end(helper.checkSpyResults(done));

      express.use("/api/pets/fido", helper.spy((err, req, res, next) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.status).to.equal(400);
        expect(err.message).to.contain('Missing required body parameter "PetData"');
      }));
    });
  });

  it("should throw an error if schema validation fails", (done) => {
    swagger(api, (err, middleware) => {
      let express = helper.express(middleware.metadata(), middleware.parseRequest());

      helper.supertest(express)
        .patch("/api/pets/fido")
        .send({ Name: "Fido", Type: "kitty kat" })
        .end(helper.checkSpyResults(done));

      express.use("/api/pets/fido", helper.spy((err, req, res, next) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.status).to.equal(400);
        expect(err.message).to.contain('No enum match for: "kitty kat"');
      }));
    });
  });

  it("should throw an error if required and not specified", (done) => {
    swagger(api, (err, middleware) => {
      let express = helper.express(middleware.metadata(), middleware.parseRequest());

      helper.supertest(express)
        .patch("/api/pets/fido")
        .end(helper.checkSpyResults(done));

      express.use("/api/pets/fido", helper.spy((err, req, res, next) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.status).to.equal(400);
        expect(err.message).to.contain('Missing required body parameter "PetData"');
      }));
    });
  });
});
