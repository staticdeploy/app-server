import { expect } from "chai";

import toAbsolute from "../../src/utils/toAbsolute";

describe("util toAbsolute", () => {
    it("makes a non absolute path absolute", () => {
        expect(toAbsolute("path/")).to.equal("/path/");
    });

    it("doesn't change an absolute path", () => {
        expect(toAbsolute("/path/")).to.equal("/path/");
    });
});
