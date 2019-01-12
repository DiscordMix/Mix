import {expect} from "chai";
import Task from "../tasks/task";
import {testBot} from "./test-bot";

describe("Tasks", () => {
    it("should register tasks", () => {
        const actualTasks: string[] = ["do-nothing"];
        const fakeTasks: string[] = ["doe", "john"];

        // Actual tasks
        for (const actualTask of actualTasks) {
            expect(testBot.tasks.contains(actualTask)).to.be.a("boolean").and.to.equal(true);
        }

        // Fake tasks
        for (const fakeTask of fakeTasks) {
            expect(testBot.tasks.contains(fakeTask)).to.be.a("boolean").and.to.equal(false);
        }

        // Task properties
        const task: Task = testBot.tasks.get("do-nothing") as Task;

        expect(task.meta).to.be.an("object");
        expect(task.meta.name).to.be.a("string");
        expect(task.meta.name).to.equal("do-nothing");
        expect(task.meta.description).to.be.a("string");
        expect(task.meta.description).to.equal("Does absolutely nothing");
        expect(task.maxIterations).to.be.a("number");
        expect(task.maxIterations).to.equal(-1);
        expect(task.lastIteration).to.be.a("number");
        expect(task.lastIteration).to.not.equal(-1);
        expect(task.iterations).to.be.a("number");
        expect(task.iterations).to.equal(1);

        // Other tests
        expect(testBot.tasks.contains(undefined as any)).to.be.a("boolean");
        expect(testBot.tasks.contains(undefined as any)).to.equal(false);

        expect(testBot.tasks.contains(null as any)).to.be.a("boolean");
        expect(testBot.tasks.contains(null as any)).to.equal(false);

        expect(testBot.tasks.contains("" as any)).to.be.a("boolean");
        expect(testBot.tasks.contains("" as any)).to.equal(false);
    });

    it("should trigger tasks", () => {
        const triggerResult: boolean = testBot.tasks.trigger("do-nothing");

        expect(triggerResult).to.be.a("boolean");
        expect(triggerResult).to.equal(true);

        // Other tests
        expect(testBot.tasks.trigger("")).to.be.a("boolean");
        expect(testBot.tasks.trigger("")).to.equal(false);

        expect(testBot.tasks.trigger(undefined as any)).to.be.a("boolean");
        expect(testBot.tasks.trigger(undefined as any)).to.equal(false);

        expect(testBot.tasks.trigger(null as any)).to.be.a("boolean");
        expect(testBot.tasks.trigger(null as any)).to.equal(false);

        expect(testBot.tasks.trigger(1 as any)).to.be.a("boolean");
        expect(testBot.tasks.trigger(1 as any)).to.equal(false);

        expect(testBot.tasks.trigger({} as any)).to.be.a("boolean");
        expect(testBot.tasks.trigger({} as any)).to.equal(false);

        expect(testBot.tasks.trigger([] as any)).to.be.a("boolean");
        expect(testBot.tasks.trigger([] as any)).to.equal(false);
    });

    it("should update tasks after triggering", () => {
        const task: Task = testBot.tasks.get("do-nothing") as Task;

        expect(task).to.be.an("object");
        expect(task.lastIteration).to.be.a("number");
        expect(task.lastIteration).to.not.equal(-1);
        expect(task.iterations).to.be.a("number");
        expect(task.iterations).to.equal(2);
    });
});
