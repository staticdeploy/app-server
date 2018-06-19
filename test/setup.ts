import { IConfig } from "@staticdeploy/app-config";
import chai from "chai";
import { createTree, destroyTree, IDefinition } from "create-fs-tree";
import express from "express";
import { tmpdir } from "os";
import { join } from "path";
import request from "supertest";
import { v4 } from "uuid";

import getAppServerRouter from "../src/getAppServerRouter";

// Register mocha tests from a test definition. A test definition corresponds to
// a mocha 'describe' block. Each test case of a test definition correspond to a
// mocha 'it' block
interface ITestDefinition {
    only?: boolean;
    options: {
        basePath: string;
        root: IDefinition;
        fallbackAssetPath: string;
        selector?: string;
        config?: IConfig;
        configKeyPrefix?: string;
    };
    testCases: {
        only?: boolean;
        requestedPath: string;
        expectedStatusCode: number;
        expectedBody?: string | ((body: string) => any);
        expectedLocation?: string;
    }[];
}
export function test(description: string, testDefinition: ITestDefinition) {
    const { options, testCases } = testDefinition;

    // Support only running one definition
    const describeFn = testDefinition.only ? describe.only : describe;

    describeFn(description, () => {
        let server: express.Express;
        const root = join(tmpdir(), "staticdeploy/app-server/", v4());

        before(() => {
            // Create the root directory with the provided definition
            createTree(root, options.root);

            // Get the app to run tests against
            server = express().use(
                options.basePath,
                getAppServerRouter({
                    root: root,
                    fallbackAssetPath: options.fallbackAssetPath,
                    selector: options.selector || "script#app-config",
                    config: options.config || {},
                    configKeyPrefix: options.configKeyPrefix || ""
                })
            );
        });
        after(() => {
            destroyTree(root);
        });

        // Register test cases
        testCases.forEach(testCase => {
            const {
                requestedPath,
                expectedStatusCode,
                expectedBody,
                expectedLocation
            } = testCase;

            // Get properties needed for the test description
            const andCorrectLocation = expectedLocation
                ? " and correct location"
                : "";
            const andCorrectBody = expectedBody ? " and correct body" : "";

            // Support only running one test case
            const itFn = testCase.only ? it.only : it;

            itFn(
                `case: ${expectedStatusCode}${andCorrectLocation}${andCorrectBody} when requesting ${requestedPath}`,
                () => {
                    // Make test request
                    let t = request(server).get(requestedPath);

                    // Verify the response status code
                    t.expect(expectedStatusCode);

                    // If specified, verify the response Location header
                    if (expectedLocation) {
                        t = t.expect("Location", expectedLocation);
                    }

                    // Verify the response body
                    if (expectedBody) {
                        t = t.expect((res: request.Response) => {
                            const body =
                                res.text || (res.body && res.body.toString());
                            if (typeof expectedBody === "function") {
                                expectedBody(body);
                            } else {
                                chai.expect(body).to.equal(expectedBody);
                            }
                        });
                    }

                    return t;
                }
            );
        });
    });
}
