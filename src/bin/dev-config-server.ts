// tslint:disable:no-console
import cors = require("cors");
import { config } from "dotenv";
import express = require("express");
import yargs = require("yargs");

import getConfigScriptHandler from "../getConfigScriptHandler";

interface IArgv extends yargs.Arguments {
    port: string;
}

const argv = yargs
    .usage("Usage: $0 <options>")
    .option("port", {
        default: "3456",
        describe: "Port to listen on",
        type: "string"
    })
    .strict().argv as IArgv;

try {
    const { port } = argv;
    config();
    express()
        .use(cors({ origin: /.*/, credentials: true }))
        .get("/app-config.js", getConfigScriptHandler())
        .listen(port, () => {
            console.log(`dev-config-server started on port ${port}`);
        });
} catch (err) {
    console.error("Error starting dev-config-server");
    console.error(err);
    process.exit(1);
}
