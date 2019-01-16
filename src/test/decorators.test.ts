import Command, {CommandRunner, Type, RestrictGroup} from "../commands/command";
import {Name, Arguments, Description, Meta} from "../decorators/general";
import {AttachedLogger, Guard, Connect, DependsOn, attachedLogger, OnEvent} from "../decorators/other";
import {expect} from "chai";
import {testBot} from "./test-bot";
import {Deprecated} from "../decorators/utility";
import {Constraint} from "../decorators/constraints";
import Permission from "../core/permission";
import {Message} from "discord.js";
import DiscordEvent from "../core/discord-event";
import {IFragmentMeta} from "..";

const testConnection: CommandRunner = (x, args): void => {
    //
};

@Name("mycmd")
@Description("Used for testing")
@AttachedLogger()
@Arguments(
    {
        name: "name",
        type: Type.String
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

    @OnEvent(DiscordEvent.Message)
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
    readonly meta!: IFragmentMeta;
}

const instance: MyCommand = new (MyCommand as any)(null as any);
const metaInstance: MetaTest = new MetaTest();

describe("Decorators", () => {
    it("instance should be an object", () => {
        expect(typeof instance === "object").to.be.a("boolean").and.to.equal(true);
        expect(instance instanceof MyCommand).to.be.a("boolean").and.to.equal(true);
    });

    it("should register commands with helper decorators", () => {
        expect(testBot.commandStore.contains("test-decorator-command")).to.be.a("boolean").and.to.equal(true);
    });

    it("should have a meta property", () => {
        expect(instance.meta).to.be.an("object");
        expect(Object.keys(instance.meta).length).to.be.a("number").and.to.equal(2);
    });

    it("should have a constraints property", () => {
        expect(instance.constraints).to.be.an("object");
        expect(instance.constraints.specific).to.be.an("array");
    });

    it("should have a connections property", () => {
        expect(instance.connections).to.be.a("array").and.to.have.length(2);
    });

    describe("General", () => {
        describe("Name", () => {
            it("should bind command name", () => {
                expect(instance.meta.name).to.be.a("string").and.to.equal("mycmd");
            });
        });

        describe("Description", () => {
            it("should bind command description", () => {
                expect(instance.meta.description).to.be.a("string").and.to.equal("Used for testing");
            });
        });

        describe("Arguments", () => {
            it("should bind command arguments", () => {
                expect(instance.args).to.be.a("array").and.to.have.length(1);
            });
        });

        describe("Meta", () => {
            it("should bind fragment meta", () => {
                expect(metaInstance.meta).to.be.an("object");
                expect(Object.keys(metaInstance.meta).length).to.be.a("number").and.to.equal(4);
                expect(metaInstance.meta.name).to.be.a("string").and.to.equal("meta-test");
                expect(metaInstance.meta.description).to.be.a("string").and.to.equal("Testing meta");
                expect(metaInstance.meta.version).to.be.a("string").and.to.equal("1.0.0");
                expect(metaInstance.meta.author).to.be.a("string").and.to.equal("John Doe");
            });
        });
    });

    describe("Commands -> Constraints", () => {
        describe("OwnerOnly", () => {
            it("should bind the specific bot owner only constraint", () => {
                expect(instance.constraints.specific.includes(RestrictGroup.BotOwner)).to.be.a("boolean").and.to.equal(true);
            });
        });

        describe("Specific", () => {
            it("should bind specific constraint", () => {
                expect(instance.constraints.specific.includes(RestrictGroup.ServerModerator)).to.be.a("boolean").and.to.equal(true);
            });
        });

        describe("Guard", () => {
            it("should bind command guards", () => {
                expect(instance.guards).to.be.a("array").and.to.have.length(1);
                expect(instance.guards[0]).to.be.a("function").and.to.equal(instance.testGuard);
            });
        });

        describe("IssuerPermissions", () => {
            it("should bind required issuer permissions", () => {
                expect(instance.constraints.issuerPermissions).to.be.a("array").and.to.have.length(1);
                expect(instance.constraints.issuerPermissions[0]).to.be.an("object").and.to.equal(Permission.AddReactions);
            });
        });

        describe("SelfPermissions", () => {
            it("should bind required self permissions", () => {
                expect(instance.constraints.selfPermissions).to.be.a("array").and.to.have.length(2);
                expect(instance.constraints.selfPermissions[0]).to.be.an("object").and.to.equal(Permission.Admin);
                expect(instance.constraints.selfPermissions[1]).to.be.an("object").and.to.equal(Permission.BanMembers);
            });
        });
    });

    describe("Commands -> Other", () => {
        describe("DependsOn", () => {
            it("should append command dependencies", () => {
                expect(instance.dependsOn).to.be.a("array").and.to.have.length(2);
                expect(instance.dependsOn[0]).to.be.a("string").and.to.equal("service-name-1");
                expect(instance.dependsOn[1]).to.be.a("string").and.to.equal("service-name-2");
            });
        });

        describe("Connect", () => {
            it("should append command connections", () => {
                expect(instance.connections[0]).to.be.a("function").and.to.equal(testConnection);
            });
        });

        describe("AttachedLogger", () => {
            it("should append the attached logger connection", () => {
                expect(instance.connections[1]).to.be.a("function").and.to.equal(attachedLogger);
            });
        });
    });
});

describe("Utility Decorators", () => {
    describe("Deprecated", () => {
        it("should replace input with a proxy method", () => {
            // TODO
        });
    });
});
