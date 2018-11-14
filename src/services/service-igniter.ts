// Only start if process was spawned
if (!process.send || !process.connected) {
    process.exit(0);
}

import fs from "fs";
import {Log} from "..";
import {ForkedService, IRawProcessMsg, ProcessMsgType} from "./service";
import ServiceManager from "./service-manager";

const args: string[] = process.argv.splice(2);

if (args.length !== 1) {
    throw new Error(`Expecting one (1) argument only, received ${args.length}`);
}

const target: string = args[0];

if (!fs.existsSync(target)) {
    throw new Error("Target file path does not exist");
}

// Start service
const service: ForkedService = new (require(target).default)();
const logPrefix: string = `[ServiceIgniter.${service.meta.name}@${process.pid.toString()}]`;

// Setup process message handler
process.on("message", async (msg: IRawProcessMsg, sender: any) => {
    if (typeof msg !== "object") {
        Log.warn(`${logPrefix} Ignoring message containing non-object as data`);

        return;
    }

    if (typeof msg._t !== "number") {
        Log.warn(`${logPrefix} Ignoring malformed JSON object`);

        return;
    }

    switch(msg._t) {
        case ProcessMsgType.Stop: {
            await stop();

            break;
        }

        default: {
            await service.onMessage({
                data: msg._d,
                type: msg._t
            }, sender);
        }
    }
});

process.on("disconnect", async () => {
    await stop();
});

// Heartbeat loop
let interval: number = ServiceManager.heartbeatTimeout - 1000;

// TODO: Limit in ServiceManager too
if (interval < 1000) {
    interval = 1000;
}

const heartbeatInterval: NodeJS.Timeout = setInterval(() => {
    if (process.send) {
        process.send({
            _t: ProcessMsgType.Heartbeat
        });
    }
    else {
        throw new Error("Process.send is no longer defined or accessible");
    }
}, interval);

async function stop(): Promise<void> {
    clearTimeout(heartbeatInterval);
    await service.stop();
    process.exit(0);
}