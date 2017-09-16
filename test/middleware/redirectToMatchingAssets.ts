import { createTree, destroyTree } from "create-fs-tree";
import express = require("express");
import { tmpdir } from "os";
import { join } from "path";
import request = require("supertest");

import redirectToMatchingAssets from "../../src/middleware/redirectToMatchingAssets";

// baseUrl, requestedUrl, expectedRedirectLocation
type Expectation = [string, string, string | null];

describe("middleware redirectToMatchingAssets", () => {
    const workdir = join(tmpdir(), "app-server");
    const root = join(workdir, "root");
    const mockFsDefinition = {
        root: {
            file: "/file",
            sub1: {
                file: "/sub1/file",
                sub2: {
                    file: "/sub1/sub2/file"
                }
            },
            subSameName: {
                file: "/subSameName/file",
                subSameName: {
                    file: "/subSameName/subSameName/file"
                },
                sub1: {
                    file: "/subSameName/sub1/file",
                    subSameName: {
                        file: "/subSameName/sub1/subSameName/file"
                    }
                }
            }
        }
    };
    // Since the middleware only accesses the filesystem when initialized, we
    // can create and destroy the mock filesystem here, without the need of
    // before/after hooks
    createTree(workdir, mockFsDefinition);
    const middleware = redirectToMatchingAssets(root);
    destroyTree(workdir);

    /*
    *   Expected behaviour:
    *     - no redirect on perfect match
    *     - no redirect on no match
    *     - redirect to perfect match on partial match
    */
    const expectations: Expectation[] = [
        /*
        *   baseUrl: /
        */
        // No redirects on perfect match or no match
        ["/", "/nonMatching", null], // no match
        ["/", "/file", null], // perfect match
        ["/", "/sub1", null], // no match
        ["/", "/sub1/", null], // no match
        ["/", "/sub1/file", null], // perfect match
        ["/", "/sub1/sub2/file", null], // perfect match
        ["/", "/subSameName/file", null], // perfect match
        ["/", "/subSameName/subSameName/file", null], // perfect match
        // Ok with prefix
        ["/", "/prefix/file", "/file"],
        // Ok with nested paths
        ["/", "/prefix/sub1/file", "/sub1/file"],
        ["/", "/prefix/sub1/sub2/file", "/sub1/sub2/file"],
        // Ok with (consecutive) segments having the same name
        ["/", "/prefix/subSameName/file", "/subSameName/file"],
        [
            "/",
            "/prefix/subSameName/subSameName/file",
            "/subSameName/subSameName/file"
        ],
        [
            "/",
            "/prefix/subSameName/sub1/subSameName/file",
            "/subSameName/sub1/subSameName/file"
        ],
        // Ok with multi-level prefixes
        ["/", "/nested/prefix/sub1/sub2/file", "/sub1/sub2/file"],
        // Not tricked by partially matching path segments
        ["/", "/partiallyMatching_sub1/file", "/file"],

        /*
        *   baseUrl: /base/
        */
        // No redirects on file exists or non matching
        ["/base/", "/base/nonMatching", null], // no match
        ["/base/", "/base/file", null], // perfect match
        ["/base/", "/base/sub1", null], // no match
        ["/base/", "/base/sub1/", null], // no match
        ["/base/", "/base/sub1/file", null], // perfect match
        ["/base/", "/base/sub1/sub2/file", null], // perfect match
        ["/base/", "/base/subSameName/file", null], // perfect match
        ["/base/", "/base/subSameName/subSameName/file", null], // perfect match
        // Ok with prefix
        ["/base/", "/base/prefix/file", "/base/file"],
        // Ok with nested paths
        ["/base/", "/base/prefix/sub1/file", "/base/sub1/file"],
        ["/base/", "/base/prefix/sub1/sub2/file", "/base/sub1/sub2/file"],
        // Ok with (consecutive) segments having the same name
        ["/base/", "/base/prefix/subSameName/file", "/base/subSameName/file"],
        [
            "/base/",
            "/base/prefix/subSameName/subSameName/file",
            "/base/subSameName/subSameName/file"
        ],
        // Ok with multi-level prefixes
        [
            "/base/",
            "/base/nested/prefix/sub1/sub2/file",
            "/base/sub1/sub2/file"
        ],
        // Not tricked by partially matching path segments
        ["/base/", "/base/partiallyMatching_sub1/file", "/base/file"],

        /*
        *   Complex baseUrl-s
        */
        // No trailing slash
        ["/base", "/base/prefix/sub1/file", "/base/sub1/file"],
        // Multi-level baseUrl
        [
            "/nested/base/",
            "/nested/base/prefix/sub1/file",
            "/nested/base/sub1/file"
        ],
        // baseUrl matching path segments
        ["/subSameName/", "/subSameName/subSameName/file", null], // perfect match
        ["/subSameName/", "/subSameName/subSameName/subSameName/file", null], // perfect match
        [
            "/subSameName/",
            "/subSameName/prefix/subSameName/file",
            "/subSameName/subSameName/file"
        ]
    ];
    expectations.forEach(expectation => {
        const [baseUrl, requestedUrl, expectedRedirectLocation] = expectation;
        it(`with baseUrl=${baseUrl} redirects ${requestedUrl} -> ${expectedRedirectLocation}`, () => {
            const server = express()
                .use(baseUrl, middleware)
                // Serve non-301 status code to requests not handled by redirectToMatchingAssets
                .use((_req, res) => res.status(299).send());
            return expectedRedirectLocation === null
                ? // Expect no redirect
                  request(server)
                      .get(requestedUrl)
                      .expect(299)
                : // Expect redirect
                  request(server)
                      .get(requestedUrl)
                      .expect(301)
                      .expect("Location", expectedRedirectLocation);
        });
    });

    it("doesn't handle non GET or HEAD requests", async () => {
        const server = express()
            .use(middleware)
            // Serve non-301 status code to requests not handled by redirectToMatchingAssets
            .use((_req, res) => res.status(299).send());
        await request(server)
            .get("/prefix/file")
            .expect(301);
        return request(server)
            .post("/prefix/file")
            .expect(299);
    });
});
