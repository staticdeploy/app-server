import { expect } from "chai";
import { load } from "cheerio";
import { createTree, destroyTree } from "create-fs-tree";
import { tmpdir } from "os";
import { join } from "path";
import request from "supertest";
import { v4 } from "uuid";
import { VM } from "vm2";

import getAppServer from "../src/getAppServer";

describe("getAppServer", () => {
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

    const baseAppServerOptions = {
        root: root,
        fallbackAssetPath: "/index.html",
        selector: "script#app-config",
        configKeyPrefix: "APP_CONFIG_",
        config: {
            APP_CONFIG_KEY: "VALUE"
        },
        basePath: "/"
    };

    it("starts a server serving the static app", () => {
        const server = getAppServer(baseAppServerOptions);
        return request(server)
            .get("/")
            .expect(200)
            .expect(/head/);
    });

    it("301 to /basePath/ on GET /basePath", async () => {
        const server = getAppServer({
            ...baseAppServerOptions,
            basePath: "/basePath/"
        });
        await request(server)
            .get("/basePath")
            .expect(301)
            .expect("Location", "/basePath/");
        await request(server)
            .get("/basePath/")
            .expect(200)
            .expect(/head/);
    });

    it("configures html files", () => {
        const server = getAppServer(baseAppServerOptions);
        return request(server)
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
