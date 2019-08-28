import { IConfiguration } from "@staticdeploy/core";

export default interface IAppServerConfig {
    root: string;
    fallbackAssetPath: string;
    fallbackStatusCode: number;
    headers: {
        [assetMatcher: string]: {
            [headerName: string]: string;
        };
    };
    basePath: string;
    configuration: IConfiguration;
    port: number;
}
