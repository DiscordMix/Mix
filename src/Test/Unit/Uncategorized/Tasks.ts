import {Unit, Test, Assert, Is} from "unit";
import {testBot} from "../TestBot";
import Task from "../../../Tasks/Task";

@Unit("Tasks")
default class {
    @Test("should contain registered tasks")
    public containRegistered() {
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
        const task: Task = testBot.tasks.forceGet("do-nothing");
        const now: number = Date.now();

        Assert.that(task.meta, Is.object);
        Assert.equal(task.meta.name, "do-nothing");
        Assert.equal(task.meta.description, "Does absolutely nothing");
        Assert.equal(task.maxIterations, -1);
        Assert.true(task.lastIteration !== -1);
        Assert.that(task.lastIteration, Is.lessOrEqual(now));
        Assert.equal(task.iterations, 1);

        // Other tests.
        Assert.false(testBot.tasks.contains(undefined as any));
        Assert.false(testBot.tasks.contains(null as any));
        Assert.false(testBot.tasks.contains("" as any));
    }

    @Test("should trigger tasks")
    public async trigger() {
        const triggerResult: boolean = await testBot.tasks.trigger("do-nothing");

        Assert.true(triggerResult);

        // Other tests.
        Assert.false(await testBot.tasks.trigger(""));
        Assert.false(await testBot.tasks.trigger(undefined as any));
        Assert.false(await testBot.tasks.trigger(null as any));
        Assert.false(await testBot.tasks.trigger(1 as any));
        Assert.false(await testBot.tasks.trigger({} as any));
        Assert.false(await testBot.tasks.trigger([] as any));
    }

    @Test("should update tasks after triggering")
    public updateAfterTrigger() {
        const task: Task = testBot.tasks.get("do-nothing") as Task;
        const now: number = Date.now();

        Assert.that(task, Is.object);
        Assert.true(task.lastIteration !== -1);
        Assert.that(task.lastIteration, Is.lessOrEqual(now));
        Assert.equal(task.iterations, 2);
    }
}
