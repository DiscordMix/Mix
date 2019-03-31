import Loader, {IPackage} from "./loader";
import {internalFragmentsPath} from "../core/constants";
import BotMessages from "../core/messages";
import Log from "../core/log";
import {IBot} from "../core/botExtra";
import Util from "../util/util";

export interface IMeta {
    readonly name: string;
    readonly description?: string;
    readonly author?: string;
    readonly version?: string;
}

export interface IFragment {
    readonly meta: IMeta;
}

export default class FragmentLoader {
    protected readonly bot: IBot;

    public constructor(bot: IBot) {
        this.bot = bot;
    }

    public async loadInternal(): Promise<IPackage[] | null> {
        Log.verbose("Attempting to load internal fragments");

        // Load & enable internal fragments.
        const internalFragmentCandidates: string[] | null = await Loader.scan(internalFragmentsPath);

        // The scan process failed for some reason.
        if (!internalFragmentCandidates) {
            throw Log.error(BotMessages.SETUP_FAIL_LOAD_FRAGMENTS);
        }

        if (internalFragmentCandidates.length > 0) {
            Log.verbose(`Loading ${internalFragmentCandidates.length} internal fragments`);
        }
        else {
            Log.warn(BotMessages.SETUP_NO_FRAGMENTS_DETECTED);
        }

        const internalFragments: IPackage[] | null = await Loader.loadMultiple(internalFragmentCandidates);

        if (!internalFragments || internalFragments.length === 0) {
            Log.warn(BotMessages.SETUP_NO_FRAGMENTS_LOADED);
        }
        else {
            const enabled: number = await this.bot.fragments.enableMultiple(internalFragments, true);

            if (enabled === 0) {
                Log.warn(BotMessages.SETUP_NO_FRAGMENTS_ENABLED);
            }
            else {
                Log.success(`Enabled ${enabled}/${internalFragments.length} (${Util.percentOf(enabled, internalFragments.length)}%) internal fragments`);
            }
        }

        return internalFragments;
    }

    public async loadServices() {
        // Load & enable services.
        const consumerServiceCandidates: string[] | null = await Loader.scan(this.bot.options.paths.services);

        if (!consumerServiceCandidates || consumerServiceCandidates.length === 0) {
            Log.verbose(`No services were detected under '${this.bot.options.paths.services}'`);
        }
        else {
            Log.verbose(`Loading ${consumerServiceCandidates.length} service(s)`);

            const servicesLoaded: IPackage[] | null = await Loader.loadMultiple(consumerServiceCandidates);

            if (!servicesLoaded || servicesLoaded.length === 0) {
                Log.warn(BotMessages.SETUP_NO_SERVICES_LOADED);
            }
            else {
                Log.success(`Loaded ${servicesLoaded.length} service(s)`);
                await this.bot.fragments.enableMultiple(servicesLoaded, false);
            }
        }

        // After loading services, enable all of them.
        // TODO: Returns amount of enabled services.
        await this.bot.services.startAll();
    }

    public async loadCommands(): Promise<void> {
        // Load & enable consumer command fragments.
        const consumerCommandCandidates: string[] | null = await Loader.scan(this.bot.options.paths.commands);

        if (!consumerCommandCandidates || consumerCommandCandidates.length === 0) {
            Log.warn(`No commands were detected under '${this.bot.options.paths.commands}'`);
        }
        else {
            Log.verbose(`Loading ${consumerCommandCandidates.length} command(s)`);

            const commandsLoaded: IPackage[] | null = await Loader.loadMultiple(consumerCommandCandidates);

            if (!commandsLoaded || commandsLoaded.length === 0) {
                Log.warn(BotMessages.SETUP_NO_COMMANDS_LOADED);
            }
            else {
                const enabled: number = await this.bot.fragments.enableMultiple(commandsLoaded, false);

                if (enabled > 0) {
                    Log.success(`Enabled ${commandsLoaded.length}/${consumerCommandCandidates.length} (${Util.percentOf(commandsLoaded.length, consumerCommandCandidates.length)}%) command(s)`);
                }
                else {
                    Log.warn(BotMessages.SETUP_NO_COMMANDS_ENABLED);
                }
            }
        }
    }

    public async loadTasks(): Promise<void> {
        // Begin loading & enabling tasks. First, unregister all existing ones.
        await this.bot.tasks.unregisterAll();
        Log.verbose(BotMessages.SETUP_LOADING_TASKS);

        const loaded: number = await this.bot.tasks.loadAll(this.bot.options.paths.tasks);

        if (loaded > 0) {
            Log.success(`Loaded ${loaded} task(s)`);

            const enabled: number = this.bot.tasks.enableAll();

            if (enabled > 0) {
                Log.success(`Triggered ${enabled}/${loaded} task(s)`);
            }
            else if (enabled === 0 && loaded > 0) {
                Log.warn(BotMessages.SETUP_NO_TASKS_TRIGGERED);
            }
        }
        else {
            Log.verbose(BotMessages.SETUP_NO_TASKS_FOUND);
        }
    }
}
