import {Unit, Test, Assert, Is, Does} from "unit";
import Command, {CommandRunner, RestrictGroup} from "../../../commands/command";
import {Message} from "discord.js";
import Permission from "../../../core/permission";
import {DependsOn, Guard, Connect, AttachedLogger} from "../../../decorators/other";
import {Arguments, Description, Name, Meta} from "../../../decorators/general";
import {Constraint} from "../../../decorators/constraints";
import {Type} from "../../../commands/type";
import {Deprecated} from "../../../decorators/utility";
import DiscordEvent from "../../../core/discord-event";
import {On} from "../../../decorators/events";
import {IMeta} from "../../../fragments/fragment";
import {testBot} from "../test-bot";

const testConnection: CommandRunner = (x, args): void => {
    //
};

@Name("mycmd")
@Description("Used for testing")
@AttachedLogger()
@Arguments(
    {
        name: "name",
        type: Type.string
    }
)
@Connect(testConnection)
@Guard("testGuard")
@DependsOn("service-name-1", "service-name-2")
@Constraint.Cooldown(5)
@Constraint.OwnerOnly
@Constraint.IssuerPermissions(Permission.AddReactions)
@Constraint.SelfPermissions(Permission.Admin, Permission.BanMembers)
@Constraint.Specific([RestrictGroup.ServerModerator])
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
        Assert.that(instance.constraints.specific, Is.array);
    }

    @Test("should have a connections property")
    public haveConnections() {
        Assert.that(instance.connections, Is.arrayWithLength(2));
    }

    @Test("@Name: should bind command name")
    public name_bind() {
        Assert.equal(instance.meta.name, "mycmd");
    }

    @Test("@Description: should bind command description")
    public description_bind() {
        Assert.equal(instance.meta.description, "Used for testing");
    }

    @Test("@Arguments: should bind command arguments")
    public arguments_bind() {
        Assert.that(instance.args, Is.arrayWithLength(1));
    }

    @Test("@Meta: should bind fragment meta")
    public meta_bind() {
        Assert.that(metaInstance.meta, Is.object);
        Assert.equal(Object.keys(metaInstance.meta).length, 4);
        Assert.equal(metaInstance.meta.name, "meta-test");
        Assert.equal(metaInstance.meta.description, "Testing meta");
        Assert.equal(metaInstance.meta.version, "1.0.0");
        Assert.equal(metaInstance.meta.author, "John Doe");
    }
}
