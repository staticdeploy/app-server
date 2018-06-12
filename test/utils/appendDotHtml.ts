import { expect } from "chai";

import appendDotHtml from "../../src/utils/appendDotHtml";

describe("util appendDotHtml", () => {
    it("if the string doesn't end with a slash, appends .html", () => {
        expect(appendDotHtml("/path")).to.equal("/path.html");
    });

    it("if the string ends with a slash, removes the slash and appends .html", () => {
        expect(appendDotHtml("/path/")).to.equal("/path.html");
    });
});
