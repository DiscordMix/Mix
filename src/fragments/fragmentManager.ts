import {EventEmitter} from "events";
import Command, {defaultCommandConstraints, IConstraints} from "../commands/command";
import Bot from "../core/bot";
import {InternalCommand} from "../core/botExtra";
import Log from "../core/log";
import {IFragment} from "./fragment";
import Loader, {ILivePackage, IPackage} from "./loader";
import {ForkedService} from "../services/forkedService";
import Service from "../services/service";
import {PromiseOr} from "@atlas/xlib";
import {Mutable} from "../util/helpers";

export interface IFragmentManager extends EventEmitter {
    enableMultiple(packages: IPackage[], internal: boolean): PromiseOr<number>;
    prepare<InstanceType extends IFragment>(packg: IPackage): ILivePackage<InstanceType> | null;
    enable(packg: IPackage, internal: boolean, overwrite: boolean): PromiseOr<boolean>;
}

export default class FragmentManager extends EventEmitter implements IFragmentManager {
    protected readonly bot: Bot;

    public constructor(bot: Bot) {
        super();

        this.bot = bot;
    }

    /**
     * Enable and register fragments.
     * @param {boolean} [internal=false] Whether the provided fragments are internal.
     * @return {Promise<number>} The amount of enabled fragments.
     */
    public async enableMultiple(packages: IPackage[], internal: boolean = false): Promise<number> {
        let enabled: number = 0;

        for (const pckg of packages) {
            if (await this.enable(pckg, internal)) {
                enabled++;
            }
        }

        return enabled;
    }

    public prepare<InstanceType extends IFragment>(packg: IPackage): ILivePackage<InstanceType> | null {
        const mod: any = (packg.module as any).prototype;

        if (mod instanceof Command) {
            const command: any = new (packg.module as any)();

            // Overwrite command restrict with default values.
            command.restrict = {
                ...defaultCommandConstraints,
                ...command.restrict
            };

            return {
                instance: command,
                path: packg.path
            };
        }
        else if (mod instanceof Service || mod instanceof ForkedService) {
            const service: any = packg.module;

            return {
                path: packg.path,

                instance: new service({
                    bot: this.bot
                })
            };
        }

        return null;
    }

    // TODO: Use .prepare instead of repeating-preparation step here.
    public async enable(packg: IPackage, internal: boolean = false, overwrite: boolean = true): Promise<boolean> {
        const mod: IFragment = (packg.module as any).prototype;

        if (mod instanceof Command) {
            const command: Command = new (packg.module as any)();

            // TODO: Repeated below, somehow merge for efficiency.
            if (!Loader.validate(command)) {
                Log.warn(`Refusing to enable fragment with invalid name '${command.meta.name}'; Please note fragment names cannot contain spaces`);

                return false;
            }

            // Command is not registered in internal commands.
            if (internal && !this.bot.internalCommands.includes(command.meta.name as InternalCommand)) {
                return false;
            }

            // Dependency not met (missing required service).
            for (const dependency of command.dependsOn) {
                if (!this.bot.services.contains(dependency)) {
                    return false;
                }
            }

            // TODO: Add a way to disable the warning.
            if (!internal && command.meta.name === "eval") {
                Log.warn("Please beware that your eval command may be used in malicious ways and may lead to a full compromise of the local machine. To prevent this from happening, please use the default eval command included with Mix.");
            }

            // Overwrite command restrict with default values.
            (command.constraints as Mutable<IConstraints>) = {
                ...defaultCommandConstraints,
                ...command.constraints
            };

            if (await command.enabled()) {
                if (this.bot.registry.contains(command.meta.name) && overwrite) {
                    await this.bot.registry.remove(command.meta.name, command.aliases);
                }

                await this.bot.registry.register({
                    instance: command,
                    path: packg.path
                });

                return true;
            }
        }
        else if (mod instanceof Service || mod instanceof ForkedService) {
            let service: Service | ForkedService | null = null;

            if (mod instanceof Service) {
                service = new (packg.module as any)({
                    bot: this.bot
                });
            }
            else {
                service = new (packg.module as any)();
            }

            service = service as Service | ForkedService;

            // TODO: Repeated below, somehow merge for efficiency.
            // TODO: How does validation only validate name? How does the error message justify all the other validation procedures taking place in Loader.validate()?
            if (!Loader.validate(service)) {
                Log.warn(`Refusing to enable fragment with invalid name '${service.meta.name}'; Please note fragment names cannot contain spaces`);

                return false;
            }

            await this.bot.services.register(service);

            return true;
        }
        else {
            // TODO: Also add someway to identify the fragment.
            Log.warn("Unknown fragment instance, ignoring");
        }

        return false;
    }
}
