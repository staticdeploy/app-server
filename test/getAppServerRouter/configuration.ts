import { expect } from "chai";
import { load } from "cheerio";
import { VM } from "vm2";

import { test } from "../setup";

const htmlWithConfig = '<head><script id="app-config"></script></head>';

function getInjectedAPP_CONFIG(body: string) {
    const $ = load(body);
    const scriptContent = $("script#app-config").html();
    const vm = new VM({ sandbox: { window: {} } });
    vm.run(scriptContent!);
    return vm.run("window.APP_CONFIG");
}

describe("staticRoute configuration injection", () => {
    test("doesn't inject anything in non-html files", {
        options: {
            baseUrl: "/",
            root: {
                asset: "/asset",
                html: htmlWithConfig,
                nested: {
                    asset: "/nested/asset",
                    html: htmlWithConfig
                },
                fallback: "/fallback"
            },
            fallbackResource: "/fallback"
        },
        testCases: [
            {
                requestedPath: "/asset",
                expectedStatusCode: 200,
                expectedBody: "/asset"
            },
            {
                requestedPath: "/html",
                expectedStatusCode: 200,
                expectedBody: htmlWithConfig
            },
            {
                requestedPath: "/nested/asset",
                expectedStatusCode: 200,
                expectedBody: "/nested/asset"
            },
            {
                requestedPath: "/nested/html",
                expectedStatusCode: 200,
                expectedBody: htmlWithConfig
            }
        ]
    });

    test("injects the supplied configuration in html files", {
        options: {
            baseUrl: "/",
            config: { APP_CONFIG_KEY: "VALUE" },
            configKeyPrefix: "APP_CONFIG_",
            root: {
                "index.html": htmlWithConfig,
                "asset.html": htmlWithConfig,
                nested: {
                    "index.html": htmlWithConfig,
                    "asset.html": htmlWithConfig
                },
                fallback: "/fallback"
            },
            fallbackResource: "/fallback"
        },
        testCases: [
            {
                requestedPath: "/",
                expectedStatusCode: 200,
                expectedBody: body => {
                    const APP_CONFIG = getInjectedAPP_CONFIG(body);
                    expect(APP_CONFIG).to.deep.equal({
                        KEY: "VALUE"
                    });
                }
            },
            {
                requestedPath: "/index.html",
                expectedStatusCode: 200,
                expectedBody: body => {
                    const APP_CONFIG = getInjectedAPP_CONFIG(body);
                    expect(APP_CONFIG).to.deep.equal({
                        KEY: "VALUE"
                    });
                }
            },
            {
                requestedPath: "/asset.html",
                expectedStatusCode: 200,
                expectedBody: body => {
                    const APP_CONFIG = getInjectedAPP_CONFIG(body);
                    expect(APP_CONFIG).to.deep.equal({
                        KEY: "VALUE"
                    });
                }
            },
            {
                requestedPath: "/nested",
                expectedStatusCode: 200,
                expectedBody: body => {
                    const APP_CONFIG = getInjectedAPP_CONFIG(body);
                    expect(APP_CONFIG).to.deep.equal({
                        KEY: "VALUE"
                    });
                }
            },
            {
                requestedPath: "/nested/",
                expectedStatusCode: 200,
                expectedBody: body => {
                    const APP_CONFIG = getInjectedAPP_CONFIG(body);
                    expect(APP_CONFIG).to.deep.equal({
                        KEY: "VALUE"
                    });
                }
            },
            {
                requestedPath: "/nested/index.html",
                expectedStatusCode: 200,
                expectedBody: body => {
                    const APP_CONFIG = getInjectedAPP_CONFIG(body);
                    expect(APP_CONFIG).to.deep.equal({
                        KEY: "VALUE"
                    });
                }
            },
            {
                requestedPath: "/nested/asset.html",
                expectedStatusCode: 200,
                expectedBody: body => {
                    const APP_CONFIG = getInjectedAPP_CONFIG(body);
                    expect(APP_CONFIG).to.deep.equal({
                        KEY: "VALUE"
                    });
                }
            }
        ]
    });
});
