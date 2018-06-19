import yargs from "yargs";

import getAppServer from "../getAppServer";
import logger from "../logger";
import addTrailingSlash from "../utils/addTrailingSlash";
import deprecate from "../utils/deprecate";
import toAbsolute from "../utils/toAbsolute";

// Get start options (parse, validate, normalize, and set defaults for argv)
interface IArgv extends yargs.Arguments {
    root: string;
    fallbackResource: string;
    selector: string;
    configKeyPrefix: string;
    basePath: string;
    port: number;
}
const argv = yargs
    .usage("Usage: $0 <options>")
    .env("APP_SERVER")
    .option("root", {
        default: "build",
        describe: "Root directory to serve",
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
    .option("basePath", {
        alias: "baseUrl",
        coerce: basePath => toAbsolute(addTrailingSlash(basePath)),
        default: "/",
        describe: "Website base path",
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
if (
    process.argv.find(arg => /^--index/.test(arg)) ||
    process.env.APP_SERVER_INDEX
) {
    deprecate("Option --index is deprecated, use --fallbackResource instead");
}
// Deprecate use of --baseUrl option
if (
    process.argv.find(arg => /^--baseUrl/.test(arg)) ||
    process.env.APP_SERVER_BASE_URL
) {
    deprecate("Option --baseUrl is deprecated, use --basePath instead");
}

// Create and start the server
try {
    const appServer = getAppServer({
        root: argv.root,
        fallbackResource: argv.fallbackResource,
        selector: argv.selector,
        configKeyPrefix: argv.configKeyPrefix,
        basePath: argv.basePath,
        config: process.env
    });
    appServer.listen(argv.port, () => {
        logger.info(`app-server started on port ${argv.port}`);
    });
} catch (err) {
    logger.error(err, "Error starting app-server");
    process.exit(1);
}
