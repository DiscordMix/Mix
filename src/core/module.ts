import BotCore from "./botCore";

export default abstract class Module {
    public abstract setup(bot: BotCore): void;
}
