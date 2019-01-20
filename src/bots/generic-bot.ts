import {IBot, InternalCommand, IBotExtraOptions, BotState, IBotOptions} from "../core/bot-extra";
import {ISettings} from "../core/settings";
import Temp from "../core/temp";
import ServiceManager from "../services/service-manager";
import CommandRegistry from "../commands/command-store";
import CommandHandler from "../commands/command-handler";
import ConsoleInterface from "../console/console-interface";
import Language from "../language/language";
import {IArgumentResolver, ICustomArgType} from "../commands/command";
import TaskManager from "../tasks/task-manager";
import {IUniversalClient} from "../universal/universal-client";
import FragmentManager from "../fragments/fragment-manager";
import PathResolver from "../core/path-resolver";
import Store from "../state/store";
import StatCounter from "../core/stat-counter";
import BotConnector from "../core/bot-connector";
import {IDisposable} from "../core/helpers";

export default class GenericBot implements IBot {
    public readonly settings: ISettings;
    public readonly temp: Temp;
    public readonly services: ServiceManager;
    public readonly registry: CommandRegistry;
    public readonly commandHandler: CommandHandler;
    public readonly console: ConsoleInterface;
    public readonly prefixCommand: boolean;
    public readonly internalCommands: InternalCommand[];
    public readonly options: IBotExtraOptions;
    public readonly language?: Language;
    public readonly argumentResolvers: IArgumentResolver[];
    public readonly argumentTypes: ICustomArgType[];
    public readonly disposables: IDisposable[];
    public readonly tasks: TaskManager;
    public readonly timeouts: NodeJS.Timeout[];
    public readonly intervals: NodeJS.Timeout[];
    public readonly languages?: string[];
    public readonly state: BotState;
    public readonly suspended: boolean;
    public readonly client: IUniversalClient;
    public readonly fragments: FragmentManager;
    public readonly paths: PathResolver;
    public readonly store: Store<TState, TActionType>;

    protected setupStart: number = 0;

    // TODO: Implement stat counter
    protected readonly statCounter: StatCounter;

    protected readonly connector: BotConnector;

    public constructor(options: Partial<IBotOptions>) {

    }
}
