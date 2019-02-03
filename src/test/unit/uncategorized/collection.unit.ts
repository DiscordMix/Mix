import {Unit, Test, Assert, Is} from "unit";
import {TestSubjects} from "../test-bot";

@Unit("Collection")
default class {
    @Test("should return the item located in the specified index")
    public at() {
        Assert.equal(TestSubjects.collection.at(0), "hello");
        Assert.equal(TestSubjects.collection.at(1), "it's me");
    }

    @Test("should remove the item located in the specified index")
    public removeAt() {
        const result1: boolean = TestSubjects.collection.removeAt(0);
        const result2: boolean = TestSubjects.collection.removeAt(5);

        Assert.true(result1);
        Assert.equal(TestSubjects.collection.at(0), "it's me");
        Assert.false(result2);
    }

    @Test("should add an item to the collection")
    public add() {
        TestSubjects.collection.add("test");

        Assert.equal(TestSubjects.collection.at(0), "it's me");
        Assert.that(TestSubjects.collection.at(1), Is.object);
    }

    @Test("should add an unique item")
    public addUnique() {
        Assert.true(TestSubjects.collection.addUnique("doe"));
        Assert.false(TestSubjects.collection.addUnique("doe"));
    }

    @Test("should determine whether the collection contains an item")
    public contains() {
        Assert.true(TestSubjects.collection.contains("doe"));
        Assert.false(TestSubjects.collection.contains("nope"));
    }

    @Test("should find an item by its property")
    public find() {
        const result: any = TestSubjects.collection.find("name", "John Doe");

        Assert.that(result, Is.object);
        Assert.equal(result.name, "John Doe");
    }
}
