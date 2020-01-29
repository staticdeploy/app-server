import { expect } from "chai";
import { load } from "cheerio";
import { createTree, destroyTree } from "create-fs-tree";
import { tmpdir } from "os";
import { join } from "path";
import request from "supertest";
import { v4 } from "uuid";
import { VM } from "vm2";

import getExpressApp from "../src/getExpressApp";

describe("getExpressApp", () => {
    // Create static app to serve (and destroy it after tests)
    const root = join(tmpdir(), "staticdeploy/app-server/", v4());
    const baseAppServerConfig = {
        root: root,
        fallbackAssetPath: "/index.html",
        fallbackStatusCode: 200,
        headers: {},
        basePath: "/",
        configuration: {},
        port: 3000
    };

    before(() => {
        createTree(root, {
            "index.html": '<head><script id="app-config"></script></head>',
            "404.html": "404.html",
            js: { "index.js": "index.js" }
        });
    });
    after(() => {
        destroyTree(root);
    });

    describe("serves assets of the static app", () => {
        it("case: basePath = /", async () => {
            const expressApp = await getExpressApp(baseAppServerConfig);
            await request(expressApp)
                .get("/")
                .expect(200)
                .expect(/head/);
            await request(expressApp)
                .get("/?querystring")
                .expect(200)
                .expect(/head/);
            await request(expressApp)
                .get("/#hash")
                .expect(200)
                .expect(/head/);
            await request(expressApp)
                .get("/js/index.js")
                .expect(200)
                .expect("index.js");
        });

        it("case: basePath = /basePath/", async () => {
            const expressApp = await getExpressApp({
                ...baseAppServerConfig,
                basePath: "/basePath/"
            });
            await request(expressApp)
                .get("/basePath/")
                .expect(200)
                .expect(/head/);
            await request(expressApp)
                .get("/basePath/?querystring")
                .expect(200)
                .expect(/head/);
            await request(expressApp)
                .get("/basePath/#hash")
                .expect(200)
                .expect(/head/);
            await request(expressApp)
                .get("/basePath/js/index.js")
                .expect(200)
                .expect("index.js");
        });
    });

    it("301 to /basePath/ on GET /basePath", async () => {
        const expressApp = await getExpressApp({
            ...baseAppServerConfig,
            basePath: "/basePath/"
        });
        await request(expressApp)
            .get("/basePath")
            .expect(301)
            .expect("location", "/basePath/");
        await request(expressApp)
            .get("/basePath?querystring")
            .expect(301)
            .expect("location", "/basePath/");
        await request(expressApp)
            .get("/basePath#hash")
            .expect(301)
            .expect("location", "/basePath/");
        await request(expressApp)
            .get("/basePath/")
            .expect(200)
            .expect(/head/);
    });

    describe("serves assets using StaticDeploy's algorithm, that", () => {
        describe("allows requesting assets by their non-canonical paths", () => {
            it("case: basePath = /", async () => {
                const expressApp = await getExpressApp(baseAppServerConfig);
                return request(expressApp)
                    .get("/foo/bar/js/index.js")
                    .expect(301)
                    .expect("location", "/js/index.js");
            });
            it("case: basePath = /basePath/", async () => {
                const expressApp = await getExpressApp({
                    ...baseAppServerConfig,
                    basePath: "/basePath/"
                });
                return request(expressApp)
                    .get("/basePath/foo/bar/js/index.js")
                    .expect(301)
                    .expect("location", "/basePath/js/index.js");
            });
        });

        it("uses a fallback asset", async () => {
            const expressApp = await getExpressApp({
                ...baseAppServerConfig,
                fallbackAssetPath: "/404.html",
                fallbackStatusCode: 404
            });
            return request(expressApp)
                .get("/not-existing")
                .expect(404)
                .expect(/404.html/);
        });

        it("sets the correct content-type header", async () => {
            const expressApp = await getExpressApp(baseAppServerConfig);
            await request(expressApp)
                .get("/")
                .expect("content-type", /text\/html/);
            await request(expressApp)
                .get("/js/index.js")
                .expect("content-type", /application\/javascript/);
        });

        it("sets custom headers", async () => {
            const expressApp = await getExpressApp({
                ...baseAppServerConfig,
                headers: {
                    "**/*": { "x-custom": "x-custom" }
                }
            });
            return request(expressApp)
                .get("/")
                .expect("x-custom", "x-custom");
        });

        it("configures html files", async () => {
            const expressApp = await getExpressApp({
                ...baseAppServerConfig,
                configuration: { KEY: "VALUE" }
            });
            return request(expressApp)
                .get("/")
                .then(res => {
                    const $ = load(res.text);
                    const scriptContent = $("script#app-config").html();
                    const vm = new VM({ sandbox: { window: {} } });
                    vm.run(scriptContent!);
                    const APP_CONFIG = vm.run("window.APP_CONFIG");
                    expect(APP_CONFIG).to.deep.equal({
                        BASE_PATH: "/",
                        KEY: "VALUE"
                    });
                });
        });

        it("injects the correct BASE_PATH configuration value", async () => {
            const expressApp = await getExpressApp({
                ...baseAppServerConfig,
                basePath: "/basePath/"
            });
            return request(expressApp)
                .get("/basePath/")
                .then(res => {
                    const $ = load(res.text);
                    const scriptContent = $("script#app-config").html();
                    const vm = new VM({ sandbox: { window: {} } });
                    vm.run(scriptContent!);
                    const APP_CONFIG = vm.run("window.APP_CONFIG");
                    expect(APP_CONFIG).to.deep.equal({
                        BASE_PATH: "/basePath/"
                    });
                });
        });

        it("whitelists the app-config script in the CSP header, if the header is present", async () => {
            const expressApp = await getExpressApp({
                ...baseAppServerConfig,
                headers: {
                    "**/*": {
                        "content-security-policy": "default-src 'self'"
                    }
                }
            });
            await request(expressApp)
                .get("/")
                .expect(
                    "content-security-policy",
                    "default-src 'self'; script-src 'sha256-ZyuLks6agCugBPFxQdY5ymNgF6NVm8BUoX85hOgGVqo='"
                );
        });
    });
});
