import { escape } from "lodash";

import { test } from "../setup";

function htmlWith(body: string): string {
    return `<html><head></head><body>${escape(body)}</body></html>`;
}

describe("getAppServerRouter routing", () => {
    /*
    *   301-s
    */
    describe("redirects to the canonical path", () => {
        test("case: basePath=/", {
            options: {
                basePath: "/",
                root: {
                    asset: "/asset",
                    nested: { asset: "/nested/asset" },
                    fallback: "/fallback"
                },
                fallbackResource: "/fallback"
            },
            testCases: [
                {
                    requestedPath: "/prefix/asset",
                    expectedStatusCode: 301,
                    expectedLocation: "/asset"
                },
                {
                    requestedPath: "/prefix/nested/asset",
                    expectedStatusCode: 301,
                    expectedLocation: "/nested/asset"
                },
                {
                    requestedPath: "/nested/prefix/asset",
                    expectedStatusCode: 301,
                    expectedLocation: "/asset"
                },
                {
                    requestedPath: "/nested/prefix/nested/asset",
                    expectedStatusCode: 301,
                    expectedLocation: "/nested/asset"
                }
            ]
        });

        test("case: basePath=/base/path", {
            options: {
                basePath: "/base/path",
                root: {
                    asset: "/asset",
                    nested: { asset: "/nested/asset" },
                    fallback: "/fallback"
                },
                fallbackResource: "/fallback"
            },
            testCases: [
                {
                    requestedPath: "/base/path/prefix/asset",
                    expectedStatusCode: 301,
                    expectedLocation: "/base/path/asset"
                },
                {
                    requestedPath: "/base/path/prefix/nested/asset",
                    expectedStatusCode: 301,
                    expectedLocation: "/base/path/nested/asset"
                },
                {
                    requestedPath: "/base/path/nested/prefix/asset",
                    expectedStatusCode: 301,
                    expectedLocation: "/base/path/asset"
                },
                {
                    requestedPath: "/base/path/nested/prefix/nested/asset",
                    expectedStatusCode: 301,
                    expectedLocation: "/base/path/nested/asset"
                }
            ]
        });

        test('case: basePath=/, with "significant" files', {
            options: {
                basePath: "/",
                root: {
                    "index.html": "/index.html",
                    "asset.html": "/asset.html",
                    asset: "/asset",
                    nested: {
                        "index.html": "/nested/index.html",
                        "asset.html": "/nested/asset.html",
                        asset: "/nested/asset"
                    },
                    fallback: "/fallback"
                },
                fallbackResource: "/fallback"
            },
            testCases: [
                {
                    requestedPath: "/prefix/asset",
                    expectedStatusCode: 301,
                    expectedLocation: "/asset"
                },
                {
                    requestedPath: "/prefix/nested/asset",
                    expectedStatusCode: 301,
                    expectedLocation: "/nested/asset"
                },
                {
                    requestedPath: "/nested/prefix/asset",
                    expectedStatusCode: 301,
                    expectedLocation: "/asset"
                },
                {
                    requestedPath: "/nested/prefix/nested/asset",
                    expectedStatusCode: 301,
                    expectedLocation: "/nested/asset"
                }
            ]
        });

        test('case: basePath=/base/path, with "significant" files', {
            options: {
                basePath: "/base/path",
                root: {
                    "index.html": "/index.html",
                    "asset.html": "/asset.html",
                    asset: "/asset",
                    nested: {
                        "index.html": "/nested/index.html",
                        "asset.html": "/nested/asset.html",
                        asset: "/nested/asset"
                    },
                    fallback: "/fallback"
                },
                fallbackResource: "/fallback"
            },
            testCases: [
                {
                    requestedPath: "/base/path/prefix/asset",
                    expectedStatusCode: 301,
                    expectedLocation: "/base/path/asset"
                },
                {
                    requestedPath: "/base/path/prefix/nested/asset",
                    expectedStatusCode: 301,
                    expectedLocation: "/base/path/nested/asset"
                },
                {
                    requestedPath: "/base/path/nested/prefix/asset",
                    expectedStatusCode: 301,
                    expectedLocation: "/base/path/asset"
                },
                {
                    requestedPath: "/base/path/nested/prefix/nested/asset",
                    expectedStatusCode: 301,
                    expectedLocation: "/base/path/nested/asset"
                }
            ]
        });
    });

    /*
    *   200-s
    */
    describe("serves the best matching asset or the fallback", () => {
        test("case: basePath=/", {
            options: {
                basePath: "/",
                root: {
                    "index.html": htmlWith("/index.html"),
                    asset: htmlWith("/asset"),
                    "perfect-match": htmlWith("/perfect-match"),
                    "perfect-match.html": htmlWith("/perfect-match.html"),
                    "dot-html-match.html": htmlWith("/dot-html-match.html"),
                    "dot-html-match": {
                        "index.html": htmlWith("/dot-html-match/index.html")
                    },
                    "index-dot-html-match": {
                        "index.html": htmlWith(
                            "/index-dot-html-match/index.html"
                        )
                    },
                    nested: {
                        "index.html": htmlWith("/nested/index.html"),
                        asset: htmlWith("/nested/asset"),
                        "perfect-match": htmlWith("/nested/perfect-match"),
                        "perfect-match.html": htmlWith(
                            "/nested/perfect-match.html"
                        ),
                        "dot-html-match.html": htmlWith(
                            "/nested/dot-html-match.html"
                        ),
                        "dot-html-match": {
                            "index.html": htmlWith(
                                "/nested/dot-html-match/index.html"
                            )
                        },
                        "index-dot-html-match": {
                            "index.html": htmlWith(
                                "/nested/index-dot-html-match/index.html"
                            )
                        }
                    },
                    fallback: htmlWith("/fallback")
                },
                fallbackResource: "/fallback"
            },
            testCases: [
                // First level
                {
                    requestedPath: "/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/index.html")
                },
                {
                    requestedPath: "/asset",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/asset")
                },
                {
                    requestedPath: "/asset/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/asset")
                },
                {
                    requestedPath: "/perfect-match",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/perfect-match")
                },
                {
                    requestedPath: "/perfect-match/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/perfect-match")
                },
                {
                    requestedPath: "/dot-html-match",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/dot-html-match.html")
                },
                {
                    requestedPath: "/dot-html-match/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/dot-html-match.html")
                },
                {
                    requestedPath: "/index-dot-html-match",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/index-dot-html-match/index.html")
                },
                {
                    requestedPath: "/index-dot-html-match/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/index-dot-html-match/index.html")
                },
                // Nested
                {
                    requestedPath: "/nested",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/nested/index.html")
                },
                {
                    requestedPath: "/nested/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/nested/index.html")
                },
                {
                    requestedPath: "/nested/asset",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/nested/asset")
                },
                {
                    requestedPath: "/nested/asset/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/nested/asset")
                },
                {
                    requestedPath: "/nested/perfect-match",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/nested/perfect-match")
                },
                {
                    requestedPath: "/nested/perfect-match/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/nested/perfect-match")
                },
                {
                    requestedPath: "/nested/dot-html-match",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/nested/dot-html-match.html")
                },
                {
                    requestedPath: "/nested/dot-html-match/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/nested/dot-html-match.html")
                },
                {
                    requestedPath: "/nested/index-dot-html-match",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith(
                        "/nested/index-dot-html-match/index.html"
                    )
                },
                {
                    requestedPath: "/nested/index-dot-html-match/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith(
                        "/nested/index-dot-html-match/index.html"
                    )
                },
                // Fallback
                {
                    requestedPath: "/non-existing",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/fallback")
                },
                {
                    requestedPath: "/non-existing/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/fallback")
                },
                {
                    requestedPath: "/nested/non-existing",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/fallback")
                },
                {
                    requestedPath: "/nested/non-existing/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/fallback")
                }
            ]
        });

        test("case: basePath=/base/path", {
            options: {
                basePath: "/base/path",
                root: {
                    "index.html": htmlWith("/index.html"),
                    asset: htmlWith("/asset"),
                    "perfect-match": htmlWith("/perfect-match"),
                    "perfect-match.html": htmlWith("/perfect-match.html"),
                    "dot-html-match.html": htmlWith("/dot-html-match.html"),
                    "dot-html-match": {
                        "index.html": htmlWith("/dot-html-match/index.html")
                    },
                    "index-dot-html-match": {
                        "index.html": htmlWith(
                            "/index-dot-html-match/index.html"
                        )
                    },
                    nested: {
                        "index.html": htmlWith("/nested/index.html"),
                        asset: htmlWith("/nested/asset"),
                        "perfect-match": htmlWith("/nested/perfect-match"),
                        "perfect-match.html": htmlWith(
                            "/nested/perfect-match.html"
                        ),
                        "dot-html-match.html": htmlWith(
                            "/nested/dot-html-match.html"
                        ),
                        "dot-html-match": {
                            "index.html": htmlWith(
                                "/nested/dot-html-match/index.html"
                            )
                        },
                        "index-dot-html-match": {
                            "index.html": htmlWith(
                                "/nested/index-dot-html-match/index.html"
                            )
                        }
                    },
                    fallback: htmlWith("/fallback")
                },
                fallbackResource: "/fallback"
            },
            testCases: [
                // First level
                {
                    requestedPath: "/base/path",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/index.html")
                },
                {
                    requestedPath: "/base/path/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/index.html")
                },
                {
                    requestedPath: "/base/path/asset",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/asset")
                },
                {
                    requestedPath: "/base/path/asset/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/asset")
                },
                {
                    requestedPath: "/base/path/perfect-match",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/perfect-match")
                },
                {
                    requestedPath: "/base/path/perfect-match/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/perfect-match")
                },
                {
                    requestedPath: "/base/path/dot-html-match",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/dot-html-match.html")
                },
                {
                    requestedPath: "/base/path/dot-html-match/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/dot-html-match.html")
                },
                {
                    requestedPath: "/base/path/index-dot-html-match",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/index-dot-html-match/index.html")
                },
                {
                    requestedPath: "/base/path/index-dot-html-match/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/index-dot-html-match/index.html")
                },
                // Nested
                {
                    requestedPath: "/base/path/nested",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/nested/index.html")
                },
                {
                    requestedPath: "/base/path/nested/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/nested/index.html")
                },
                {
                    requestedPath: "/base/path/nested/asset",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/nested/asset")
                },
                {
                    requestedPath: "/base/path/nested/asset/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/nested/asset")
                },
                {
                    requestedPath: "/base/path/nested/perfect-match",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/nested/perfect-match")
                },
                {
                    requestedPath: "/base/path/nested/perfect-match/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/nested/perfect-match")
                },
                {
                    requestedPath: "/base/path/nested/dot-html-match",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/nested/dot-html-match.html")
                },
                {
                    requestedPath: "/base/path/nested/dot-html-match/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/nested/dot-html-match.html")
                },
                {
                    requestedPath: "/base/path/nested/index-dot-html-match",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith(
                        "/nested/index-dot-html-match/index.html"
                    )
                },
                {
                    requestedPath: "/base/path/nested/index-dot-html-match/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith(
                        "/nested/index-dot-html-match/index.html"
                    )
                },
                // Fallback
                {
                    requestedPath: "/base/path/non-existing",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/fallback")
                },
                {
                    requestedPath: "/base/path/non-existing/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/fallback")
                },
                {
                    requestedPath: "/base/path/nested/non-existing",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/fallback")
                },
                {
                    requestedPath: "/base/path/nested/non-existing/",
                    expectedStatusCode: 200,
                    expectedBody: htmlWith("/fallback")
                }
            ]
        });
    });
});
