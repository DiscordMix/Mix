import fs from "fs";
import {Log} from "..";
import {DetachedService, IRawProcessMsg} from "./service";

const args: string[] = process.argv.splice(2);

if (args.length !== 1) {
    throw new Error(`Expecting one (1) argument only, received ${args.length}`);
}

const target: string = args[0];

if (!fs.existsSync(target)) {
    throw new Error("Such path does not exist");
}

// Start dogarino
const service: DetachedService = new (require(target).default)();

const logPrefix: string = `[ServiceIgniter.${service.meta.name}@${process.pid.toString()}]`;

// Setup process message handler
process.on("message", async (msg: any, sender: any) => {
    const msgString: string = msg.toString();

    if (!msgString.startsWith("{")) {
        Log.warn(`${logPrefix} Ignoring message containing non-JSON object (${msg.length} bytes)`);

        return;
    }

    try {
        const parsedMsg: IRawProcessMsg = JSON.parse(msgString);

        if (typeof parsedMsg._t !== "number") {
            Log.warn(`${logPrefix} Ignoring malformed JSON object (${msg.length} bytes)`);

            return;
        }

        await service.onMessage({
            data: parsedMsg._d,
            type: parsedMsg._t
        }, sender);
    }
    catch (e) {
        Log.warn(`${logPrefix} Ignoring invalid JSON object (${msg.length} bytes)`);
    }
});