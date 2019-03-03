import {PromiseOr} from "@atlas/xlib";

export interface IBuilder<T> {
    build(): PromiseOr<T>;
}
