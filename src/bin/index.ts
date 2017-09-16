// tslint:disable:no-console
// tslint:disable:no-var-requires
import express = require("express");
import morgan = require("morgan");
import { join } from "path";
import yargs = require("yargs");

import getRouter from "../getRouter";

interface IArgv extends yargs.Arguments {
    root: string;
    index: string;
    selector: string;
    baseUrl: string;
    port: string;
}

const argv = yargs
    .usage("Usage: $0 <options>")
    .version(require("../../package").version)
    .help("h")
    .alias("h", "help")
    .env("APP_SERVER")
    .option("root", {
        default: "build",
        describe: "Root diretory to serve",
        type: "string"
    })
    .option("index", {
        coerce: index => join("/", index),
        default: "index.html",
        describe: "Index file",
        type: "string"
    })
    .option("selector", {
        default: "script#app-config",
        describe: "Selector for the script element to inject config into",
        type: "string"
    })
    .option("baseUrl", {
        default: "/",
        describe: "Website base url",
        type: "string"
    })
    .option("port", {
        default: "3000",
        describe: "Port to listen on",
        type: "string"
    })
    .strict().argv as IArgv;

try {
    const { root, index, selector, baseUrl, port } = argv;
    express()
        .use(morgan("common"))
        .use(baseUrl, getRouter(root, index, selector, process.env))
        .listen(port, () => {
            console.log(`Server started on port ${port}`);
        });
} catch (err) {
    console.error("Error starting the server");
    console.error(err);
    process.exit(1);
}
