import {DecoratorUtils} from "./decorator-utils";
import {SpecificConstraints, IConstraints, RestrictGroup} from "../commands/command";
import ChatEnv from "../core/chat-env";

export abstract class Constraint {
    /**
     * Restrict command execution to a certain environment.
     * @param env The command execution environment.
     */
    public static Env(env: ChatEnv): any {
        return function (target: any) {
            DecoratorUtils.ensureFunc(target);

            return DecoratorUtils.overrideConstraint(target, "environment", env);
        };
    }

    /**
     * Rate-limit command execution per user.
     * @param time The time between command executions in seconds.
     */
    public static Cooldown(time: number): any {
        return function (target: any) {
            DecoratorUtils.ensureFunc(target);

            return DecoratorUtils.overrideConstraint(target, "cooldown", time);
        };
    }

    /**
     * Disable a command and prevent execution.
     * @param {*} target
     */
    public static Disabled(target: any): any {
        DecoratorUtils.ensureFunc(target);

        return class extends target {
            public readonly isEnabled: boolean = false;
        };
    }

    /**
     * Limit command execution to specific users, channels, or guilds.
     * @param {SpecificConstraints} constraints
     */
    public static Specific(constraints: SpecificConstraints): any {
        return function (target: any) {
            DecoratorUtils.ensureFunc(target);

            return DecoratorUtils.overrideConstraint(target, "specific", constraints);
        };
    }

    /**
     * Require certain permission(s) from the issuer.
     * @param {any[]} permissions The permission(s) required.
     */
    public static IssuerPermissions(...permissions: any[]): any {
        return function (target: any) {
            DecoratorUtils.ensureFunc(target);

            return DecoratorUtils.overrideConstraint(target, "issuerPermissions", permissions);
        };
    }

    /**
     * Require certain permission(s) from the bot.
     * @param {any[]} permissions The permission(s) required.
     */
    public static SelfPermissions(...permissions: any[]): any {
        return function (target: any) {
            DecoratorUtils.ensureFunc(target);

            return DecoratorUtils.overrideConstraint(target, "selfPermissions", permissions);
        };
    }

    /**
     * Limit the command to the bot owner only.
     * @param target
     */
    public static OwnerOnly(target: any): any {
        DecoratorUtils.ensureFunc(target);

        return class extends target {
            public readonly constraints: IConstraints = {
                ...this.constraints,

                specific: [
                    ...this.constraints.specific,
                    RestrictGroup.BotOwner
                ]
            };
        };
    }

}

export function Constraints(constraints: Partial<IConstraints>): any {
    return function (target: any) {
        DecoratorUtils.ensureFunc(target);

        return class extends target {
            public readonly constraints: IConstraints = {
                ...this.constraints,
                ...constraints
            };
        };
    };
}
