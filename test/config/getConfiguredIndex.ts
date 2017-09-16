import { expect } from "chai";
import { load } from "cheerio";
import { createTree, destroyTree } from "create-fs-tree";
import { tmpdir } from "os";
import { join } from "path";

import { getConfiguredIndex } from "../../src/config";

describe("config.getConfiguredIndex", () => {
    const workdir = join(tmpdir(), "app-server");
    const root = join(workdir, "build");
    const index = "/index.html";
    const selector = "script#app-config";
    const env = {
        APP_CONFIG_MY_VAR: "VALUE"
    };

    beforeEach(() => {
        createTree(workdir, {
            build: {
                "index.html": `
                    <!doctype html>
                    <html>
                        <head>
                            <title>title</title>
                            <script id="app-config" src="/app-config.js"></script>
                        </head>
                        <body>
                        </body>
                    </html>
                `
            }
        });
    });
    afterEach(() => {
        destroyTree(workdir);
    });

    it("injects the generated config script into file@root/index, element@selector", () => {
        const html = getConfiguredIndex(root, index, selector, env).toString();
        const $ = load(html);
        const scriptContent = $(selector).html();
        expect(scriptContent).to.have.string("window.APP_CONFIG");
    });

    it("removes the src attribute from element@selector", () => {
        const html = getConfiguredIndex(root, index, selector, env).toString();
        const $ = load(html);
        const scriptSrc = $(selector).attr("src");
        expect(scriptSrc).to.equal(undefined);
    });
});
