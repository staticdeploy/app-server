import getDebug = require("debug");
import { RequestHandler } from "express";

import { getConfiguredIndex, IEnv } from "../config";

const debug = getDebug("app-server:serveIndex");

export default function serveIndex(
    root: string,
    index: string,
    selector: string,
    env: IEnv
): RequestHandler {
    const configuredIndex = getConfiguredIndex(root, index, selector, env);
    const configuredIndexLength = configuredIndex.length.toString();
    return (req, res, next) => {
        const { method, path } = req;
        if (
            (path === index || path === "/") &&
            (method === "GET" || method === "HEAD")
        ) {
            debug("Serving configured index");
            res
                .type("html")
                .header("Content-Length", configuredIndexLength)
                .status(200)
                // Don't send the body on HEAD requests
                .send(method === "GET" ? configuredIndex : undefined);
        } else {
            next();
        }
    };
}
