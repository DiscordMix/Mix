import Utils from "../core/utils";
import RGB from "../core/rgb";
import RGBA from "../core/rgba";
import Collection from "../collections/collection";
import ObjectAdapter from "../data-adapters/object-adapter";
import Schema from "../schema/schema";

const { expect } = require("chai");

const subjects = {
	ids: [
		"<@285578743324606482>",
		"<#432269407654248459>",
		"285578743324606482"
	],

	rgb: new RGB(5, 10, 15),
	rgba: new RGBA(5, 10, 15, 20),

	collection: new Collection(["hello", "it's me", {
		name: "John Doe"
	}]),

	objAdapter: new ObjectAdapter({
		person: {
			doe: {
				name: "John Doe"
			}
		}
	}),

	schema: {
		struct: {
			name: "John Doe",
			age: 69,
			other: {
				notes: "I liek turtles"
			}
		},

		schema: {
			name: "string",
			age: "number",
			"other.notes": "string",
			"other.about": "?string"
		}
	}
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

describe("Collection.at()", () => {
	it("should return the item located in the specified index", () => {
		const result1 = subjects.collection.at(0);
		const result2 = subjects.collection.at(1);

		// Result 1
		expect(result1).to.be.an("string");
		expect(result1).to.equal("hello");

		// Result 2
		expect(result2).to.be.an("string");
		expect(result2).to.equal("it's me");
	});
});

describe("Collection.removeAt()", () => {
	it("should remove the item located in the specified index", () => {
		const result1 = subjects.collection.removeAt(0);
		const result2 = subjects.collection.removeAt(5);

		// Result 1
		expect(result1).to.be.an("boolean");
		expect(result1).to.equal(true);
		expect(subjects.collection.at(0)).to.be.an("string");
		expect(subjects.collection.at(0)).to.equal("it's me");

		// Result 2
		expect(result2).to.be.an("boolean");
		expect(result2).to.equal(false);
	});
});

describe("Collection.add()", () => {
	it("should add an item to the collection", () => {
		subjects.collection.add("john doe");
		expect(subjects.collection.at(0)).to.be.an("string");
		expect(subjects.collection.at(0)).to.equal("it's me");
		expect(subjects.collection.at(1)).to.be.an("object");
	});
});

describe("Collection.addUnique()", () => {
	it("should add an unique item", () => {
		const result1 = subjects.collection.addUnique("doe");
		const result2 = subjects.collection.addUnique("doe");

		// Result 1
		expect(result1).to.be.an("boolean");
		expect(result1).to.equal(true);

		// Result 2
		expect(result2).to.be.an("boolean");
		expect(result2).to.equal(false);
	});
});

describe("Collection.contains()", () => {
	it("should determine whether the collection contains an item", () => {
		const result1 = subjects.collection.contains("john doe");
		const result2 = subjects.collection.contains("nope");

		// Result 1
		expect(result1).to.be.an("boolean");
		expect(result1).to.equal(true);

		// Result 2
		expect(result2).to.be.an("boolean");
		expect(result2).to.equal(false);
	});
});

describe("Collection.find()", () => {
	it("should find an item by its property", () => {
		const result = subjects.collection.find("name", "John Doe");

		expect(result).to.be.an("object");
		expect(result.name).to.be.an("string");
		expect(result.name).to.equal("John Doe");
	});
});

describe("ObjectAdapter.get()", () => {
	it("should return the item in the specified path", () => {
		const result = subjects.objAdapter.get("person.doe");

		expect(result).to.be.an("object");
		expect(result.name).to.be.an("string");
		expect(result.name).to.equal("John Doe");
	});
});

describe("ObjectAdapter.set()", () => {
	it("should set data in the item at the specified path", () => {
		subjects.objAdapter.set("person.doe.name", "Doe John");

		const result = subjects.objAdapter.get("person.doe.name");

		expect(result).to.be.an("string");
		expect(result).to.equal("Doe John");
	});
});

describe("Schema.validate()", () => {
	it("should determine whether a structure is valid", () => {
		const result1 = Schema.validate(subjects.schema.struct, subjects.schema.schema);

		subjects.schema.struct.age = "hai";

		const result2 = Schema.validate(subjects.schema.struct, subjects.schema.schema);

		// Result 1
		expect(result1).to.be.an("boolean");
		expect(result1).to.equal(true);

		// Result 2
		expect(result2).to.be.an("boolean");
		expect(result2).to.equal(false);
	});
});
