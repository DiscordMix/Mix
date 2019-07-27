import Event from "./event";

export default interface IFragment<T = any> {
    handle(sender: T, event: Event): void;
}
