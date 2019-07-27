import IFragment from "./fragment";
import {EventEmitter} from "events";
import Event from "./event";

export default class Router extends EventEmitter {
    protected readonly fragments: IFragment[];

    public constructor() {
        super();

        this.fragments = [];
    }

    public use(...fragments: IFragment<any>[]): void {
        for (const fragment of fragments) {
            this.fragments.push(fragment);
        }
    }

    public trigger(sender: any, event: Event): void {
        for (const fragment of this.fragments) {
            fragment.handle(sender, event);

            if (event.isPrevented) {
                break;
            }
        }
    }
}
