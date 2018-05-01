import Utils from "../core/utils";

const { expect } = require("chai");

describe("Utils.resolveId()", () => {
	it("should return the resolved ids", () => {
		const subjects = [
			"<@285578743324606482>",
			"<#432269407654248459>",
			"285578743324606482"
		];

		// Review
		for (let i = 0; i < subjects.length; i++) {
			const result = Utils.resolveId(subjects[i]);

			expect(result).to.be.an("string");
			expect(result).to.have.lengthOf(18);
		}
	});
});

describe("Utils.timeAgo()", () => {
	it("should return a string", () => {
		expect(Utils.timeAgo(Date.now())).to.be.an("string");
	});
});

describe("Utils.getRandomInt()", () => {
	it("should return a random number", () => {
		const result = Utils.getRandomInt(0, 2);

		expect(result).to.be.an("number");
		// TODO: Check to be the number either 0 or 1
	});
});

describe("Utils.translateState()", () => {
	it("should return the translated state", () => {
		const subjects = [
			true,
			1,
			"y",
			"yes",
			"on"
		];

		for (let i = 0; i < subjects.length; i++) {
			const result = Utils.translateState(subjects[i]);

			expect(result).to.be.an("boolean");
			expect(result).to.be.equal(true);
		}
	});
});
