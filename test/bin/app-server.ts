import { expect } from "chai";
import { load } from "cheerio";
import { ChildProcess, spawn } from "child_process";
import { createTree, destroyTree } from "create-fs-tree";
import { tmpdir } from "os";
import { join } from "path";
import request from "supertest";
import { v4 } from "uuid";
import { VM } from "vm2";

async function startServer(args: string[], env: NodeJS.ProcessEnv) {
    const devConfigServerPath = join(__dirname, "../../src/bin/app-server.ts");
    const server = spawn(
        require.resolve("ts-node/dist/bin.js"),
        [devConfigServerPath, ...args],
        { env: { ...process.env, ...env } }
    );
    await new Promise(resolve => {
        server.stdout.on("data", chunk => {
            if (/app-server started/.test(chunk.toString())) {
                resolve();
            }
        });
    });
    return server;
}

describe("app-server bin", function() {
    // Increase timeout for these tests since each of them starts app-server
    this.timeout(5000);

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

    // Stop app-server after each tests
    let server: ChildProcess;
    afterEach(() => {
        server.kill();
    });

    it("starts a server serving the static app", async () => {
        server = await startServer(["--root", root], env);
        return request("http://localhost:3000")
            .get("/")
            .expect(200)
            .expect(/head/);
    });

    it("301 to /baseUrl/ on GET /baseUrl", async () => {
        server = await startServer(
            ["--root", root, "--baseUrl", "/baseUrl"],
            env
        );
        await request("http://localhost:3000")
            .get("/baseUrl")
            .expect(301)
            .expect("Location", "/baseUrl/");
        await request("http://localhost:3000")
            .get("/baseUrl/")
            .expect(200)
            .expect(/head/);
    });

    it("configures html files", async () => {
        server = await startServer(["--root", root], env);
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
