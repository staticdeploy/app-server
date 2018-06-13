import { expect } from "chai";

import removeTrailingSlash from "../../src/utils/removeTrailingSlash";

describe("util removeTrailingSlash", () => {
    it("if the path doesn't end with a slash, does nothing", () => {
        expect(removeTrailingSlash("/path")).to.equal("/path");
    });

    it("if the path ends with a slash, removes it", () => {
        expect(removeTrailingSlash("/path/")).to.equal("/path");
    });
});
