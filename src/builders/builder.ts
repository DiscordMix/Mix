import {PromiseOr} from "..";

export interface IBuilder<T> {
    build(): PromiseOr<T>;
}
