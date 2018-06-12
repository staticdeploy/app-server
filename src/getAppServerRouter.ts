import { configureHtml, IConfig } from "@staticdeploy/app-config";
import { RequestHandler, Router } from "express";
import readdir from "fs-readdir-recursive";
import { getType } from "mime";
import { readFile } from "mz/fs";
import { join } from "path";

import findMatchingAsset from "./utils/findMatchingAsset";
import isCanonicalPath from "./utils/isCanonicalPath";
import removePrefix from "./utils/removePrefix";
import toAbsolute from "./utils/toAbsolute";

export interface IAppServerRouterOptions {
    root: string;
    fallbackResource: string;
    selector: string;
    config: IConfig;
    configKeyPrefix: string;
}
export default function getAppServerRouter(
    options: IAppServerRouterOptions
): RequestHandler {
    const {
        root,
        selector,
        fallbackResource,
        config,
        configKeyPrefix
    } = options;

    // Get assets from files in the served folder
    const localPaths = readdir(root).map(toAbsolute);
    const assets = localPaths.map(localPath => ({
        path: localPath,
        mimeType: getType(localPath) || "application/octet-stream"
    }));

    // Find the fallback asset
    const fallbackAsset = assets.find(asset => asset.path === fallbackResource);

    // Ensure the fallback resource is one of the assets
    if (!fallbackAsset) {
        throw new Error(`Fallback resource ${fallbackResource} does not exist`);
    }

    return Router().get(/.*/, async (req, res) => {
        const baseUrl = req.baseUrl;
        const requestedPath = toAbsolute(removePrefix(req.path, baseUrl));

        // Find the best matching asset
        const matchingAsset = findMatchingAsset(
            requestedPath,
            assets,
            fallbackAsset
        );

        // When the requested path is not the canonical remote path for the
        // matching asset, redirect to the canonical remote path
        if (!isCanonicalPath(requestedPath, matchingAsset, fallbackAsset)) {
            const canonicalRemotePath = join(baseUrl, matchingAsset.path);
            res.redirect(301, canonicalRemotePath);
            return;
        }

        // Get the matching asset content
        let content = await readFile(join(root, matchingAsset.path));

        // Configure the content if it's an html file
        if (matchingAsset.mimeType === "text/html") {
            content = configureHtml({
                rawConfig: config,
                configKeyPrefix: configKeyPrefix,
                html: content,
                selector: selector
            });
        }

        // Serve the matching asset
        res.type(matchingAsset.mimeType)
            .status(200)
            .send(content);
    });
}
