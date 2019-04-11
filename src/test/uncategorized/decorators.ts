import {unit, test, Assert, Is, target} from "unit";
import Command, {CommandRunner, RestrictGroup} from "../../commands/command";
import {Message} from "discord.js";
import Permission from "../../core/permission";
import {dependsOn, guard, connect, attachedLoggerFn, attachedLogger} from "../../decorators/other";
import {args, desc, name, meta} from "../../decorators/general";
import {Constraint} from "../../decorators/constraint";
import {type} from "../../commands/type";
import {deprecated} from "../../decorators/utility";
import DiscordEvent from "../../core/discordEvent";
import {on} from "../../decorators/events";
import {IMeta} from "../../fragments/fragment";
import {testBot} from "../testBot";

const testConnection: CommandRunner = (): void => {
    //
};

const testCommandMeta: IMeta = {
    name: "testCommand",
    description: "Dummy command for testing"
};

@name(testCommandMeta.name)
@desc(testCommandMeta.description!)
@attachedLogger()
@args({
    name: "name",
    type: type.string
})
@connect(testConnection)
@guard("testGuard")
@dependsOn("service-name-1", "service-name-2")
@Constraint.cooldown(5)
@Constraint.ownerOnly
@Constraint.issuerPermissions(Permission.AddReactions)
@Constraint.selfPermissions(Permission.Admin, Permission.BanMembers)
@Constraint.userGroup(RestrictGroup.ServerModerator)
class TestCommand extends Command {
    @deprecated()
    public testGuard(): boolean {
        //

        return false;
    }

    @on(DiscordEvent.Message)
    public onMessage(msg: Message): void {
        //
    }

    public run(): void {
        //
    }
}

@meta({
    name: "meta-test",
    description: "Testing meta",
    author: "John Doe",
    version: "1.0.0"
})
class MetaTest {
    public readonly meta!: IMeta;
}

const instance: TestCommand = new (TestCommand as any)(null as any);
const metaInstance: MetaTest = new MetaTest();

@unit("Decorators")
default class {
    @test("instance should be an object")
    public instanceBeObj() {
        Assert.that(instance,
            Is.object,
            Is.instanceOf(TestCommand)
        );
    }

    @test("should have a meta property")
    public haveMeta() {
        Assert.that(instance.meta, Is.object);
        Assert.equal(Object.keys(instance.meta).length, 2);
    }

    @test("should have a constraints property")
    public haveConstraints() {
        Assert.that(instance.constraints, Is.object);
        Assert.that(instance.constraints.userGroups, Is.array);
    }

    @test("should have a connections property")
    public haveConnections() {
        Assert.that(instance.connections, Is.arrayWithLength(2));
    }

    @test("should bind command name")
    @target(name)
    public name_bind() {
        Assert.equal(instance.meta.name, testCommandMeta.name);
    }

    @test("should bind command description")
    @target(desc)
    public description_bind() {
        Assert.equal(instance.meta.description, testCommandMeta.description);
    }

    @test("should bind command arguments")
    @target(args)
    public args_bind() {
        Assert.that(instance.args, Is.arrayWithLength(1));
    }

    @test("should bind fragment meta")
    @target(meta)
    public meta_bind() {
        Assert.that(metaInstance.meta, Is.object);
        Assert.equal(Object.keys(metaInstance.meta).length, 4);
        Assert.equal(metaInstance.meta.name, "meta-test");
        Assert.equal(metaInstance.meta.description, "Testing meta");
        Assert.equal(metaInstance.meta.version, "1.0.0");
        Assert.equal(metaInstance.meta.author, "John Doe");
    }

    @test("should bind the specific bot owner only constraint")
    @target(Constraint.ownerOnly)
    public ownerOnly_bind() {
        Assert.equal(instance.constraints.userGroups.includes(RestrictGroup.BotOwner), true);
    }

    @test("should bind specific constraint")
    @target(Constraint.userGroup)
    public userGroups_bind() {
        Assert.equal(instance.constraints.userGroups.includes(RestrictGroup.ServerModerator), true);
    }

    @test("should bind command guards")
    @target(guard)
    public guard_bind() {
        Assert.that(instance.guards, Is.arrayWithLength(1));
        Assert.equal(instance.guards[0], instance.testGuard);
    }

    @test("should bind required issuer permissions")
    @target(Constraint.issuerPermissions)
    public issuerPermissions_bind() {
        Assert.that(instance.constraints.issuerPermissions, Is.arrayWithLength(1));
        Assert.equal(instance.constraints.issuerPermissions[0], Permission.AddReactions);
    }

    @test("should bind required self permissions")
    @target(Constraint.selfPermissions)
    public selfPermissions_bind() {
        Assert.that(instance.constraints.selfPermissions, Is.arrayWithLength(2));
        Assert.equal(instance.constraints.selfPermissions[0], Permission.Admin);
        Assert.equal(instance.constraints.selfPermissions[1], Permission.BanMembers);
    }

    @test("should append command dependencies")
    @target(dependsOn)
    public dependsOn_bind() {
        Assert.that(instance.dependsOn, Is.arrayWithLength(2));
        Assert.equal(instance.dependsOn[0], "service-name-1");
        Assert.equal(instance.dependsOn[1], "service-name-2");
    }

    @test("should append command connections")
    @target(connect)
    public connect_bind() {
        Assert.equal(instance.connections[0], testConnection);
    }

    @test("should append the attached logger connection")
    @target(attachedLogger)
    public attachedLogger_bind() {
        Assert.equal(instance.connections[1], attachedLoggerFn);
    }

    @test("should register commands with helper decorators")
    public registerCommandsWithDecorators() {
        Assert.equal(testBot.registry.contains("test-decorator-command"), true);
    }

    @test("should replace input with a proxy method")
    @target(deprecated)
    public deprecated_replace() {
        // TODO
    }
}
