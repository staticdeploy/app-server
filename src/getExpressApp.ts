import serveStatic from "@staticdeploy/serve-static";
import bunyanMiddleware from "bunyan-middleware";
import express from "express";

import IAppServerConfig from "./IAppServerConfig";
import logger from "./logger";

export default async function getExpressApp(config: IAppServerConfig) {
    const app = express();

    // Disable x-powered-by header for security reasons
    app.disable("x-powered-by");

    // Log requests
    app.use(bunyanMiddleware({ logger }));

    app.use(
        config.basePath,
        await serveStatic({
            root: config.root,
            fallbackAssetPath: config.fallbackAssetPath,
            fallbackStatusCode: config.fallbackStatusCode,
            configuration: config.configuration,
            headers: config.headers,
            basePath: config.basePath
        })
    );

    return app;
}
