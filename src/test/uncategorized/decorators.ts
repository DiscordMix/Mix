import {Unit, Test, Assert, Is, Target} from "unit";
import Command, {CommandRunner, RestrictGroup} from "../../commands/command";
import {Message} from "discord.js";
import Permission from "../../core/permission";
import {dependsOn, guard, connect, attachedLoggerFn, attachedLogger} from "../../decorators/other";
import {args, desc, name, meta} from "../../decorators/general";
import {Constraint} from "../../decorators/constraint";
import {Type} from "../../commands/type";
import {deprecated} from "../../decorators/utility";
import DiscordEvent from "../../core/discordEvent";
import {on} from "../../decorators/events";
import {IMeta} from "../../fragments/fragment";
import {testBot} from "../testBot";

const testConnection: CommandRunner = (): void => {
    //
};

@name("mycmd")
@desc("Used for testing")
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

@Unit("Decorators")
default class {
    @Test("Instance should be an object")
    public instanceBeObj() {
        Assert.that(instance,
            Is.object,
            Is.instanceOf(MyCommand)
        );
    }

    @Test("Should register commands with helper decorators")
    public registerCommandsWithDecorators() {
        Assert.equal(testBot.registry.contains("mycmd"), true);
    }

    @Test("Should have a meta property")
    public haveMeta() {
        Assert.that(instance.meta, Is.object);
        Assert.equal(Object.keys(instance.meta).length, 2);
    }

    @Test("Should have a constraints property")
    public haveConstraints() {
        Assert.that(instance.constraints, Is.object);
        Assert.that(instance.constraints.userGroups, Is.array);
    }

    @Test("Should have a connections property")
    public haveConnections() {
        Assert.that(instance.connections, Is.arrayWithLength(2));
    }

    @Test("Should bind command name")
    @Target(name)
    public name_bind() {
        Assert.equal(instance.meta.name, "mycmd");
    }

    @Test("Should bind command description")
    @Target(desc)
    public description_bind() {
        Assert.equal(instance.meta.description, "Used for testing");
    }

    @Test("Should bind command arguments")
    @Target(args)
    public args_bind() {
        Assert.that(instance.args, Is.arrayWithLength(1));
    }

    @Test("Should bind fragment meta")
    @Target(meta)
    public meta_bind() {
        Assert.that(metaInstance.meta, Is.object);
        Assert.equal(Object.keys(metaInstance.meta).length, 4);
        Assert.equal(metaInstance.meta.name, "meta-test");
        Assert.equal(metaInstance.meta.description, "Testing meta");
        Assert.equal(metaInstance.meta.version, "1.0.0");
        Assert.equal(metaInstance.meta.author, "John Doe");
    }

    @Test("Should bind the specific bot owner only constraint")
    @Target(Constraint.ownerOnly)
    public ownerOnly_bind() {
        Assert.equal(instance.constraints.userGroups.includes(RestrictGroup.BotOwner), true);
    }

    @Test("Should bind specific constraint")
    @Target(Constraint.userGroup)
    public userGroups_bind() {
        Assert.equal(instance.constraints.userGroups.includes(RestrictGroup.ServerModerator), true);
    }

    @Test("@Guard: Should bind command guards")
    @Target(guard)
    public guard_bind() {
        Assert.that(instance.guards, Is.arrayWithLength(1));
        Assert.equal(instance.guards[0], instance.testGuard);
    }

    @Test("Should bind required issuer permissions")
    @Target(Constraint.issuerPermissions)
    public issuerPermissions_bind() {
        Assert.that(instance.constraints.issuerPermissions, Is.arrayWithLength(1));
        Assert.equal(instance.constraints.issuerPermissions[0], Permission.AddReactions);
    }

    @Test("Should bind required self permissions")
    @Target(Constraint.selfPermissions)
    public selfPermissions_bind() {
        Assert.that(instance.constraints.selfPermissions, Is.arrayWithLength(2));
        Assert.equal(instance.constraints.selfPermissions[0], Permission.Admin);
        Assert.equal(instance.constraints.selfPermissions[1], Permission.BanMembers);
    }

    @Test("Should append command dependencies")
    @Target(dependsOn)
    public dependsOn_bind() {
        Assert.that(instance.dependsOn, Is.arrayWithLength(2));
        Assert.equal(instance.dependsOn[0], "service-name-1");
        Assert.equal(instance.dependsOn[1], "service-name-2");
    }

    @Test("Should append command connections")
    @Target(connect)
    public connect_bind() {
        Assert.equal(instance.connections[0], testConnection);
    }

    @Test("Should append the attached logger connection")
    @Target(attachedLogger)
    public attachedLogger_bind() {
        Assert.equal(instance.connections[1], attachedLoggerFn);
    }

    @Test("Should replace input with a proxy method")
    @Target(deprecated)
    public deprecated_replace() {
        // TODO
    }
}
