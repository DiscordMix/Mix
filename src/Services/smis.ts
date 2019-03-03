import {ChildProcess} from "child_process";
import {EventEmitter} from "events";
import Log from "../Core/Log";
import {IProcessMsg, ProcessMsgType} from "./GenericService";

/**
 * Service Messages Interchange System
 * @extends EventEmitter
 */
export default class SMIS extends EventEmitter {
    protected readonly child: ChildProcess;
    protected readonly timeout: number;

    protected timeoutSource?: NodeJS.Timeout;

    public constructor(child: ChildProcess, timeout: number = 5000) {
        super();

        this.child = child;
        this.timeout = timeout;

        // Setup listeners
        if (!this.child.connected || !this.child.send) {
            throw Log.error("Expecting child to be connected");
        }

        this.child.on("message", (msg: any, sender: any) => {
            this.emit("message", msg, sender);
        });
    }

    public async handshake(): Promise<boolean> {
        // Send the SMIS handshake to start the connection
        const response: IProcessMsg | null = await this.request(ProcessMsgType.SmisProtocolHandshake);

        if (response === null) {
            return false;
        }

        switch (response.type) {
            case ProcessMsgType.SmisProtocolAccept: {
                return true;
            }

            case ProcessMsgType.SmisProtocolRefuse: {
                return false;
            }

            default: {
                Log.warn(`Unexpected handshake response with type '${response.type}'`);

                return false;
            }
        }
    }

    public send(type: ProcessMsgType, msg?: any): Promise<boolean> {
        return new Promise((resolve) => {
            if (!this.child.connected) {
                resolve(false);

                return;
            }

            this.child.send({
                _t: type,
                _d: msg
            }, (error) => {
                if (error) {
                    throw error;
                }

                resolve(true);
            });
        });
    }

    public request<ResponseDataType = any>(type: ProcessMsgType, data?: any): Promise<ResponseDataType | null> {
        return new Promise((resolve, reject) => {
            if (!this.send(type, data)) {
                resolve(null);

                return;
            }

            if (this.timeoutSource) {
                clearTimeout(this.timeoutSource);
            }

            this.timeoutSource = setTimeout(() => {
                reject("timed out");

                return;
            }, this.timeout);

            this.once("message", (msg: any, sender: any) => {
                resolve(msg);
            });
        });
    }
}
