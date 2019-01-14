import {DecoratorUtils} from "./decorator-utils";
import {SpecificConstraints, IConstraints, RestrictGroup} from "../commands/command";
import ChatEnv from "../core/chat-env";

export abstract class Constraint {
    public static Env(env: ChatEnv): any {
        return function (target: any, key: string) {
            DecoratorUtils.bind(target);

            return DecoratorUtils.overrideConstraint(target, "environment", env);
        };
    }

    public static Cooldown(time: number): any {
        return function (target: any, key: string) {
            DecoratorUtils.bind(target);

            return DecoratorUtils.overrideConstraint(target, "cooldown", time);
        };
    }

    public static Disabled(target: any): any {
        DecoratorUtils.bind(target);

        return class extends target {
            public readonly isEnabled: boolean = false;
        };
    }

    public static Specific(constraints: SpecificConstraints): any {
        return function (target: any, key: string) {
            DecoratorUtils.bind(target);

            return DecoratorUtils.overrideConstraint(target, "specific", constraints);
        };
    }

    public static IssuerPermissions(...permissions: any[]): any {
        return function (target: any, key: string) {
            DecoratorUtils.bind(target);

            return DecoratorUtils.overrideConstraint(target, "issuerPermissions", permissions);
        };
    }

    public static SelfPermissions(...permissions: any[]): any {
        return function (target: any, key: string) {
            DecoratorUtils.bind(target);

            return DecoratorUtils.overrideConstraint(target, "selfPermissions", permissions);
        };
    }

    public static OwnerOnly(target: any): any {
        DecoratorUtils.bind(target);

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
    return function (target: any, key: string) {
        DecoratorUtils.bind(target);

        return class extends target {
            public readonly constraints: IConstraints = {
                ...this.constraints,
                ...constraints
            };
        };
    };
}
