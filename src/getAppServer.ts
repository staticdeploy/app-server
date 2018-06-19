import { IConfig } from "@staticdeploy/app-config";
import bunyanMiddleware from "bunyan-middleware";
import express from "express";

import getAppServerRouter from "./getAppServerRouter";
import logger from "./logger";
import removeTrailingSlash from "./utils/removeTrailingSlash";

interface IAppServerOptions {
    root: string;
    fallbackResource: string;
    selector: string;
    configKeyPrefix: string;
    basePath: string;
    config: IConfig;
}

export default function getAppServer(options: IAppServerOptions) {
    const appServer = express();

    // Needed when basePath != / to make express use the redirecting middleware
    // mounted at /basePath - without trailing slash - instead of the
    // appServerRouter middleware mounted at /basePath/ - with trailing slash.
    // Without strict routing express would ignore the first middleware and
    // always use the second
    appServer.set("strict routing", true);

    // Log requests
    appServer.use(bunyanMiddleware({ logger }));

    // If basePath != /, redirect /basePath to /basePath/
    if (options.basePath !== "/") {
        appServer.get(removeTrailingSlash(options.basePath), (_req, res) => {
            res.redirect(301, options.basePath);
        });
    }

    // Use appServerRouter
    appServer.use(
        options.basePath,
        getAppServerRouter({
            root: options.root,
            fallbackResource: options.fallbackResource,
            selector: options.selector,
            config: options.config,
            configKeyPrefix: options.configKeyPrefix
        })
    );

    return appServer;
}
