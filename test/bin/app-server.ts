import { expect } from "chai";
import { load } from "cheerio";
import { ChildProcess, spawn } from "child_process";
import { createTree, destroyTree } from "create-fs-tree";
import { tmpdir } from "os";
import { join } from "path";
import request from "supertest";
import { v4 } from "uuid";
import { VM } from "vm2";

describe("app-server bin", () => {
    // Create static app to serve (and destroy it after tests)
    const root = join(tmpdir(), "staticdeploy/app-server/", v4());
    before(() => {
        createTree(root, {
            "index.html": '<head><script id="app-config"></script></head>'
        });
    });
    after(() => {
        destroyTree(root);
    });

    // Define environment variables to use for configuration
    const env = {
        APP_CONFIG_KEY: "VALUE"
    };

    // Start app-server before tests (and stop it after)
    let server: ChildProcess;
    before(function(done) {
        this.timeout(5000);
        const devConfigServerPath = join(
            __dirname,
            "../../src/bin/app-server.ts"
        );
        server = spawn(
            require.resolve("ts-node/dist/bin.js"),
            [devConfigServerPath, "--root", root],
            { env: { ...process.env, ...env } }
        );
        setTimeout(done, 4000);
    });
    after(() => {
        server.kill();
    });

    describe("starts a server serving the static app", () => {
        it("serving the static app", () => {
            return request("http://localhost:3000")
                .get("/")
                .expect(200)
                .expect(/head/);
        });
        it("configuring html files", () => {
            return request("http://localhost:3000")
                .get("/")
                .expect(200)
                .then(res => {
                    const $ = load(res.text);
                    const scriptContent = $("script#app-config").html();
                    const vm = new VM({ sandbox: { window: {} } });
                    vm.run(scriptContent!);
                    const APP_CONFIG = vm.run("window.APP_CONFIG");
                    expect(APP_CONFIG).to.deep.equal({ KEY: "VALUE" });
                });
        });
    });
});
