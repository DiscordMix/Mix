import {unit, test, Assert, Is, target} from "unit";
import {TestSubjects} from "../TestBot";
import List from "../../Collections/List";

@unit("Collection")
default class {
    @test("should return the item located in the specified index")
    @target(List.prototype.at)
    public at_returnAtSpecified() {
        Assert.equal(TestSubjects.collection.at(0), "hello");
        Assert.equal(TestSubjects.collection.at(1), "it's me");
    }

    @test("should remove the item located in the specified index")
    @target(List.prototype.removeAt)
    public removeAt_removeAtSpecified() {
        const result1: boolean = TestSubjects.collection.removeAt(0);
        const result2: boolean = TestSubjects.collection.removeAt(5);

        Assert.true(result1);
        Assert.equal(TestSubjects.collection.at(0), "it's me");
        Assert.false(result2);
    }

    @test("should add an item to the collection")
    @target(List.prototype.add)
    public add_addItem() {
        TestSubjects.collection.add("test");

        Assert.equal(TestSubjects.collection.at(0), "it's me");
        Assert.that(TestSubjects.collection.at(1), Is.object);
    }

    @test("should add an unique item")
    @target(List.prototype.addUnique)
    public addUnique_addItem() {
        Assert.true(TestSubjects.collection.addUnique("doe"));
        Assert.false(TestSubjects.collection.addUnique("doe"));
    }

    @test("should determine whether the collection contains an item")
    @target(List.prototype.contains)
    public contains_determineWhetherExists() {
        Assert.true(TestSubjects.collection.contains("doe"));
        Assert.false(TestSubjects.collection.contains("nope"));
    }

    @test("should find an item by its property")
    @target(List.prototype.find)
    public find_findByProp() {
        const result: any = TestSubjects.collection.find("name", "John Doe");

        Assert.that(result, Is.object);
        Assert.equal(result.name, "John Doe");
    }
}
