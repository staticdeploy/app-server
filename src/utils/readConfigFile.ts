import { pathExistsSync } from "fs-extra";

import logger from "../logger";

export default function readConfigFile(configFilePath: string): any {
    // If there is no config file, return an empty config object
    if (!pathExistsSync(configFilePath)) {
        return {};
    }

    // Read and return the config file
    try {
        return require(configFilePath);
    } catch (err) {
        // On error, log the error and exit the process
        logger.error(err, `failed reading config file ${configFilePath}`);
        process.exit(1);
    }
}
