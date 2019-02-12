// Only start if process was spawned.
if (!process.send || !process.connected) {
    process.exit(0);
}

import fs from "fs";
import Log from "../core/log";
import {IForkedService, IRawProcessMsg, ProcessMsgType} from "./generic-service";
import ServiceManager from "./service-manager";

const args: string[] = process.argv.splice(2);

if (args.length !== 1) {
    throw Log.error(`Expecting one (1) argument only, received ${args.length}`);
}

const target: string = args[0];

if (!fs.existsSync(target)) {
    throw Log.error("Target file path does not exist");
}

// Start service.
const service: IForkedService = new (require(target).default)();
const logPrefix: string = `[ServiceIgniter.${service.meta.name}@${process.pid.toString()}]`;

let smisProtocol: boolean = false;

// Setup process message handler.
process.on("message", async (msg: IRawProcessMsg, sender: any) => {
    if (typeof msg !== "object") {
        Log.warn(`${logPrefix} Ignoring message containing non-object as data`);

        return;
    }

    if (typeof msg._t !== "number") {
        Log.warn(`${logPrefix} Ignoring malformed JSON object`);

        return;
    }

    switch (msg._t) {
        case ProcessMsgType.SmisProtocolHandshake: {
            if (!smisProtocol) {
                smisProtocol = true;
                send(ProcessMsgType.SmisProtocolAccept);
            }
            else {
                send(ProcessMsgType.SmisProtocolRefuse);
            }

            break;
        }

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

process.on("disconnect", stop);
process.on("beforeExit", stop);

// Heartbeat loop.
let interval: number = ServiceManager.heartbeatTimeout - 1000;

// TODO: Limit in ServiceManager too.
if (interval < 1000) {
    interval = 1000;
}

const heartbeatInterval: NodeJS.Timeout = setInterval(() => {
    send(ProcessMsgType.Heartbeat);
}, interval);

function send(type: ProcessMsgType, data?: any): void {
    if (process.send && process.connected) {
        process.send({
            _t: type,
            _d: data
        });
    }
    else {
        throw Log.error("Process.send is no longer defined or accessible");
    }
}

async function stop(): Promise<void> {
    clearTimeout(heartbeatInterval);
    await service.stop();
    process.exit(0);
}
