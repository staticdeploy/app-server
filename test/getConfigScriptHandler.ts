import { expect } from "chai";
import express = require("express");
import request = require("supertest");
import { VM } from "vm2";

import getConfigScriptHandler from "../src/getConfigScriptHandler";

describe("The express handler returned by getConfigScriptHandler", () => {
    const env = {
        APP_CONFIG_MY_VAR: "VALUE"
    };
    const configScriptHandler = getConfigScriptHandler(env);
    const server = express().get("/app-config.js", configScriptHandler);

    it("serves the config script", () => {
        return request(server)
            .get("/app-config.js")
            .expect(200)
            .then(res => {
                const script = res.text;
                const vm = new VM({ sandbox: { window: {} } });
                vm.run(script);
                const APP_CONFIG = vm.run("window.APP_CONFIG");
                expect(APP_CONFIG).to.deep.equal({ MY_VAR: "VALUE" });
            });
    });

    it("returns the correct Content-Type for the script (~ application/javascript)", () => {
        return request(server)
            .get("/app-config.js")
            .expect(200)
            .expect("Content-Type", /application\/javascript/);
    });
});
