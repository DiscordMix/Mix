import {PromiseOr} from "@atlas/xlib";

namespace Builders {
    export interface IBuilder<T> {
        build(): PromiseOr<T>;
    }
}
