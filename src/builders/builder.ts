import {PromiseOr} from "../providers/provider";


export interface IBuilder<T> {
    build(): PromiseOr<T>;
}
