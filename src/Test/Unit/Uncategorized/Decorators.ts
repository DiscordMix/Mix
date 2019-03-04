import {Unit, Test, Assert, Is} from "unit";
import Command, {CommandRunner, RestrictGroup} from "../../../Commands/Command";
import {Message} from "discord.js";
import Permission from "../../../Core/Permission";
import {DependsOn, Guard, Connect, AttachedLoggerFn, AttachedLogger} from "../../../Decorators/Other";
import {Args, Description, Name, Meta} from "../../../Decorators/General";
import {Constraint} from "../../../Decorators/Constraint";
import {Type} from "../../../Commands/Type";
import {Deprecated} from "../../../Decorators/Utility";
import DiscordEvent from "../../../Core/DiscordEvent";
import {On} from "../../../Decorators/Events";
import {IMeta} from "../../../Fragments/Fragment";
import {testBot} from "../TestBot";

const testConnection: CommandRunner = (): void => {
    //
};

@Name("mycmd")
@Description("Used for testing")
@AttachedLogger()
@Args({
    name: "name",
    type: Type.string
})
@Connect(testConnection)
@Guard("testGuard")
@DependsOn("service-name-1", "service-name-2")
@Constraint.cooldown(5)
@Constraint.ownerOnly
@Constraint.issuerPermissions(Permission.AddReactions)
@Constraint.selfPermissions(Permission.Admin, Permission.BanMembers)
@Constraint.userGroup(RestrictGroup.ServerModerator)
export class MyCommand extends Command {
    @Deprecated()
    public testGuard(): boolean {
        //

        return false;
    }

    @On(DiscordEvent.Message)
    public onMessage(msg: Message): void {
        //
    }

    public run(): void {
        // ...
    }
}

@Meta({
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
    @Test("instance should be an object")
    public instanceBeObj() {
        Assert.that(instance,
            Is.object,
            Is.instanceOf(MyCommand)
        );
    }

    @Test("should register commands with helper decorators")
    public registerCommandsWithDecorators() {
        Assert.equal(testBot.registry.contains("test-decorator-command"), true);
    }

    @Test("should have a meta property")
    public haveMeta() {
        Assert.that(instance.meta, Is.object);
        Assert.equal(Object.keys(instance.meta).length, 2);
    }

    @Test("should have a constraints property")
    public haveConstraints() {
        Assert.that(instance.constraints, Is.object);
        Assert.that(instance.constraints.userGroups, Is.array);
    }

    @Test("should have a connections property")
    public haveConnections() {
        Assert.that(instance.connections, Is.arrayWithLength(2));
    }

    @Test("@name: should bind command name")
    public name_bind() {
        Assert.equal(instance.meta.name, "mycmd");
    }

    @Test("@description: should bind command description")
    public description_bind() {
        Assert.equal(instance.meta.description, "Used for testing");
    }

    @Test("@args: should bind command arguments")
    public args_bind() {
        Assert.that(instance.args, Is.arrayWithLength(1));
    }

    @Test("@meta: should bind fragment meta")
    public meta_bind() {
        Assert.that(metaInstance.meta, Is.object);
        Assert.equal(Object.keys(metaInstance.meta).length, 4);
        Assert.equal(metaInstance.meta.name, "meta-test");
        Assert.equal(metaInstance.meta.description, "Testing meta");
        Assert.equal(metaInstance.meta.version, "1.0.0");
        Assert.equal(metaInstance.meta.author, "John Doe");
    }

    @Test("@ownerOnly: should bind the specific bot owner only constraint")
    public ownerOnly_bind() {
        Assert.equal(instance.constraints.userGroups.includes(RestrictGroup.BotOwner), true);
    }

    @Test("@userGroups: should bind specific constraint")
    public userGroups_bind() {
        Assert.equal(instance.constraints.userGroups.includes(RestrictGroup.ServerModerator), true);
    }

    @Test("@guard: should bind command guards")
    public guard_bind() {
        Assert.that(instance.guards, Is.arrayWithLength(1));
        Assert.equal(instance.guards[0], instance.testGuard);
    }

    @Test("@issuerPermissions: should bind required issuer permissions")
    public issuerPermissions_bind() {
        Assert.that(instance.constraints.issuerPermissions, Is.arrayWithLength(1));
        Assert.equal(instance.constraints.issuerPermissions[0], Permission.AddReactions);
    }

    @Test("@selfPermissions: should bind required self permissions")
    public selfPermissions_bind() {
        Assert.that(instance.constraints.selfPermissions, Is.arrayWithLength(2));
        Assert.equal(instance.constraints.selfPermissions[0], Permission.Admin);
        Assert.equal(instance.constraints.selfPermissions[1], Permission.BanMembers);
    }

    @Test("@dependsOn: should append command dependencies")
    public dependsOn_bind() {
        Assert.that(instance.dependsOn, Is.arrayWithLength(2));
        Assert.equal(instance.dependsOn[0], "service-name-1");
        Assert.equal(instance.dependsOn[1], "service-name-2");
    }

    @Test("@connect: should append command connections")
    public connect_bind() {
        Assert.equal(instance.connections[0], testConnection);
    }

    @Test("@attachedLogger: should append the attached logger connection")
    public attachedLogger_bind() {
        Assert.equal(instance.connections[1], AttachedLoggerFn);
    }

    @Test("@deprecated: should replace input with a proxy method")
    public deprecated_replace() {
        // TODO
    }
}
