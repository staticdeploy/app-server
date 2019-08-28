import { expect } from "chai";
import { createTree, destroyTree } from "create-fs-tree";
import decache from "decache";
import { tmpdir } from "os";
import { join } from "path";

import getAppServerConfig from "../src/getAppServerConfig";

describe("getAppServerConfig", () => {
    const configFileDir = join(tmpdir(), "app-server");
    const configFileName = "app-server.config.js";
    const configFilePath = join(configFileDir, configFileName);
    afterEach(() => {
        try {
            decache(configFilePath);
        } catch {
            // Ignore errors when configFilePath was never required (and cached)
        }
        destroyTree(configFileDir);
    });

    it("has defaults for all options", () => {
        const config = getAppServerConfig([], {});
        expect(config).to.deep.equal({
            basePath: "/",
            configuration: {},
            fallbackAssetPath: "/index.html",
            fallbackStatusCode: 200,
            headers: {},
            port: 3000,
            root: "build"
        });
    });

    it("gets the config from a config file, if present", () => {
        createTree(configFileDir, {
            [configFileName]: `
                module.exports = {
                    basePath: "/basePath/"
                };
            `
        });
        const config = getAppServerConfig(["--config", configFilePath], {});
        expect(config).to.deep.equal({
            basePath: "/basePath/",
            configuration: {},
            fallbackAssetPath: "/index.html",
            fallbackStatusCode: 200,
            headers: {},
            port: 3000,
            root: "build"
        });
    });

    describe("parses headers into an object", () => {
        it("case: hedaers in config file", () => {
            createTree(configFileDir, {
                [configFileName]: `
                    module.exports = {
                        headers: { "**": { "x-custom": "x-custom" }}
                    };
                `
            });
            const config = getAppServerConfig(["--config", configFilePath], {});
            expect(config).to.deep.equal({
                basePath: "/",
                configuration: {},
                fallbackAssetPath: "/index.html",
                fallbackStatusCode: 200,
                headers: {
                    "**": {
                        "x-custom": "x-custom"
                    }
                },
                port: 3000,
                root: "build"
            });
        });

        it("case: hedaers as cli options", () => {
            const config = getAppServerConfig(
                [
                    "--headers",
                    JSON.stringify({ "**": { "x-custom": "x-custom" } })
                ],
                {}
            );
            expect(config).to.deep.equal({
                basePath: "/",
                configuration: {},
                fallbackAssetPath: "/index.html",
                fallbackStatusCode: 200,
                headers: {
                    "**": {
                        "x-custom": "x-custom"
                    }
                },
                port: 3000,
                root: "build"
            });
        });
    });

    it("gets the configuration from yargs options and from the environment (with priority for the environment)", () => {
        const config = getAppServerConfig(
            [
                "--configuration",
                JSON.stringify({ KEY_0: "CLI_VALUE_0", KEY_1: "CLI_VALUE_1" })
            ],
            {
                APP_CONFIG_KEY_1: "ENV_VALUE_1",
                APP_CONFIG_KEY_2: "ENV_VALUE_2"
            }
        );
        expect(config).to.deep.equal({
            basePath: "/",
            configuration: {
                KEY_0: "CLI_VALUE_0",
                KEY_1: "ENV_VALUE_1",
                KEY_2: "ENV_VALUE_2"
            },
            fallbackAssetPath: "/index.html",
            fallbackStatusCode: 200,
            headers: {},
            port: 3000,
            root: "build"
        });
    });
});
