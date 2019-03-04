import {Unit, Test, Assert, Is} from "unit";
import {TestSubjects} from "../TestBot";

@Unit("Collection")
default class {
    @Test("at(): should return the item located in the specified index")
    public at_returnAtSpecified() {
        Assert.equal(TestSubjects.collection.at(0), "hello");
        Assert.equal(TestSubjects.collection.at(1), "it's me");
    }

    @Test("removeAt(): should remove the item located in the specified index")
    public removeAt_removeAtSpecified() {
        const result1: boolean = TestSubjects.collection.removeAt(0);
        const result2: boolean = TestSubjects.collection.removeAt(5);

        Assert.true(result1);
        Assert.equal(TestSubjects.collection.at(0), "it's me");
        Assert.false(result2);
    }

    @Test("add(): should add an item to the collection")
    public add_addItem() {
        TestSubjects.collection.add("test");

        Assert.equal(TestSubjects.collection.at(0), "it's me");
        Assert.that(TestSubjects.collection.at(1), Is.object);
    }

    @Test("addUnique(): should add an unique item")
    public addUnique_addItem() {
        Assert.true(TestSubjects.collection.addUnique("doe"));
        Assert.false(TestSubjects.collection.addUnique("doe"));
    }

    @Test("contains(): should determine whether the collection contains an item")
    public contains_determineWhetherExists() {
        Assert.true(TestSubjects.collection.contains("doe"));
        Assert.false(TestSubjects.collection.contains("nope"));
    }

    @Test("find(): should find an item by its property")
    public find_findByProp() {
        const result: any = TestSubjects.collection.find("name", "John Doe");

        Assert.that(result, Is.object);
        Assert.equal(result.name, "John Doe");
    }
}
