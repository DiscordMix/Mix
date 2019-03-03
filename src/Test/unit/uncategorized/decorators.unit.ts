import {unit, test, Assert, Is} from "unit";
import Command, {CommandRunner, RestrictGroup} from "../../../commands/Command";
import {Message} from "discord.js";
import Permission from "../../../Core/Permission";
import {dependsOn, guard, connect, attachedLoggerFn, attachedLogger} from "../../../Decorators/Other";
import {args, description, name, meta} from "../../../Decorators/General";
import {Constraint} from "../../../Decorators/Constraint";
import {Type} from "../../../commands/Type";
import {deprecated} from "../../../Decorators/Utility";
import DiscordEvent from "../../../Core/DiscordEvent";
import {on} from "../../../Decorators/Events";
import {IMeta} from "../../../Fragments/Fragment";
import {testBot} from "../test-bot";

const testConnection: CommandRunner = (): void => {
    //
};

@name("mycmd")
@description("Used for testing")
@attachedLogger()
@args({
    name: "name",
    type: Type.string
})
@connect(testConnection)
@guard("testGuard")
@dependsOn("service-name-1", "service-name-2")
@Constraint.cooldown(5)
@Constraint.ownerOnly
@Constraint.issuerPermissions(Permission.AddReactions)
@Constraint.selfPermissions(Permission.Admin, Permission.BanMembers)
@Constraint.userGroup(RestrictGroup.ServerModerator)
export class MyCommand extends Command {
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
        // ...
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

const instance: MyCommand = new (MyCommand as any)(null as any);
const metaInstance: MetaTest = new MetaTest();

@unit("Decorators")
default class {
    @test("instance should be an object")
    public instanceBeObj() {
        Assert.that(instance,
            Is.object,
            Is.instanceOf(MyCommand)
        );
    }

    @test("should register commands with helper decorators")
    public registerCommandsWithDecorators() {
        Assert.equal(testBot.registry.contains("test-decorator-command"), true);
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

    @test("@name: should bind command name")
    public name_bind() {
        Assert.equal(instance.meta.name, "mycmd");
    }

    @test("@description: should bind command description")
    public description_bind() {
        Assert.equal(instance.meta.description, "Used for testing");
    }

    @test("@args: should bind command arguments")
    public args_bind() {
        Assert.that(instance.args, Is.arrayWithLength(1));
    }

    @test("@meta: should bind fragment meta")
    public meta_bind() {
        Assert.that(metaInstance.meta, Is.object);
        Assert.equal(Object.keys(metaInstance.meta).length, 4);
        Assert.equal(metaInstance.meta.name, "meta-test");
        Assert.equal(metaInstance.meta.description, "Testing meta");
        Assert.equal(metaInstance.meta.version, "1.0.0");
        Assert.equal(metaInstance.meta.author, "John Doe");
    }

    @test("@ownerOnly: should bind the specific bot owner only constraint")
    public ownerOnly_bind() {
        Assert.equal(instance.constraints.userGroups.includes(RestrictGroup.BotOwner), true);
    }

    @test("@userGroups: should bind specific constraint")
    public userGroups_bind() {
        Assert.equal(instance.constraints.userGroups.includes(RestrictGroup.ServerModerator), true);
    }

    @test("@guard: should bind command guards")
    public guard_bind() {
        Assert.that(instance.guards, Is.arrayWithLength(1));
        Assert.equal(instance.guards[0], instance.testGuard);
    }

    @test("@issuerPermissions: should bind required issuer permissions")
    public issuerPermissions_bind() {
        Assert.that(instance.constraints.issuerPermissions, Is.arrayWithLength(1));
        Assert.equal(instance.constraints.issuerPermissions[0], Permission.AddReactions);
    }

    @test("@selfPermissions: should bind required self permissions")
    public selfPermissions_bind() {
        Assert.that(instance.constraints.selfPermissions, Is.arrayWithLength(2));
        Assert.equal(instance.constraints.selfPermissions[0], Permission.Admin);
        Assert.equal(instance.constraints.selfPermissions[1], Permission.BanMembers);
    }

    @test("@dependsOn: should append command dependencies")
    public dependsOn_bind() {
        Assert.that(instance.dependsOn, Is.arrayWithLength(2));
        Assert.equal(instance.dependsOn[0], "service-name-1");
        Assert.equal(instance.dependsOn[1], "service-name-2");
    }

    @test("@connect: should append command connections")
    public connect_bind() {
        Assert.equal(instance.connections[0], testConnection);
    }

    @test("@attachedLogger: should append the attached logger connection")
    public attachedLogger_bind() {
        Assert.equal(instance.connections[1], attachedLoggerFn);
    }

    @test("@deprecated: should replace input with a proxy method")
    public deprecated_replace() {
        // TODO
    }
}
