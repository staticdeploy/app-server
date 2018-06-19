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
    fallbackAssetPath: string;
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
        fallbackAssetPath,
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
    const fallbackAsset = assets.find(
        asset => asset.path === fallbackAssetPath
    );

    // Ensure the fallback asset exists among the assets
    if (!fallbackAsset) {
        throw new Error(
            `Asset ${fallbackAssetPath} does not exist in ${root}, cannot be set as fallback asset`
        );
    }

    return Router().get(/.*/, async (req, res) => {
        const basePath = req.baseUrl;
        const requestedPath = toAbsolute(removePrefix(req.path, basePath));

        // Find the best matching asset
        const matchingAsset = findMatchingAsset(
            requestedPath,
            assets,
            fallbackAsset
        );

        // When the requested path is not the canonical remote path for the
        // matching asset, redirect to the canonical remote path
        if (!isCanonicalPath(requestedPath, matchingAsset, fallbackAsset)) {
            const canonicalRemotePath = join(basePath, matchingAsset.path);
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
