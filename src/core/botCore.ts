import {EventEmitter} from "events";
import {Client} from "discord.js";
import Module from "./module";
import {BotEvent, BotState} from "./botExtra";
import Log from "./log";

export default class BotCore extends EventEmitter {
    /**
     * The internal Discord client.
     */
    public readonly client: Client;

    protected readonly filters: Module[];

    public constructor() {
        super();

        this.client = new Client();
        this.filters = [];
    }

    public use(module: Module): this {
        this.filters.push(module);

        return this;
    }

    /**
     * Connect and login the Discord client.
     */
    public async connect(): Promise<this> {
        this.setState(BotState.Connecting);
        await this.connector.setup();
        Log.verbose("Starting");

        await this.client.login(this.token).catch(async (error: Error) => {
            if (error.message === "Incorrect login details were provided.") {
                Log.error("The provided token is invalid or has been regenerated");
                await this.disconnect();
                process.exit(0);
            }
            else {
                throw error;
            }
        });

        return this;
    }

    /**
     * Disconnect the Discord client.
     */
    public async disconnect(): Promise<this> {
        this.emit(BotEvent.Disconnecting);

        const servicesStopped: number = this.services.size;

        await this.services.stopAll();
        Log.verbose(`Stopped ${servicesStopped} service(s)`);
        await this.dispose();
        await this.client.destroy();

        // Re-create the client for complete reset.
        (this.client as any) = new Client();

        Log.info("Disconnected");
        this.emit(BotEvent.Disconnected);

        return this;
    }
}
