import { IConfiguration } from "@staticdeploy/core";
import { startsWith } from "lodash";

export default function getConfigurationFromEnv(
    env: { [key: string]: string | undefined },
    keyPrefix: string
): IConfiguration {
    return Object.keys(env)
        .filter(key => env[key] && startsWith(key, keyPrefix))
        .reduce<IConfiguration>(
            (configuration, key) => ({
                ...configuration,
                [key.slice(keyPrefix.length)]: env[key] as string
            }),
            {}
        );
}
