import { expect } from "chai";
import { createTree, destroyTree } from "create-fs-tree";
import express = require("express");
import { tmpdir } from "os";
import { join } from "path";
import request = require("supertest");

import serveIndex from "../../src/middleware/serveIndex";

describe("middleware serveIndex", () => {
    const workdir = join(tmpdir(), "app-server");
    const root = join(workdir, "build");
    const index = "/index.html";
    const selector = "script#app-config";
    const env = {
        APP_CONFIG_MY_VAR: "VALUE"
    };
    // Since the middleware only accesses the filesystem when initialized, we
    // can create and destroy the mock filesystem here, without the need of
    // before/after hooks
    createTree(workdir, {
        build: {
            "index.html": '<script id="app-config"></script>'
        }
    });
    const middleware = serveIndex(root, index, selector, env);
    const server = express()
        .use(middleware)
        // Serve non-200 status code to requests not handled by serveIndex
        .use((_req, res) => res.status(299).send());
    destroyTree(workdir);

    it("doesn't handle non GET or HEAD requests", () => {
        return request(server)
            .post(index)
            .expect(299);
    });

    it("doesn't handle non-index requests", () => {
        return request(server)
            .get("/not-index")
            .expect(299);
    });

    describe("handles index requests", () => {
        it("case: index equals configured index", () => {
            return request(server)
                .get(index)
                .expect(200);
        });
        it("case: index equals /", () => {
            return request(server)
                .get("/")
                .expect(200);
        });
    });

    it("serves the configured index to GET index requests", () => {
        return request(server)
            .get(index)
            .expect(200)
            .expect(/APP_CONFIG/);
    });

    it("returns the correct Content-Type for the index (~ text/html)", () => {
        return request(server)
            .get(index)
            .expect(200)
            .expect("Content-Type", /text\/html/);
    });

    it("doesn't serve the configured index to HEAD index requests", () => {
        return request(server)
            .head(index)
            .expect(200)
            .then(res => expect(res.text).to.equal(undefined));
    });

    it("serves Content-Length and Content-Type headers to HEAD index requests", async () => {
        const indexContentLength = await request(server)
            .get(index)
            .expect(200)
            .then(res => res.header["content-length"]);
        return request(server)
            .head(index)
            .expect(200)
            .expect("Content-Type", /text\/html/)
            .expect("Content-Length", indexContentLength);
    });
});
