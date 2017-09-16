import history = require("connect-history-api-fallback");
import { Router } from "express";
import serveStatic = require("serve-static");

import { IEnv } from "./config";
import redirectToMatchingAssets from "./middleware/redirectToMatchingAssets";
import serveIndex from "./middleware/serveIndex";

export default function getRouter(
    root: string,
    index: string,
    selector: string,
    env: IEnv
): Router {
    return Router()
        .use(history({ index }))
        .use(redirectToMatchingAssets(root))
        .use(serveIndex(root, index, selector, env))
        .use(serveStatic(root, { index }));
}
