import bunyan from "bunyan";

export default bunyan.createLogger({
    name: "@staticdeploy/app-server",
    streams:
        process.env.NODE_ENV === "test"
            ? []
            : [{ level: "info", stream: process.stdout }]
});
