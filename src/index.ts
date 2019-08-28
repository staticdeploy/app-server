import getAppServerConfig from "./getAppServerConfig";
import getExpressApp from "./getExpressApp";
import logger from "./logger";

// Create and start the server
(async () => {
    try {
        const config = getAppServerConfig(process.argv, process.env);
        const app = await getExpressApp(config);
        app.listen(config.port, () => {
            logger.info(`app-server started on port ${config.port}`);
        });
    } catch (err) {
        logger.error(err, "Error starting app-server");
        process.exit(1);
    }
})();
