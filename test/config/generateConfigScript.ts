import { expect } from "chai";
import { VM } from "vm2";

import { generateConfigScript } from "../../src/config";

describe("config.generateConfigScript", () => {
    const env = {
        APP_CONFIG_SIMPLE: "VALUE",
        APP_CONFIG_0_KEY_STARTS_WITH_NUMBER: "VALUE",
        "APP_CONFIG_STRANGE_CHARS_IN_KEY_\\/": "VALUE",
        APP_CONFIG_STRANGE_CHARS_IN_VALUE: '"\\\n\t'
    };
    const script = generateConfigScript(env);
    describe("generates a script that", () => {
        it("is valid, non-throwing javascript", () => {
            const vm = new VM({ sandbox: { window: {} } });
            vm.run(script);
        });

        it("defines global variable window.APP_CONFIG", () => {
            const vm = new VM({ sandbox: { window: {} } });
            vm.run(script);
            const APP_CONFIG = vm.run("window.APP_CONFIG");
            expect(APP_CONFIG).not.to.equal(undefined);
        });

        it("defines window.APP_CONFIG form the passed-in object", () => {
            const vm = new VM({ sandbox: { window: {} } });
            vm.run(script);
            const APP_CONFIG = vm.run("window.APP_CONFIG");
            expect(APP_CONFIG).to.deep.equal({
                SIMPLE: "VALUE",
                "0_KEY_STARTS_WITH_NUMBER": "VALUE",
                "STRANGE_CHARS_IN_KEY_\\/": "VALUE",
                STRANGE_CHARS_IN_VALUE: '"\\\n\t'
            });
        });
    });
});
