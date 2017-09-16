import getDebug = require("debug");
import { RequestHandler } from "express";
import readdir = require("fs-readdir-recursive");
import { endsWith, maxBy } from "lodash";
import { join } from "path";

const debug = getDebug("app-server:redirectToMatchingAssets");

function toAbsolute(path: string) {
    return join("/", path);
}

function isSubpath(possibleSubpath: string, target: string) {
    return endsWith(target, join("/", possibleSubpath));
}
function findMatch(localPaths: string[], requestedPath: string) {
    const matchingLocalPaths = localPaths.filter(localPath =>
        isSubpath(localPath, requestedPath)
    );
    return maxBy(matchingLocalPaths, path => path.length);
}

export default function redirectToMatchingAssets(root: string): RequestHandler {
    const localPaths = readdir(root).map(toAbsolute);
    return (req, res, next) => {
        // Notes on how express assigns properties:
        // - req.path has already been stripped of path.baseUrl
        // - req.baseUrl is undefined if the middleware is mounted without a
        //   path or to the / path
        const { baseUrl = "/", method, path: requestedPath } = req;
        // Don't handle methods other than GET and HEAD
        if (method !== "GET" && method !== "HEAD") {
            debug(`No redirect: request has method ${method}`);
            return next();
        }
        const matchingLocalPath = findMatch(localPaths, requestedPath);
        // If the requested path doesn't match any local paths, do nothing and
        // continue (other middlewares down the line will either serve a
        // fallback or respond a 404)
        if (!matchingLocalPath) {
            debug("No redirect: no local path matches requested path");
            return next();
        }
        // If the requested path matches exactly the local path, do nothing and
        // continue (other middlewares down the line will serve the file)
        if (matchingLocalPath === requestedPath) {
            debug("No redirect: requested path exactly matches local path");
            return next();
        }
        // Otherwise, redirect to the full remote path
        const fullRemotePath = join(baseUrl, matchingLocalPath);
        debug(
            `Redirecting: ${join(baseUrl, requestedPath)} -> ${fullRemotePath}`
        );
        res.redirect(301, fullRemotePath);
    };
}
