import { RequestHandler } from "express";

import { generateConfigScript, IEnv } from "./config";

export default function getConfigScriptHandler(
    env: IEnv = process.env
): RequestHandler {
    const script = generateConfigScript(env);
    return (_req, res) =>
        res
            .type("js")
            .status(200)
            .send(script);
}
