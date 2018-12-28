import {EventEmitter} from "events";
import FragmentLoader, {IPackage, ILivePackage} from "./fragment-loader";
import Command, {DefaultCommandRestrict} from "../commands/command";
import Bot, {InternalCommand} from "../core/bot";
import {IFragment} from "./fragment";
import Service, {ForkedService} from "../services/service";
import Log from "../core/log";

export default class FragmentManager extends EventEmitter {
    protected readonly bot: Bot;

    public constructor(bot: Bot) {
        super();

        this.bot = bot;
    }

    /**
     * Enable and register fragments
     * @param {IFragment[]} packages
     * @param {boolean} [internal=false] Whether the fragments are internal
     * @return {Promise<number>} The amount of enabled fragments
     */
    public async enableMultiple(packages: IPackage[], internal: boolean = false): Promise<number> {
        let enabled: number = 0;

        for (let i: number = 0; i < packages.length; i++) {
            if (await this.enable(packages[i], internal)) {
                enabled++;
            }
        }

        return enabled;
    }

    public prepare<InstanceType extends IFragment>(packg: IPackage): ILivePackage<InstanceType> | null {
        const mod: any = (packg.module as any).prototype;

        if (mod instanceof Command) {
            const command: any = new (packg.module as any)();

            // Overwrite command restrict with default values
            command.restrict = {
                ...DefaultCommandRestrict,
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
                    bot: this.bot,
                    lib: this.bot.getLib()
                })
            };
        }

        return null;
    }

    // TODO: Use .prepare instead of repeating-preparation step here
    public async enable(packg: IPackage, internal: boolean = false, overwrite: boolean = true): Promise<boolean> {
        const mod: IFragment = (packg.module as any).prototype;

        if (mod instanceof Command) {
            const command: Command = new (packg.module as any)();

            // TODO: Repeated below, somehow merge for efficiency.
            if (!FragmentLoader.validate(command)) {
                Log.warn(`[FragmentManager.enable] Refusing to enable fragment with invalid name '${command.meta.name}'; Please note fragment names cannot contain spaces`);
    
                return false;
            }

            // Command is not registered in internal commands
            if (internal && !this.bot.internalCommands.includes(command.meta.name as InternalCommand)) {
                return false;
            }

            // TODO: Add a way to disable the warning
            if (!internal && command.meta.name === "eval") {
                Log.warn("[FragmentManager.enable] Please beware that your eval command may be used in malicious ways and may lead to a full compromise of the local machine. To prevent this from happening, please use the default eval command included with Forge.");
            }

            // Overwrite command restrict with default values
            (command.restrict as any) = {
                ...DefaultCommandRestrict,
                ...command.restrict
            };

            if (await command.enabled()) {
                if (this.bot.commandStore.contains(command.meta.name) && overwrite) {
                    await this.bot.commandStore.remove(command.meta.name, command.aliases);
                }

                await this.bot.commandStore.register({
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
                    bot: this.bot,
                    lib: this.bot.getLib()
                });
            }
            else {
                service = new (packg.module as any);
            }

            service = service as Service | ForkedService;

            // TODO: Repeated below, somehow merge for efficiency.
            if (!FragmentLoader.validate(service)) {
                Log.warn(`[FragmentManager.enable] Refusing to enable fragment with invalid name '${service.meta.name}'; Please note fragment names cannot contain spaces`);
    
                return false;
            }

            await this.bot.services.register(service);

            return true;
        }
        else {
            // TODO: Also add someway to identify the fragment
            Log.warn("[FragmentManager.enable] Unknown fragment instance, ignoring");
        }

        return false;
    }
}