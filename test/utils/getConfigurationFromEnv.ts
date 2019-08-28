import { expect } from "chai";

import getConfigurationFromEnv from "../../src/utils/getConfigurationFromEnv";

describe("util getConfigurationFromEnv", () => {
    it("extracts non-empty configuration values from the env object", () => {
        const configuration = getConfigurationFromEnv(
            {
                APP_CONFIG_UNDEFINED: undefined,
                APP_CONFIG_EMPTY_STRING: "",
                APP_CONFIG_KEY_1: "value_1",
                APP_CONFIG_KEY_2: "value_2"
            },
            "APP_CONFIG_"
        );
        expect(configuration).to.deep.equal({
            KEY_1: "value_1",
            KEY_2: "value_2"
        });
    });
});
