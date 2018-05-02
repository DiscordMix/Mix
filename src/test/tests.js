import Utils from "../core/utils";
import RGB from "../core/rgb";
import RGBA from "../core/rgba";

const { expect } = require("chai");

const subjects = {
	ids: [
		"<@285578743324606482>",
		"<#432269407654248459>",
		"285578743324606482"
	],

	rgb: new RGB(5, 10, 15),
	rgba: new RGBA(5, 10, 15, 20)
};

describe("Utils.resolveId()", () => {
	it("should return the resolved ids", () => {
		// Review
		for (let i = 0; i < subjects.ids.length; i++) {
			const result = Utils.resolveId(subjects.ids[i]);

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

describe("Utils.timeFromNow()", () => {
	it("should time from now in milliseconds", () => {
		const result = Utils.timeFromNow(0, 0, 50);

		expect(result).to.be.an("number");
		expect(result.toString()).to.have.lengthOf(13);
	});
});

describe("Utils.shuffle()", () => {
	it("should shuffle an array", () => {
		const result = Utils.shuffle(["hello", "my", "name", "is", "john doe"]);

		expect(result).to.be.an("array");
		expect(result.join(" ")).to.not.equal("hello my name is john doe");
	});
});

describe("Utils.shuffle()", () => {
	it("should shuffle an array", () => {
		const result = Utils.shuffle(["hello", "my", "name", "is", "john doe"]);

		expect(result).to.be.an("array");
		expect(result.join(" ")).to.not.equal("hello my name is john doe");
	});
});

describe("RGB.toString()", () => {
	it("should return the RGB in string format", () => {
		const result = subjects.rgb.toString();

		expect(result).to.be.an("string");
		expect(result).to.equal("5, 10, 15");
	});
});

describe("RGBA.toString()", () => {
	it("should return the RGBA in string format", () => {
		const result = subjects.rgba.toString();

		expect(result).to.be.an("string");
		expect(result).to.equal("5, 10, 15, 20");
	});
});
