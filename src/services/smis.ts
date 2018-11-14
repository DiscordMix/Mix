import {ChildProcess} from "child_process";
import {EventEmitter} from "events";
import { ProcessMsgType } from "..";

// Service Messages Interchange System
export default class SMIS extends EventEmitter {
    private readonly child: ChildProcess;
    private readonly timeout: number;

    private timeoutSource?: NodeJS.Timeout;

    public constructor(child: ChildProcess, timeout: number = 5000) {
        super();

        this.child = child;
        this.timeout = timeout;

        // Setup listeners
        this.child.on("message", (msg: any, sender: any) => {
            this.emit("message", msg, sender);
        });
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