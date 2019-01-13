import Command, {CommandRunner, TrivialArgType, RestrictGroup} from "../commands/command";
import {Name, Arguments, Description} from "../decorators/general";
import {AttachedLogger, Guards, Connect, DependsOn} from "../decorators/other";
import {describe} from "mocha";
import {expect} from "chai";
import {testBot} from "./test-bot";
import {Deprecated} from "../decorators/utility";
import {Constraint} from "../decorators/constraints";

const testConnection: CommandRunner = (x, args): void => {
    //
};

@Name("mycmd")
@Description("Used for testing")
@AttachedLogger()
@Arguments(
    {
        name: "name",
        type: TrivialArgType.String
    }
)
@Connect(testConnection)
@Guards("testGuard")
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

    public run(): void {
        // ...
    }
}

const instance: MyCommand = new (MyCommand as any)(null as any);

describe("Command Decorators", () => {
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

    it("should have constraints property", () => {
        expect(instance.constraints).to.be.an("object");
        expect(instance.constraints.specific).to.be.an("array");
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
    });

    describe("Constraints", () => {
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

        describe("Guards", () => {
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

    describe("Other", () => {
        describe("DependsOn", () => {
            it("should bind command dependencies", () => {
                expect(instance.dependsOn).to.be.a("array").and.to.have.length(2);
                expect(instance.dependsOn[0]).to.be.a("string").and.to.equal("service-name-1");
                expect(instance.dependsOn[1]).to.be.a("string").and.to.equal("service-name-2");
            });
        });
    });
});

describe("Utility Decorators", () => {
    describe("Deprecated", () => {
        it("should bind a proxy method", () => {
            // TODO
        });
    });
});
