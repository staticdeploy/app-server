import { load } from "cheerio";
import getDebug = require("debug");
import { readFileSync } from "fs";
import { join } from "path";

const debug = getDebug("app-server:config");

export interface IEnv {
    [key: string]: string | undefined;
}

export function generateConfigScript(env: IEnv): string {
    const prefixRegexp = /^APP_CONFIG_/;
    const config = Object.keys(env)
        .filter(key => prefixRegexp.test(key))
        .reduce<IEnv>(
            (c, key) => ({
                ...c,
                [key.replace(prefixRegexp, "")]: env[key]
            }),
            {}
        );
    return `window.APP_CONFIG=${JSON.stringify(config)};`;
}

export function getConfiguredIndex(
    root: string,
    index: string,
    selector: string,
    env: IEnv
) {
    const indexPath = join(root, index);
    const configScript = generateConfigScript(env);
    debug("Generated config script:");
    debug(configScript);
    const originalHtml = readFileSync(indexPath, "utf8");
    debug("Loaded target html:");
    debug(originalHtml);
    const $ = load(originalHtml);
    $(selector)
        .removeAttr("src")
        .html(configScript);
    const html = $.html();
    debug("Injected config script in html:");
    debug(html);
    return Buffer.from(html);
}
