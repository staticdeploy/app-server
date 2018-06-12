import { expect } from "chai";

import appendIndexDotHtml from "../../src/utils/appendIndexDotHtml";

describe("util appendIndexDotHtml", () => {
    it("if the string doesn't end with a slash, appends /index.html", () => {
        expect(appendIndexDotHtml("/path")).to.equal("/path/index.html");
    });

    it("if the string ends with a slash, appends index.html", () => {
        expect(appendIndexDotHtml("/path/")).to.equal("/path/index.html");
    });
});
