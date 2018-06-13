import bunyan from "bunyan";
import bunyanMiddleware from "bunyan-middleware";
import express from "express";
import yargs from "yargs";

import getAppServerRouter from "../getAppServerRouter";
import addTrailingSlash from "../utils/addTrailingSlash";
import removeTrailingSlash from "../utils/removeTrailingSlash";
import toAbsolute from "../utils/toAbsolute";

const logger = bunyan.createLogger({ name: "@staticdeploy/app-server" });

interface IArgv extends yargs.Arguments {
    root: string;
    fallbackResource: string;
    selector: string;
    configKeyPrefix: string;
    baseUrl: string;
    port: number;
}

const argv = yargs
    .usage("Usage: $0 <options>")
    .env("APP_SERVER")
    .option("root", {
        default: "build",
        describe: "Root diretory to serve",
        type: "string"
    })
    .option("fallbackResource", {
        alias: "index",
        coerce: toAbsolute,
        default: "index.html",
        describe:
            "Fallback resource to serve when the requested path doesn't match any asset",
        type: "string"
    })
    .option("selector", {
        default: "script#app-config",
        describe: "Selector for the script element to inject config into",
        type: "string"
    })
    .option("configKeyPrefix", {
        default: "APP_CONFIG_",
        describe:
            "Prefix of the environment variables to use for configuration",
        type: "string"
    })
    .option("baseUrl", {
        coerce: addTrailingSlash,
        default: "/",
        describe: "Website base url",
        type: "string"
    })
    .option("port", {
        coerce: port => parseInt(port, 10),
        default: "3000",
        describe: "Port to listen on",
        type: "string"
    })
    .wrap(Math.min(120, yargs.terminalWidth()))
    .strict().argv as IArgv;

// Deprecate use of --index option
if (process.argv.find(arg => /^--index/.test(arg))) {
    // tslint:disable-next-line:no-console
    console.log("Option --index is deprectaed, use --fallbackResource instead");
}

try {
    express()
        .set("strict routing", true)
        .use(bunyanMiddleware({ logger }))
        .get(removeTrailingSlash(argv.baseUrl), (_req, res) => {
            res.redirect(301, argv.baseUrl);
        })
        .use(
            argv.baseUrl,
            getAppServerRouter({
                root: argv.root,
                fallbackResource: argv.fallbackResource,
                selector: argv.selector,
                config: process.env,
                configKeyPrefix: argv.configKeyPrefix
            })
        )
        .listen(argv.port, () => {
            logger.info(`app-server started on port ${argv.port}`);
        });
} catch (err) {
    logger.error(err, "Error starting app-server");
    process.exit(1);
}
