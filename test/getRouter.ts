import { expect } from "chai";
import { load } from "cheerio";
import { createTree, destroyTree } from "create-fs-tree";
import express = require("express");
import { tmpdir } from "os";
import { join } from "path";
import request = require("supertest");
import { VM } from "vm2";

import getRouter from "../src/getRouter";

function checkIsHtmlWithTitle(title: string) {
    return (res: request.Response) => {
        expect(title).to.equal(load(res.text)("title").html());
    };
}

describe("The express Router returned by getRouter", () => {
    const workdir = join(tmpdir(), "app-server");
    const root = join(workdir, "build");
    const index = "/index.html";
    const altIndex = "/alt-index.html";
    const selector = "script#app-config";
    const env = {
        APP_CONFIG_MY_VAR: "VALUE"
    };
    const mockFsDefinition = {
        build: {
            "index.html":
                '<title>index</title><script id="app-config"></script>',
            "alt-index.html":
                '<title>alt-index</title><script id="app-config"></script>',
            static: {
                js: {
                    "main.js": "/static/js/main.js content"
                }
            }
        }
    };
    let noBaseServer: express.Express;
    let noBaseAltIndexServer: express.Express;
    let baseServer: express.Express;

    beforeEach(() => {
        createTree(workdir, mockFsDefinition);
        noBaseServer = express().use(
            "/",
            getRouter(root, index, selector, env)
        );
        noBaseAltIndexServer = express().use(
            "/",
            getRouter(root, altIndex, selector, env)
        );
        baseServer = express().use(
            "/base/",
            getRouter(root, index, selector, env)
        );
    });
    after(() => {
        destroyTree(workdir);
    });

    describe("serves files", () => {
        it("case: baseUrl=/", () => {
            return request(noBaseServer)
                .get("/static/js/main.js")
                .expect(200)
                .expect("/static/js/main.js content");
        });
        it("case: baseUrl=/base/", () => {
            return request(baseServer)
                .get("/base/static/js/main.js")
                .expect(200)
                .expect("/static/js/main.js content");
        });
    });

    describe('redirects "nested" requests to the correct files', () => {
        it("case: baseUrl=/", () => {
            return request(noBaseServer)
                .get("/nested/static/js/main.js")
                .expect(301)
                .expect("Location", "/static/js/main.js");
        });
        it("case: baseUrl=/base/", () => {
            return request(baseServer)
                .get("/base/nested/static/js/main.js")
                .expect(301)
                .expect("Location", "/base/static/js/main.js");
        });
    });

    describe("serves index on directory requests", () => {
        // Note: sending an Accept: text/html header is standard browser
        // behaviour, and is expected by connect-history-api-fallback
        it("case: baseUrl=/ index=/index.html requestedUrl=/", () => {
            return request(noBaseServer)
                .get("/")
                .accept("text/html")
                .expect(200)
                .then(checkIsHtmlWithTitle("index"));
        });
        it("case: baseUrl=/ index=/index.html requestedUrl=/subdir/", async () => {
            return request(noBaseServer)
                .get("/subdir/")
                .accept("text/html")
                .expect(200)
                .then(checkIsHtmlWithTitle("index"));
        });
        it("case: baseUrl=/ index=/alt-index.html requestedUrl=/", () => {
            return request(noBaseAltIndexServer)
                .get("/")
                .accept("text/html")
                .expect(200)
                .then(checkIsHtmlWithTitle("alt-index"));
        });
        it("case: baseUrl=/base/ index=/index.html requestedUrl=/base/", async () => {
            return request(baseServer)
                .get("/base/")
                .accept("text/html")
                .expect(200)
                .then(checkIsHtmlWithTitle("index"));
        });
        it("case: baseUrl=/base/ index=/index.html requestedUrl=/base/subdir/", async () => {
            return request(baseServer)
                .get("/base/subdir/")
                .accept("text/html")
                .expect(200)
                .then(checkIsHtmlWithTitle("index"));
        });
    });

    it("serves configured index", () => {
        return request(noBaseServer)
            .get("/")
            .accept("text/html")
            .expect(200)
            .then(res => {
                const script = load(res.text)(selector).html();
                const vm = new VM({ sandbox: { window: {} } });
                vm.run(script);
                const APP_CONFIG = vm.run("window.APP_CONFIG");
                expect(APP_CONFIG).to.deep.equal({ MY_VAR: "VALUE" });
            });
    });
});
