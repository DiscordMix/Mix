import {Unit, Test, Assert, Is} from "unit";
import {testBot} from "../test-bot";
import Task from "../../tasks/task";

@Unit("Tasks")
default class {
    @Test("should register tasks")
    public register() {
        const actualTasks: string[] = ["do-nothing"];
        const fakeTasks: string[] = ["doe", "john"];

        // Actual tasks.
        for (const actualTask of actualTasks) {
            Assert.true(testBot.tasks.contains(actualTask));
        }

        // Fake tasks.
        for (const fakeTask of fakeTasks) {
            Assert.false(testBot.tasks.contains(fakeTask));
        }

        // Task properties.
        const task: Task = testBot.tasks.get("do-nothing") as Task;

        Assert.that(task.meta, Is.object);
        Assert.equal(task.meta.name, "do-nothing");
        Assert.equal(task.meta.description, "Does absolutely nothing");
        Assert.equal(task.maxIterations, -1);
        Assert.equal(task.lastIteration, -1);
        Assert.equal(task.iterations, 1);

        // Other tests.
        Assert.false(testBot.tasks.contains(undefined as any));
        Assert.false(testBot.tasks.contains(null as any));
        Assert.false(testBot.tasks.contains("" as any));
    }

    @Test("should trigger tasks")
    public trigger() {
        const triggerResult: boolean = testBot.tasks.trigger("do-nothing");

        Assert.true(triggerResult);

        // Other tests.
        Assert.false(testBot.tasks.trigger(""));
        Assert.false(testBot.tasks.trigger(undefined as any));
        Assert.false(testBot.tasks.trigger(null as any));
        Assert.false(testBot.tasks.trigger(1 as any));
        Assert.false(testBot.tasks.trigger({} as any));
        Assert.false(testBot.tasks.trigger([] as any));
    }

    @Test("should update tasks after triggering")
    public updateAfterTrigger() {
        const task: Task = testBot.tasks.get("do-nothing") as Task;

        Assert.that(task, Is.object);
        Assert.equal(task.lastIteration, -1);
        Assert.equal(task.iterations, 2);
    }
}
