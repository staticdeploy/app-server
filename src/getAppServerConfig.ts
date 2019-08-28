import { resolve } from "path";
import yargs from "yargs";

import IAppServerConfig from "./IAppServerConfig";
import addTrailingSlash from "./utils/addTrailingSlash";
import getConfigurationFromEnv from "./utils/getConfigurationFromEnv";
import readConfigFile from "./utils/readConfigFile";
import toAbsolute from "./utils/toAbsolute";

// Get app-server config, either from a config file, command line args, or
// environment variables. The function validates the config and sets the
// appropriate defaults
export default function getAppServerConfig(
    argv: string[],
    env: NodeJS.ProcessEnv
): IAppServerConfig {
    const yargsConfig = yargs
        .usage("Usage: $0 <options>")
        .env("APP_SERVER")
        .option("config", {
            coerce: resolve,
            config: true,
            default: "app-server.config.js",
            configParser: (configFilePath: string) => {
                const config = readConfigFile(configFilePath);
                const { configuration, headers } = config;
                return {
                    ...config,
                    // Options 'configuration' and 'headers' are expected by
                    // yargs to be strings, but they are objects when specified
                    // in the config file, hence the need to stringify them
                    ...(configuration
                        ? { configuration: JSON.stringify(configuration) }
                        : undefined),
                    ...(headers
                        ? { headers: JSON.stringify(headers) }
                        : undefined)
                };
            }
        })
        .option("root", {
            default: "build",
            describe: "Root directory to serve",
            type: "string"
        })
        .option("fallbackAssetPath", {
            coerce: toAbsolute,
            default: "/index.html",
            describe:
                "Absolute path (relative to the root directory) of the asset to use as fallback when requests don't match any other asset. The asset MUST exist",
            type: "string"
        })
        .option("fallbackStatusCode", {
            default: 200,
            describe: "Status code to use when serving the fallback asset",
            type: "number"
        })
        .option("headers", {
            default: "{}",
            describe:
                "(asset matcher, headers) map specifying which headers to assign to which assets",
            type: "string"
        })
        .option("configuration", {
            default: "{}",
            describe: "Configuration of the static app",
            type: "string"
        })
        .option("configurationKeyPrefix", {
            default: "APP_CONFIG_",
            describe:
                "Prefix of the environment variables used for the configuration of the static app",
            type: "string"
        })
        .option("basePath", {
            coerce: basePath => toAbsolute(addTrailingSlash(basePath)),
            default: "/",
            describe: "Static app base path",
            type: "string"
        })
        .option("port", {
            default: 3000,
            describe: "Port to listen on",
            type: "number"
        })
        .wrap(Math.min(120, yargs.terminalWidth()))
        .strict()
        .parse(argv);

    return {
        root: yargsConfig.root,
        fallbackAssetPath: yargsConfig.fallbackAssetPath,
        fallbackStatusCode: yargsConfig.fallbackStatusCode,
        headers: JSON.parse(yargsConfig.headers),
        configuration: {
            // Environment-variable configurations take precedence over
            // config-file configurations
            ...JSON.parse(yargsConfig.configuration),
            ...getConfigurationFromEnv(env, yargsConfig.configurationKeyPrefix)
        },
        basePath: yargsConfig.basePath,
        port: yargsConfig.port
    };
}
