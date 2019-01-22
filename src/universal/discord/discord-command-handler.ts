import CommandHandler, {ICommandHandler} from "../../commands/command-handler";
import {IContext} from "../../commands/command-context";
import Command, {RawArguments} from "../../commands/command";

export interface IDiscordCommandHandler extends ICommandHandler {
    //
}

export default class DiscordCommandHandler extends CommandHandler implements IDiscordCommandHandler {
    public async handle(context: IContext, command: Command, rawArgs: RawArguments): Promise<boolean> {
        if (!this.meetsRequirements(context, command, rawArgs)) {
            return false;
        }

        return super.handle(context, command, rawArgs);
    }
}
