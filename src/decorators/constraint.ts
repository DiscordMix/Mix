import {DecoratorUtils} from "./decoratorUtils";
import {IConstraints, RestrictGroup, ConstraintProp, ConstraintProp, ConstraintProp} from "../commands/command";
import ChatEnv from "../core/chatEnv";
import {DecoratorProxy} from "./component";
import {ExclusiveConstraintDelegate} from "./exclusiveConstraint";

export abstract class Constraint {
    /**
     * Restrict command execution to a certain environment.
     * @param {ChatEnv} env The command execution environment.
     */
    public static environment(env: ChatEnv): DecoratorProxy {
        return function (target: any) {
            DecoratorUtils.ensureFunc(target);

            return DecoratorUtils.overrideConstraint(target, ConstraintProp.Environment, env);
        };
    }

    /**
     * Rate-limit command execution per user.
     * @param {number} time The time between command executions in seconds.
     */
    public static cooldown(time: number): DecoratorProxy {
        return function (target: any) {
            DecoratorUtils.ensureFunc(target);

            return DecoratorUtils.overrideConstraint(target, ConstraintProp.Cooldown, time);
        };
    }

    /**
     * Disable a command and prevent execution.
     */
    public static disabled(target: any): DecoratorProxy {
        DecoratorUtils.ensureFunc(target);

        return class extends target {
            public readonly isEnabled: boolean = false;
        };
    }

    /**
     * Limit command execution to specific groups of users.
     */
    public static userGroup(...groups: RestrictGroup[]): DecoratorProxy {
        return function (target: any) {
            DecoratorUtils.ensureFunc(target);

            return DecoratorUtils.overrideConstraint(target, ConstraintProp.UserGroups, groups);
        };
    }

    /**
     * Limit command execution to specific users,
     * channels, or guilds.
     */
    public static exclusive(...exclusive: ExclusiveConstraintDelegate[]): DecoratorProxy {
        return function (target: any) {
            DecoratorUtils.ensureFunc(target);

            // TODO: ConstraintProp is missing 'exclusive'?
            return DecoratorUtils.overrideConstraint(target, "exclusive", exclusive);
        };
    }

    /**
     * Require certain permission(s) from the issuer.
     * @param {any[]} permissions The permission(s) required.
     */
    public static issuerPermissions(...permissions: any[]): DecoratorProxy {
        return function (target: any) {
            DecoratorUtils.ensureFunc(target);

            return DecoratorUtils.overrideConstraint(target, ConstraintProp.IssuerPermissions, permissions);
        };
    }

    /**
     * Require certain permission(s) from the bot.
     * @param {any[]} permissions The permission(s) required.
     */
    public static selfPermissions(...permissions: any[]): DecoratorProxy {
        return function (target: any) {
            DecoratorUtils.ensureFunc(target);

            return DecoratorUtils.overrideConstraint(target, ConstraintProp.SelfPermissions, permissions);
        };
    }

    /**
     * Limit the command to the bot owner only.
     */
    public static ownerOnly(target: any): DecoratorProxy {
        DecoratorUtils.ensureFunc(target);

        return class extends target {
            public readonly constraints: IConstraints = {
                ...this.constraints,

                userGroups: [
                    ...this.constraints.userGroups,
                    RestrictGroup.BotOwner
                ]
            };
        };
    }

}

export function constraints(values: Partial<IConstraints>): DecoratorProxy {
    return function (target: any) {
        DecoratorUtils.ensureFunc(target);

        return class extends target {
            public readonly constraints: IConstraints = {
                ...this.constraints,
                ...values
            };
        };
    };
}
